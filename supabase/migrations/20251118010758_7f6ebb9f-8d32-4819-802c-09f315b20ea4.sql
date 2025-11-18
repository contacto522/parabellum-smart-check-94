-- Create access_logs table for tracking entry and exit records
CREATE TABLE IF NOT EXISTS public.access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_rut VARCHAR(12) NOT NULL,
  person_name TEXT NOT NULL,
  entry_datetime TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  exit_datetime TIMESTAMP WITH TIME ZONE,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('sin_alertas', 'riesgo_medio', 'riesgo_alto')),
  risk_description TEXT,
  vehicle_plate VARCHAR(10),
  company TEXT,
  observations TEXT,
  entry_notes TEXT,
  plant_name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster searches
CREATE INDEX idx_access_logs_rut ON public.access_logs(person_rut);
CREATE INDEX idx_access_logs_vehicle_plate ON public.access_logs(vehicle_plate);
CREATE INDEX idx_access_logs_company ON public.access_logs(company);
CREATE INDEX idx_access_logs_plant ON public.access_logs(plant_name);
CREATE INDEX idx_access_logs_entry_datetime ON public.access_logs(entry_datetime DESC);

-- Enable RLS
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view access logs
CREATE POLICY "Authenticated users can view access logs"
  ON public.access_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert access logs
CREATE POLICY "Authenticated users can insert access logs"
  ON public.access_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Allow authenticated users to update their own access logs
CREATE POLICY "Authenticated users can update access logs"
  ON public.access_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Create trigger for updating updated_at
CREATE TRIGGER update_access_logs_updated_at
  BEFORE UPDATE ON public.access_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();