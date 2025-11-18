-- Create table for HR queries/consultations
CREATE TABLE public.hr_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  query_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  queried_by UUID NOT NULL,
  person_rut VARCHAR NOT NULL,
  person_name TEXT,
  query_type TEXT NOT NULL, -- 'criminal_record' or 'labor_claims'
  risk_level TEXT NOT NULL, -- 'low', 'medium', 'high'
  risk_description TEXT,
  results_summary JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hr_queries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own queries"
ON public.hr_queries
FOR SELECT
USING (auth.uid() = queried_by OR public.has_role(auth.uid(), 'admin_seguridad'));

CREATE POLICY "Users can insert their own queries"
ON public.hr_queries
FOR INSERT
WITH CHECK (auth.uid() = queried_by);

CREATE POLICY "Users can update their own queries"
ON public.hr_queries
FOR UPDATE
USING (auth.uid() = queried_by);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_hr_queries_updated_at
BEFORE UPDATE ON public.hr_queries
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create index for better query performance
CREATE INDEX idx_hr_queries_rut ON public.hr_queries(person_rut);
CREATE INDEX idx_hr_queries_date ON public.hr_queries(query_date DESC);
CREATE INDEX idx_hr_queries_user ON public.hr_queries(queried_by);