-- Create storage buckets for user uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']),
  ('group-covers', 'group-covers', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to avatars
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Storage policies for group-covers bucket

-- Allow group admins to upload group covers
CREATE POLICY "Group admins can upload group covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'group-covers' AND
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id::text = (storage.foldername(name))[1]
    AND user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Allow group admins to update group covers
CREATE POLICY "Group admins can update group covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'group-covers' AND
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id::text = (storage.foldername(name))[1]
    AND user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Allow group admins to delete group covers
CREATE POLICY "Group admins can delete group covers"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'group-covers' AND
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id::text = (storage.foldername(name))[1]
    AND user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Allow public read access to group covers (for public groups)
CREATE POLICY "Group covers are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'group-covers');


