
-- Create a new storage bucket for private files with appropriate policies
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit)
VALUES ('private-files', 'private-files', TRUE, FALSE, 52428800);

-- Policy: Only authenticated users can upload files to their own folder
CREATE POLICY "Users can upload private files to their own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'private-files' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can access their own private files
CREATE POLICY "Users can access their own private files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'private-files' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own private files
CREATE POLICY "Users can delete their own private files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'private-files' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
