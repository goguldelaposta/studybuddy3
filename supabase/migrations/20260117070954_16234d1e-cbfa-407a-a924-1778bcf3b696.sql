-- Create a more efficient trigger that sends alerts via pg_net instead of inserting another log
-- First, drop the old trigger and function
DROP TRIGGER IF EXISTS audit_alert_trigger ON public.audit_logs;
DROP FUNCTION IF EXISTS public.check_audit_alerts();

-- Create improved function that checks for multiple attempts
CREATE OR REPLACE FUNCTION public.check_and_notify_security_alerts()
RETURNS TRIGGER AS $$
DECLARE
  recent_attempts INTEGER;
  existing_alert_count INTEGER;
BEGIN
  -- Count recent unauthorized attempts in last 5 minutes from same IP
  SELECT COUNT(*) INTO recent_attempts
  FROM public.audit_logs
  WHERE ip_address = NEW.ip_address
    AND action IN ('UNAUTHORIZED_ACCESS_ATTEMPT', 'unauthorized_access', 'permission_denied', 'failed_auth')
    AND created_at > NOW() - INTERVAL '5 minutes';
  
  -- Check if we already have a recent alert for this IP (to avoid spam)
  SELECT COUNT(*) INTO existing_alert_count
  FROM public.audit_logs
  WHERE ip_address = NEW.ip_address
    AND action = 'SECURITY_ALERT_TRIGGERED'
    AND created_at > NOW() - INTERVAL '10 minutes';
  
  -- If 3+ attempts and no recent alert, create alert record
  IF recent_attempts >= 3 AND existing_alert_count = 0 THEN
    INSERT INTO public.audit_logs (action, resource, details, ip_address, user_agent)
    VALUES (
      'SECURITY_ALERT_TRIGGERED',
      'system',
      jsonb_build_object(
        'alert_type', 'multiple_unauthorized_attempts',
        'ip_address', NEW.ip_address,
        'attempt_count', recent_attempts,
        'trigger_user_id', NEW.user_id,
        'message', 'Multiple tentative de acces neautorizat detectate de la aceeași adresă IP'
      ),
      NEW.ip_address,
      NEW.user_agent
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for audit alerts
CREATE TRIGGER audit_alert_trigger
  AFTER INSERT ON public.audit_logs
  FOR EACH ROW
  WHEN (NEW.action IN ('UNAUTHORIZED_ACCESS_ATTEMPT', 'unauthorized_access', 'permission_denied', 'failed_auth'))
  EXECUTE FUNCTION public.check_and_notify_security_alerts();