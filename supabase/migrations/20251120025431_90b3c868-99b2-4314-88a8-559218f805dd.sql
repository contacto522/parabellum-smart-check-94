-- Create table for people involved in security events
CREATE TABLE IF NOT EXISTS public.security_event_people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  person_rut VARCHAR NOT NULL,
  person_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('testigo', 'victima', 'imputado', 'otro')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.security_event_people ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to view
CREATE POLICY "Authenticated users can view event people"
  ON public.security_event_people
  FOR SELECT
  USING (true);

-- Policy for authenticated users to insert
CREATE POLICY "Authenticated users can insert event people"
  ON public.security_event_people
  FOR INSERT
  WITH CHECK (true);

-- Policy for authenticated users to update
CREATE POLICY "Authenticated users can update event people"
  ON public.security_event_people
  FOR UPDATE
  USING (true);

-- Policy for authenticated users to delete
CREATE POLICY "Authenticated users can delete event people"
  ON public.security_event_people
  FOR DELETE
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER handle_updated_at_security_event_people
  BEFORE UPDATE ON public.security_event_people
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();