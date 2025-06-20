
-- Create images table to store image metadata
CREATE TABLE public.images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  content_type TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true);

-- Create policy for public read access to images bucket
CREATE POLICY "Public read access for images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'images');

-- Create policy for public insert access to images bucket
CREATE POLICY "Public insert access for images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'images');

-- Create policy for public update access to images bucket
CREATE POLICY "Public update access for images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'images');

-- Create policy for public delete access to images bucket
CREATE POLICY "Public delete access for images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'images');

-- Enable RLS on images table (but allow public access for now)
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Create policy for public access to images table
CREATE POLICY "Public access to images" 
ON public.images FOR ALL 
USING (true) 
WITH CHECK (true);
