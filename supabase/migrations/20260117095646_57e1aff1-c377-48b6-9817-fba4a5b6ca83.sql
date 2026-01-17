-- Create automated emails log table
CREATE TABLE public.automated_emails_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX idx_automated_emails_user_type ON public.automated_emails_log(user_id, email_type);

-- Enable RLS
ALTER TABLE public.automated_emails_log ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table (for edge functions)
CREATE POLICY "Service role only access"
ON public.automated_emails_log
FOR ALL
USING (false)
WITH CHECK (false);

-- Add comment
COMMENT ON TABLE public.automated_emails_log IS 'Tracks automated marketing emails sent to prevent duplicates';