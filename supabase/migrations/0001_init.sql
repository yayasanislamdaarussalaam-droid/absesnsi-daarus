-- Supabase Attendance Migration - Run in Supabase SQL Editor

-- 1. Enable UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create offices table
CREATE TABLE IF NOT EXISTS public.offices (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  qr_code_token text UNIQUE NOT NULL,
  standard_clock_in time DEFAULT '09:00',
  standard_clock_out time DEFAULT '17:00',
  work_duration_minutes integer DEFAULT 480,
  timezone text DEFAULT 'Asia/Jakarta',
  created_at timestamptz DEFAULT now()
);

-- 3. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  office_id uuid REFERENCES public.offices(id),
  role text DEFAULT 'employee' CHECK (role IN ('employee', 'admin')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 4. Create devices table
CREATE TABLE IF NOT EXISTS public.devices (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  fingerprint text NOT NULL,
  user_agent text,
  last_seen_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 5. Create attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  office_id uuid REFERENCES public.offices(id),
  date date NOT NULL,
  clock_in_at timestamptz,
  clock_out_at timestamptz,
  minutes_late integer DEFAULT 0,
  status text CHECK (status IN ('on_time', 'late', 'absent', 'incomplete')),
  device_id uuid REFERENCES public.devices(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, office_id, date)
);

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON public.attendance(user_id, date);

-- 7. Enable RLS
ALTER TABLE public.offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- 8. Simple policies (drop existing first)
DROP POLICY IF EXISTS "Offices viewable" ON public.offices;
DROP POLICY IF EXISTS "Offices editable" ON public.offices;
DROP POLICY IF EXISTS "View own profile" ON public.profiles;
DROP POLICY IF EXISTS "Update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin view profiles" ON public.profiles;
DROP POLICY IF EXISTS "View own devices" ON public.devices;
DROP POLICY IF EXISTS "Insert own devices" ON public.devices;
DROP POLICY IF EXISTS "View own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Insert own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Update own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admin view attendance" ON public.attendance;

-- 9. Create policies
CREATE POLICY "Offices viewable" ON public.offices FOR SELECT
  USING (true);

CREATE POLICY "Offices editable" ON public.offices FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "View own profile" ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admin view profiles" ON public.profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "View own devices" ON public.devices FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Insert own devices" ON public.devices FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "View own attendance" ON public.attendance FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Insert own attendance" ON public.attendance FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Update own attendance" ON public.attendance FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admin view attendance" ON public.attendance FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 10. Function for new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    'employee',
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 11. Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. Seed office
INSERT INTO public.offices (name, qr_code_token, standard_clock_in, standard_clock_out, work_duration_minutes)
VALUES ('Daarus Office', replace(uuid_generate_v4()::text, '-', ''), '09:00', '17:00', 480)
ON CONFLICT DO NOTHING;
