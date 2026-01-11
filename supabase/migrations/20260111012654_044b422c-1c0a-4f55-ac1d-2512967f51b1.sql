-- Create a secure view for announcements that masks contact_info for non-owners
CREATE OR REPLACE VIEW public.announcements_public AS
SELECT 
  id,
  user_id,
  title,
  description,
  category,
  price,
  currency,
  -- Only show contact_info to the owner
  CASE 
    WHEN auth.uid() = user_id THEN contact_info
    ELSE NULL
  END as contact_info,
  university_id,
  image_url,
  is_active,
  expires_at,
  created_at,
  updated_at
FROM public.announcements
WHERE auth.uid() IS NOT NULL;

-- Grant access to the view
GRANT SELECT ON public.announcements_public TO authenticated;

-- Add comment for documentation
COMMENT ON VIEW public.announcements_public IS 'Secure view that masks contact_info for non-owners. Use this view for public queries.';