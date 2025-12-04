CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin_seguridad',
    'recursos_humanos',
    'seguridad'
);


--
-- Name: get_user_roles(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_roles(_user_id uuid) RETURNS SETOF public.app_role
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre_completo)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', '')
  );
  RETURN NEW;
END;
$$;


--
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


SET default_table_access_method = heap;

--
-- Name: access_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.access_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    person_rut character varying(12) NOT NULL,
    person_name text NOT NULL,
    entry_datetime timestamp with time zone DEFAULT now() NOT NULL,
    exit_datetime timestamp with time zone,
    risk_level text NOT NULL,
    risk_description text,
    vehicle_plate character varying(10),
    company text,
    observations text,
    entry_notes text,
    plant_name text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT access_logs_risk_level_check CHECK ((risk_level = ANY (ARRAY['sin_alertas'::text, 'riesgo_medio'::text, 'riesgo_alto'::text])))
);


--
-- Name: alert_contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alert_contacts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    phone_number text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid
);


--
-- Name: blocked_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blocked_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    person_rut character varying NOT NULL,
    person_name text,
    block_reason text NOT NULL,
    blocked_date timestamp with time zone DEFAULT now() NOT NULL,
    blocked_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: employee_alerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_alerts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_id uuid NOT NULL,
    alert_type text NOT NULL,
    description text NOT NULL,
    latitude numeric(10,8),
    longitude numeric(11,8),
    is_resolved boolean DEFAULT false NOT NULL,
    resolved_at timestamp with time zone,
    resolved_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    audio_url text,
    audio_transcript text,
    location_link text,
    incident_category text,
    custom_description text
);


--
-- Name: hr_queries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hr_queries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    query_date timestamp with time zone DEFAULT now() NOT NULL,
    queried_by uuid NOT NULL,
    person_rut character varying NOT NULL,
    person_name text,
    query_type text NOT NULL,
    risk_level text NOT NULL,
    risk_description text,
    results_summary jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    delito text,
    numero_causa text,
    tribunal text,
    situacion_legal text,
    CONSTRAINT hr_queries_situacion_legal_check CHECK ((situacion_legal = ANY (ARRAY['libre'::text, 'privado_libertad'::text])))
);


--
-- Name: monitored_employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.monitored_employees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    rut character varying(12) NOT NULL,
    plant_name text NOT NULL,
    "position" text,
    phone_number text,
    email text,
    alert_status text DEFAULT 'normal'::text NOT NULL,
    latitude numeric(10,8),
    longitude numeric(11,8),
    last_location_update timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    photo_url text,
    CONSTRAINT monitored_employees_alert_status_check CHECK ((alert_status = ANY (ARRAY['normal'::text, 'alert'::text])))
);


--
-- Name: plant_access_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plant_access_accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    account_email text NOT NULL,
    account_name text NOT NULL,
    plant_name text NOT NULL,
    can_scan_id boolean DEFAULT true NOT NULL,
    can_control_access boolean DEFAULT true NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    nombre_completo text,
    empresa text,
    area text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: security_event_people; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.security_event_people (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    person_rut character varying NOT NULL,
    person_name text NOT NULL,
    role text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT security_event_people_role_check CHECK ((role = ANY (ARRAY['testigo'::text, 'victima'::text, 'imputado'::text, 'otro'::text])))
);


--
-- Name: team_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.team_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    rut character varying NOT NULL,
    email text NOT NULL,
    role public.app_role NOT NULL,
    monthly_credit_limit integer DEFAULT 1000 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: access_logs access_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.access_logs
    ADD CONSTRAINT access_logs_pkey PRIMARY KEY (id);


--
-- Name: alert_contacts alert_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alert_contacts
    ADD CONSTRAINT alert_contacts_pkey PRIMARY KEY (id);


--
-- Name: blocked_users blocked_users_person_rut_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocked_users
    ADD CONSTRAINT blocked_users_person_rut_key UNIQUE (person_rut);


--
-- Name: blocked_users blocked_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocked_users
    ADD CONSTRAINT blocked_users_pkey PRIMARY KEY (id);


--
-- Name: employee_alerts employee_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_alerts
    ADD CONSTRAINT employee_alerts_pkey PRIMARY KEY (id);


--
-- Name: hr_queries hr_queries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hr_queries
    ADD CONSTRAINT hr_queries_pkey PRIMARY KEY (id);


--
-- Name: monitored_employees monitored_employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monitored_employees
    ADD CONSTRAINT monitored_employees_pkey PRIMARY KEY (id);


--
-- Name: monitored_employees monitored_employees_rut_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monitored_employees
    ADD CONSTRAINT monitored_employees_rut_key UNIQUE (rut);


