-- Create newsletter_queue table for scheduled emails
CREATE TABLE public.newsletter_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  send_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.newsletter_queue ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can view all newsletters"
ON public.newsletter_queue
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can create newsletters"
ON public.newsletter_queue
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update newsletters"
ON public.newsletter_queue
FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete newsletters"
ON public.newsletter_queue
FOR DELETE
USING (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_newsletter_queue_updated_at
BEFORE UPDATE ON public.newsletter_queue
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();