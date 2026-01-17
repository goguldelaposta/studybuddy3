-- Rename security_logs to audit_logs and adjust structure
ALTER TABLE public.security_logs RENAME TO audit_logs;

-- Rename column event_type to action for consistency
ALTER TABLE public.audit_logs RENAME COLUMN event_type TO action;

-- Rename column endpoint to resource for consistency  
ALTER TABLE public.audit_logs RENAME COLUMN endpoint TO resource;

-- Rename column request_details to details
ALTER TABLE public.audit_logs RENAME COLUMN request_details TO details;

-- Drop old policies and recreate with new table name
DROP POLICY IF EXISTS "Admins can view security logs" ON public.audit_logs;

CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Drop and recreate indexes with new names
DROP INDEX IF EXISTS idx_security_logs_created_at;
DROP INDEX IF EXISTS idx_security_logs_event_type;
DROP INDEX IF EXISTS idx_security_logs_user_id;

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);

-- Create a function to check for multiple unauthorized attempts and trigger alert
CREATE OR REPLACE FUNCTION public.check_audit_alerts()
RETURNS TRIGGER AS $$
DECLARE
  recent_attempts INTEGER;
  admin_emails TEXT[];
BEGIN
  -- Count recent unauthorized attempts in last 5 minutes from same IP
  SELECT COUNT(*) INTO recent_attempts
  FROM public.audit_logs
  WHERE ip_address = NEW.ip_address
    AND action IN ('UNAUTHORIZED_ACCESS_ATTEMPT', 'unauthorized_access', 'permission_denied')
    AND created_at > NOW() - INTERVAL '5 minutes';
  
  -- If 3+ attempts, mark for alert (will be handled by edge function)
  IF recent_attempts >= 3 THEN
    -- Insert a special alert record
    INSERT INTO public.audit_logs (action, resource, details, ip_address, user_agent)
    VALUES (
      'SECURITY_ALERT_TRIGGERED',
      'system',
      jsonb_build_object(
        'alert_type', 'multiple_unauthorized_attempts',
        'ip_address', NEW.ip_address,
        'attempt_count', recent_attempts,
        'trigger_user_id', NEW.user_id
      ),
      NEW.ip_address,
      NEW.user_agent
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for audit alerts
DROP TRIGGER IF EXISTS audit_alert_trigger ON public.audit_logs;
CREATE TRIGGER audit_alert_trigger
  AFTER INSERT ON public.audit_logs
  FOR EACH ROW
  WHEN (NEW.action IN ('UNAUTHORIZED_ACCESS_ATTEMPT', 'unauthorized_access', 'permission_denied', 'failed_auth'))
  EXECUTE FUNCTION public.check_audit_alerts();