-- Create security_logs table for tracking unauthorized access attempts
CREATE TABLE public.security_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'unauthorized_access', 'failed_auth', 'permission_denied'
  user_id UUID NULL, -- NULL if unauthenticated
  ip_address TEXT NULL,
  user_agent TEXT NULL,
  endpoint TEXT NOT NULL, -- The function/endpoint that was accessed
  request_details JSONB NULL, -- Additional context
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view security logs
CREATE POLICY "Admins can view security logs"
  ON public.security_logs
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Only service role can insert (from edge functions)
-- No INSERT policy for regular users - edge functions use service role

-- Create index for faster queries
CREATE INDEX idx_security_logs_created_at ON public.security_logs(created_at DESC);
CREATE INDEX idx_security_logs_event_type ON public.security_logs(event_type);
CREATE INDEX idx_security_logs_user_id ON public.security_logs(user_id);