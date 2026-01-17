-- Create IP whitelist table
CREATE TABLE IF NOT EXISTS public.ip_whitelist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL UNIQUE,
  description TEXT,
  added_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ip_whitelist_ip ON public.ip_whitelist(ip_address);

-- Enable RLS
ALTER TABLE public.ip_whitelist ENABLE ROW LEVEL SECURITY;

-- Only admins can view whitelisted IPs
CREATE POLICY "Admins can view IP whitelist" 
ON public.ip_whitelist 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Only admins can insert whitelisted IPs
CREATE POLICY "Admins can insert IP whitelist" 
ON public.ip_whitelist 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

-- Only admins can update whitelisted IPs
CREATE POLICY "Admins can update IP whitelist" 
ON public.ip_whitelist 
FOR UPDATE 
USING (is_admin(auth.uid()));

-- Only admins can delete whitelisted IPs
CREATE POLICY "Admins can delete IP whitelist" 
ON public.ip_whitelist 
FOR DELETE 
USING (is_admin(auth.uid()));

-- Create function to check if IP is whitelisted
CREATE OR REPLACE FUNCTION public.is_ip_whitelisted(check_ip TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.ip_whitelist WHERE ip_address = check_ip
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update the check_and_block_ip function to respect whitelist
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
  
  -- Skip if IP is whitelisted
  IF is_ip_whitelisted(NEW.ip_address) THEN
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

-- Enable realtime for blocked_ips table (for push notifications)
ALTER PUBLICATION supabase_realtime ADD TABLE public.blocked_ips;