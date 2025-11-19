-- Create table for alert contacts (WhatsApp numbers)
CREATE TABLE public.alert_contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  phone_number text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.alert_contacts ENABLE ROW LEVEL SECURITY;

-- Policies for alert_contacts
CREATE POLICY "Admin security can view alert contacts"
  ON public.alert_contacts
  FOR SELECT
  USING (has_role(auth.uid(), 'admin_seguridad'));

CREATE POLICY "Admin security can insert alert contacts"
  ON public.alert_contacts
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin_seguridad'));

CREATE POLICY "Admin security can update alert contacts"
  ON public.alert_contacts
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin_seguridad'));

CREATE POLICY "Admin security can delete alert contacts"
  ON public.alert_contacts
  FOR DELETE
  USING (has_role(auth.uid(), 'admin_seguridad'));

-- Trigger for updated_at
CREATE TRIGGER update_alert_contacts_updated_at
  BEFORE UPDATE ON public.alert_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();