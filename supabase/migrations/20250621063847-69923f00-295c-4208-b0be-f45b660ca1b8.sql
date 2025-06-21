
-- First, delete all objects from the images bucket
DELETE FROM storage.objects WHERE bucket_id = 'images';

-- Drop existing storage policies first
DROP POLICY IF EXISTS "Public read access for images" ON storage.objects;
DROP POLICY IF EXISTS "Public insert access for images" ON storage.objects;
DROP POLICY IF EXISTS "Public update access for images" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access for images" ON storage.objects;

-- Now we can safely delete and recreate the bucket
DELETE FROM storage.buckets WHERE id = 'images';
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true);

-- Drop the existing images table
DROP TABLE IF EXISTS public.images CASCADE;

-- Create SexyWoman table to store image metadata
CREATE TABLE public.SexyWoman (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  content_type TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on SexyWoman table (but allow public access for now)
ALTER TABLE public.SexyWoman ENABLE ROW LEVEL SECURITY;

-- Create policy for public access to SexyWoman table
CREATE POLICY "Public access to SexyWoman" 
ON public.SexyWoman FOR ALL 
USING (true) 
WITH CHECK (true);

-- Recreate storage policies
CREATE POLICY "Public read access for images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'images');

CREATE POLICY "Public insert access for images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Public update access for images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'images');

CREATE POLICY "Public delete access for images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'images');
