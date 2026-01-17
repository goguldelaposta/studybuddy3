-- Create blocked_ips table for automatic IP blocking
CREATE TABLE IF NOT EXISTS public.blocked_ips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  blocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  blocked_until TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT NOT NULL DEFAULT 'Too many failed attempts',
  attempt_count INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  unblocked_at TIMESTAMP WITH TIME ZONE,
  unblocked_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_blocked_ips_ip_address ON public.blocked_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_active ON public.blocked_ips(is_active, blocked_until);

-- Enable RLS
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;

-- Only admins can view blocked IPs
CREATE POLICY "Admins can view blocked IPs" 
ON public.blocked_ips 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Only admins can update (unblock) IPs
CREATE POLICY "Admins can update blocked IPs" 
ON public.blocked_ips 
FOR UPDATE 
USING (is_admin(auth.uid()));

-- Service role can insert blocked IPs (from edge functions)
CREATE POLICY "Service role can insert blocked IPs"
ON public.blocked_ips
FOR INSERT
WITH CHECK (true);

-- Create function to check and block IPs after 10 failed attempts in 1 hour
CREATE OR REPLACE FUNCTION public.check_and_block_ip()
RETURNS TRIGGER AS $$
DECLARE
  attempt_count INTEGER;
  one_hour_ago TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Only check for unauthorized access attempts
  IF NEW.action NOT IN ('UNAUTHORIZED_ACCESS_ATTEMPT', 'failed_auth') THEN
    RETURN NEW;
  END IF;
  
  -- Skip if IP is unknown
  IF NEW.ip_address IS NULL OR NEW.ip_address = 'unknown' THEN
    RETURN NEW;
  END IF;
  
  one_hour_ago := NOW() - INTERVAL '1 hour';
  
  -- Count failed attempts from this IP in the last hour
  SELECT COUNT(*) INTO attempt_count
  FROM public.audit_logs
  WHERE ip_address = NEW.ip_address
    AND action IN ('UNAUTHORIZED_ACCESS_ATTEMPT', 'failed_auth')
    AND created_at > one_hour_ago;
  
  -- If 10 or more attempts, block the IP for 24 hours
  IF attempt_count >= 10 THEN
    -- Check if IP is already blocked
    IF NOT EXISTS (
      SELECT 1 FROM public.blocked_ips 
      WHERE ip_address = NEW.ip_address 
        AND is_active = true 
        AND blocked_until > NOW()
    ) THEN
      -- Block the IP for 24 hours
      INSERT INTO public.blocked_ips (ip_address, blocked_until, attempt_count, reason)
      VALUES (
        NEW.ip_address, 
        NOW() + INTERVAL '24 hours', 
        attempt_count,
        'Automatic block: 10+ failed attempts within 1 hour'
      );
      
      -- Log the blocking action
      INSERT INTO public.audit_logs (action, resource, ip_address, details)
      VALUES (
        'IP_BLOCKED',
        'automatic_security',
        NEW.ip_address,
        jsonb_build_object(
          'attempt_count', attempt_count,
          'blocked_for', '24 hours',
          'trigger_log_id', NEW.id
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic IP blocking
DROP TRIGGER IF EXISTS check_ip_blocking_trigger ON public.audit_logs;
CREATE TRIGGER check_ip_blocking_trigger
AFTER INSERT ON public.audit_logs
FOR EACH ROW
EXECUTE FUNCTION public.check_and_block_ip();

-- Create function to check if an IP is blocked
CREATE OR REPLACE FUNCTION public.is_ip_blocked(check_ip TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.blocked_ips 
    WHERE ip_address = check_ip 
      AND is_active = true 
      AND blocked_until > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Enable pg_cron and pg_net extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;