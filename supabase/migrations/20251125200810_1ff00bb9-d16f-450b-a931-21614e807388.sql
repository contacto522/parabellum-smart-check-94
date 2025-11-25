-- Create table for monitored employees
CREATE TABLE public.monitored_employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  rut VARCHAR(12) NOT NULL UNIQUE,
  plant_name TEXT NOT NULL,
  position TEXT,
  phone_number TEXT,
  email TEXT,
  alert_status TEXT NOT NULL DEFAULT 'normal' CHECK (alert_status IN ('normal', 'alert')),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  last_location_update TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.monitored_employees ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view monitored employees"
  ON public.monitored_employees
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert monitored employees"
  ON public.monitored_employees
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update monitored employees"
  ON public.monitored_employees
  FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Authenticated users can delete monitored employees"
  ON public.monitored_employees
  FOR DELETE
  USING (auth.uid() = created_by);

-- Create trigger for updated_at
CREATE TRIGGER update_monitored_employees_updated_at
  BEFORE UPDATE ON public.monitored_employees
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create table for employee alerts
CREATE TABLE public.employee_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.monitored_employees(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  description TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employee_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for alerts
CREATE POLICY "Authenticated users can view employee alerts"
  ON public.employee_alerts
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert employee alerts"
  ON public.employee_alerts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update employee alerts"
  ON public.employee_alerts
  FOR UPDATE
  USING (true);