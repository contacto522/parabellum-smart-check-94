-- Create table for team members
CREATE TABLE public.team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  rut varchar NOT NULL UNIQUE,
  email text NOT NULL,
  role app_role NOT NULL,
  monthly_credit_limit integer NOT NULL DEFAULT 1000,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create policies for team_members
CREATE POLICY "Admin security can view team members"
  ON public.team_members
  FOR SELECT
  USING (has_role(auth.uid(), 'admin_seguridad'::app_role));

CREATE POLICY "Admin security can insert team members"
  ON public.team_members
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin_seguridad'::app_role));

CREATE POLICY "Admin security can update team members"
  ON public.team_members
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin_seguridad'::app_role));

CREATE POLICY "Admin security can delete team members"
  ON public.team_members
  FOR DELETE
  USING (has_role(auth.uid(), 'admin_seguridad'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();