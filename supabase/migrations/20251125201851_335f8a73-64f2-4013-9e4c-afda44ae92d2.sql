-- Add photo_url column to monitored_employees table
ALTER TABLE public.monitored_employees
ADD COLUMN photo_url TEXT;

-- Create storage bucket for employee photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('employee-photos', 'employee-photos', true);

-- RLS policies for employee photos bucket
CREATE POLICY "Anyone can view employee photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'employee-photos');

CREATE POLICY "Authenticated users can upload employee photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'employee-photos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update employee photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'employee-photos');

CREATE POLICY "Authenticated users can delete employee photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'employee-photos');