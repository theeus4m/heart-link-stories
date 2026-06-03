-- RLS policies for gift-photos bucket (files organized as {user_id}/{filename})

CREATE POLICY "Users can upload their own gift photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gift-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can read their own gift photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'gift-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own gift photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'gift-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own gift photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'gift-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
