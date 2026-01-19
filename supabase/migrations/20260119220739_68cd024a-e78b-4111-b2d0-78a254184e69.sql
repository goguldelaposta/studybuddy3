-- Fix search_path on validate_note_content function
CREATE OR REPLACE FUNCTION public.validate_note_content()
RETURNS TRIGGER AS $$
BEGIN
  -- At least one of file_url or content must be provided
  IF NEW.file_url IS NULL AND NEW.content IS NULL THEN
    RAISE EXCEPTION 'A note must have either a file_url or content (markdown)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;