--
-- Name: plant_access_accounts plant_access_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plant_access_accounts
    ADD CONSTRAINT plant_access_accounts_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: security_event_people security_event_people_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_event_people
    ADD CONSTRAINT security_event_people_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_rut_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_rut_key UNIQUE (rut);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: idx_access_logs_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_access_logs_company ON public.access_logs USING btree (company);


--
-- Name: idx_access_logs_entry_datetime; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_access_logs_entry_datetime ON public.access_logs USING btree (entry_datetime DESC);


--
-- Name: idx_access_logs_plant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_access_logs_plant ON public.access_logs USING btree (plant_name);


--
-- Name: idx_access_logs_rut; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_access_logs_rut ON public.access_logs USING btree (person_rut);


--
-- Name: idx_access_logs_vehicle_plate; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_access_logs_vehicle_plate ON public.access_logs USING btree (vehicle_plate);


--
-- Name: idx_hr_queries_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hr_queries_date ON public.hr_queries USING btree (query_date DESC);


--
-- Name: idx_hr_queries_person_rut; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hr_queries_person_rut ON public.hr_queries USING btree (person_rut);


--
-- Name: idx_hr_queries_query_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hr_queries_query_date ON public.hr_queries USING btree (query_date DESC);


--
-- Name: idx_hr_queries_rut; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hr_queries_rut ON public.hr_queries USING btree (person_rut);


--
-- Name: idx_hr_queries_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hr_queries_user ON public.hr_queries USING btree (queried_by);


--
-- Name: security_event_people handle_updated_at_security_event_people; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_updated_at_security_event_people BEFORE UPDATE ON public.security_event_people FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: profiles set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: access_logs update_access_logs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_access_logs_updated_at BEFORE UPDATE ON public.access_logs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: alert_contacts update_alert_contacts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_alert_contacts_updated_at BEFORE UPDATE ON public.alert_contacts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: blocked_users update_blocked_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_blocked_users_updated_at BEFORE UPDATE ON public.blocked_users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: hr_queries update_hr_queries_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_hr_queries_updated_at BEFORE UPDATE ON public.hr_queries FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: monitored_employees update_monitored_employees_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_monitored_employees_updated_at BEFORE UPDATE ON public.monitored_employees FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: plant_access_accounts update_plant_access_accounts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_plant_access_accounts_updated_at BEFORE UPDATE ON public.plant_access_accounts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: team_members update_team_members_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: access_logs access_logs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.access_logs
    ADD CONSTRAINT access_logs_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: alert_contacts alert_contacts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alert_contacts
    ADD CONSTRAINT alert_contacts_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: blocked_users blocked_users_blocked_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocked_users
    ADD CONSTRAINT blocked_users_blocked_by_fkey FOREIGN KEY (blocked_by) REFERENCES auth.users(id);


--
-- Name: employee_alerts employee_alerts_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_alerts
    ADD CONSTRAINT employee_alerts_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.monitored_employees(id) ON DELETE CASCADE;


--
-- Name: employee_alerts employee_alerts_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_alerts
    ADD CONSTRAINT employee_alerts_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES auth.users(id);


--
-- Name: monitored_employees monitored_employees_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monitored_employees
    ADD CONSTRAINT monitored_employees_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: plant_access_accounts plant_access_accounts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plant_access_accounts
    ADD CONSTRAINT plant_access_accounts_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: team_members team_members_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: alert_contacts Admin security can delete alert contacts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin security can delete alert contacts" ON public.alert_contacts FOR DELETE USING (public.has_role(auth.uid(), 'admin_seguridad'::public.app_role));


--
-- Name: plant_access_accounts Admin security can delete plant access accounts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin security can delete plant access accounts" ON public.plant_access_accounts FOR DELETE USING (public.has_role(auth.uid(), 'admin_seguridad'::public.app_role));


--
-- Name: team_members Admin security can delete team members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin security can delete team members" ON public.team_members FOR DELETE USING (public.has_role(auth.uid(), 'admin_seguridad'::public.app_role));


--
-- Name: alert_contacts Admin security can insert alert contacts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin security can insert alert contacts" ON public.alert_contacts FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin_seguridad'::public.app_role));


--
-- Name: plant_access_accounts Admin security can insert plant access accounts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin security can insert plant access accounts" ON public.plant_access_accounts FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin_seguridad'::public.app_role));


--
-- Name: team_members Admin security can insert team members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin security can insert team members" ON public.team_members FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin_seguridad'::public.app_role));


--
-- Name: alert_contacts Admin security can update alert contacts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin security can update alert contacts" ON public.alert_contacts FOR UPDATE USING (public.has_role(auth.uid(), 'admin_seguridad'::public.app_role));


--
-- Name: plant_access_accounts Admin security can update plant access accounts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin security can update plant access accounts" ON public.plant_access_accounts FOR UPDATE USING (public.has_role(auth.uid(), 'admin_seguridad'::public.app_role));


