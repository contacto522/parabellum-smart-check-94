-- Create table for plant access accounts
CREATE TABLE public.plant_access_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_email text NOT NULL,
  account_name text NOT NULL,
  plant_name text NOT NULL,
  can_scan_id boolean NOT NULL DEFAULT true,
  can_control_access boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plant_access_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_seguridad role
CREATE POLICY "Admin security can view plant access accounts"
  ON public.plant_access_accounts
  FOR SELECT
  USING (has_role(auth.uid(), 'admin_seguridad'));

CREATE POLICY "Admin security can insert plant access accounts"
  ON public.plant_access_accounts
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin_seguridad'));

CREATE POLICY "Admin security can update plant access accounts"
  ON public.plant_access_accounts
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin_seguridad'));

CREATE POLICY "Admin security can delete plant access accounts"
  ON public.plant_access_accounts
  FOR DELETE
  USING (has_role(auth.uid(), 'admin_seguridad'));

-- Create trigger for updated_at
CREATE TRIGGER update_plant_access_accounts_updated_at
  BEFORE UPDATE ON public.plant_access_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();