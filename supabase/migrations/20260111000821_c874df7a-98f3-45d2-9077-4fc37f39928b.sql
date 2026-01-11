-- Create storage bucket for announcement images
INSERT INTO storage.buckets (id, name, public)
VALUES ('announcement-images', 'announcement-images', true);

-- Allow authenticated users to upload images
CREATE POLICY "Users can upload announcement images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'announcement-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow anyone to view announcement images (public bucket)
CREATE POLICY "Anyone can view announcement images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'announcement-images');

-- Allow users to update their own images
CREATE POLICY "Users can update own announcement images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'announcement-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete own announcement images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'announcement-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);