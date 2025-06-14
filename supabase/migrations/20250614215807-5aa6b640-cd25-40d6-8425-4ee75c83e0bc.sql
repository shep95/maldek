
-- Update the private-files bucket to allow up to 4GB file size limit
UPDATE storage.buckets 
SET file_size_limit = 4294967296  -- 4GB in bytes (4 * 1024 * 1024 * 1024)
WHERE id = 'private-files';