--
-- Name: team_members Admin security can update team members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin security can update team members" ON public.team_members FOR UPDATE USING (public.has_role(auth.uid(), 'admin_seguridad'::public.app_role));


--
-- Name: alert_contacts Admin security can view alert contacts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin security can view alert contacts" ON public.alert_contacts FOR SELECT USING (public.has_role(auth.uid(), 'admin_seguridad'::public.app_role));


--
-- Name: plant_access_accounts Admin security can view plant access accounts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin security can view plant access accounts" ON public.plant_access_accounts FOR SELECT USING (public.has_role(auth.uid(), 'admin_seguridad'::public.app_role));


--
-- Name: team_members Admin security can view team members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin security can view team members" ON public.team_members FOR SELECT USING (public.has_role(auth.uid(), 'admin_seguridad'::public.app_role));


--
-- Name: blocked_users Authenticated users can delete blocked users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete blocked users" ON public.blocked_users FOR DELETE TO authenticated USING ((auth.uid() = blocked_by));


--
-- Name: security_event_people Authenticated users can delete event people; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete event people" ON public.security_event_people FOR DELETE USING (true);


--
-- Name: monitored_employees Authenticated users can delete monitored employees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete monitored employees" ON public.monitored_employees FOR DELETE USING ((auth.uid() = created_by));


--
-- Name: access_logs Authenticated users can insert access logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert access logs" ON public.access_logs FOR INSERT TO authenticated WITH CHECK ((auth.uid() = created_by));


--
-- Name: blocked_users Authenticated users can insert blocked users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert blocked users" ON public.blocked_users FOR INSERT TO authenticated WITH CHECK ((auth.uid() = blocked_by));


--
-- Name: employee_alerts Authenticated users can insert employee alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert employee alerts" ON public.employee_alerts FOR INSERT WITH CHECK (true);


--
-- Name: security_event_people Authenticated users can insert event people; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert event people" ON public.security_event_people FOR INSERT WITH CHECK (true);


--
-- Name: monitored_employees Authenticated users can insert monitored employees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert monitored employees" ON public.monitored_employees FOR INSERT WITH CHECK ((auth.uid() = created_by));


--
-- Name: access_logs Authenticated users can update access logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update access logs" ON public.access_logs FOR UPDATE TO authenticated USING ((auth.uid() = created_by)) WITH CHECK ((auth.uid() = created_by));


--
-- Name: blocked_users Authenticated users can update blocked users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update blocked users" ON public.blocked_users FOR UPDATE TO authenticated USING ((auth.uid() = blocked_by));


--
-- Name: employee_alerts Authenticated users can update employee alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update employee alerts" ON public.employee_alerts FOR UPDATE USING (true);


--
-- Name: security_event_people Authenticated users can update event people; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update event people" ON public.security_event_people FOR UPDATE USING (true);


--
-- Name: monitored_employees Authenticated users can update monitored employees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update monitored employees" ON public.monitored_employees FOR UPDATE USING ((auth.uid() = created_by));


--
-- Name: access_logs Authenticated users can view access logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view access logs" ON public.access_logs FOR SELECT TO authenticated USING (true);


--
-- Name: blocked_users Authenticated users can view blocked users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view blocked users" ON public.blocked_users FOR SELECT TO authenticated USING (true);


--
-- Name: employee_alerts Authenticated users can view employee alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view employee alerts" ON public.employee_alerts FOR SELECT USING (true);


--
-- Name: security_event_people Authenticated users can view event people; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view event people" ON public.security_event_people FOR SELECT USING (true);


--
-- Name: monitored_employees Authenticated users can view monitored employees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view monitored employees" ON public.monitored_employees FOR SELECT USING (true);


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: hr_queries Users can insert their own queries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own queries" ON public.hr_queries FOR INSERT WITH CHECK ((auth.uid() = queried_by));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: hr_queries Users can update their own queries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own queries" ON public.hr_queries FOR UPDATE USING ((auth.uid() = queried_by));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: user_roles Users can view own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: hr_queries Users can view their own queries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own queries" ON public.hr_queries FOR SELECT USING (((auth.uid() = queried_by) OR public.has_role(auth.uid(), 'admin_seguridad'::public.app_role)));


--
-- Name: access_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: alert_contacts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.alert_contacts ENABLE ROW LEVEL SECURITY;

--
-- Name: blocked_users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

--
-- Name: employee_alerts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.employee_alerts ENABLE ROW LEVEL SECURITY;

--
-- Name: hr_queries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.hr_queries ENABLE ROW LEVEL SECURITY;

--
-- Name: monitored_employees; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.monitored_employees ENABLE ROW LEVEL SECURITY;

--
-- Name: plant_access_accounts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.plant_access_accounts ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: security_event_people; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.security_event_people ENABLE ROW LEVEL SECURITY;

--
-- Name: team_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


