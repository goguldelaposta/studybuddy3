-- Add content column for rich text/markdown notes
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS content TEXT;

-- Add a check constraint to ensure notes have either file_url OR content (or both)
-- Using a trigger instead of CHECK constraint for better flexibility
CREATE OR REPLACE FUNCTION validate_note_content()
RETURNS TRIGGER AS $$
BEGIN
  -- At least one of file_url or content must be provided
  IF NEW.file_url IS NULL AND NEW.content IS NULL THEN
    RAISE EXCEPTION 'A note must have either a file_url or content (markdown)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate on insert/update
DROP TRIGGER IF EXISTS validate_note_content_trigger ON public.notes;
CREATE TRIGGER validate_note_content_trigger
  BEFORE INSERT OR UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION validate_note_content();