-- Create storage bucket for emergency audio recordings
INSERT INTO storage.buckets (id, name, public)
VALUES ('emergency-audio', 'emergency-audio', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for emergency audio bucket
CREATE POLICY "Authenticated users can upload emergency audio"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'emergency-audio' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Admin security can view emergency audio"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'emergency-audio' 
  AND (
    SELECT has_role(auth.uid(), 'admin_seguridad'::app_role)
  )
);

-- Add new columns to employee_alerts table
ALTER TABLE public.employee_alerts
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS audio_transcript TEXT,
ADD COLUMN IF NOT EXISTS location_link TEXT,
ADD COLUMN IF NOT EXISTS incident_category TEXT,
ADD COLUMN IF NOT EXISTS custom_description TEXT;