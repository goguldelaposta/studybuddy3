-- Create newsletter templates table
CREATE TABLE public.newsletter_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.newsletter_templates ENABLE ROW LEVEL SECURITY;

-- Only admins can manage templates
CREATE POLICY "Admins can view templates"
  ON public.newsletter_templates
  FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can create templates"
  ON public.newsletter_templates
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update templates"
  ON public.newsletter_templates
  FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete templates"
  ON public.newsletter_templates
  FOR DELETE
  USING (is_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_newsletter_templates_updated_at
  BEFORE UPDATE ON public.newsletter_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();