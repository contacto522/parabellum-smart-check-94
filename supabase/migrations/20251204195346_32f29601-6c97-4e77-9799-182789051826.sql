-- Fix employee_alerts RLS policies to restrict to admin_seguridad role

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view employee alerts" ON employee_alerts;
DROP POLICY IF EXISTS "Authenticated users can insert employee alerts" ON employee_alerts;
DROP POLICY IF EXISTS "Authenticated users can update employee alerts" ON employee_alerts;

-- Create new restricted policies for admin_seguridad role
CREATE POLICY "Admin security can view employee alerts" ON employee_alerts
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin_seguridad'::app_role));

CREATE POLICY "Admin security can insert employee alerts" ON employee_alerts
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin_seguridad'::app_role));

CREATE POLICY "Admin security can update employee alerts" ON employee_alerts
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin_seguridad'::app_role));