-- GSSS NextStep — Full Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles enum
CREATE TYPE user_role AS ENUM ('student', 'faculty', 'coordinator', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'readonly', 'deactivated');
CREATE TYPE lor_status AS ENUM ('pending', 'approved', 'rejected', 'withdrawn');
CREATE TYPE placement_status AS ENUM ('placed', 'higher_studies', 'not_placed', 'pending');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'student',
  status user_status NOT NULL DEFAULT 'active',
  -- Student fields
  usn TEXT UNIQUE,
  branch TEXT,
  batch INTEGER,
  -- Faculty fields
  designation TEXT,
  department TEXT,
  -- Common
  phone TEXT,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LOR Requests
CREATE TABLE lor_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id),
  faculty_id UUID NOT NULL REFERENCES users(id),
  purpose TEXT NOT NULL,
  institution_name TEXT,
  program_name TEXT,
  deadline DATE,
  additional_info TEXT,
  -- Files
  sop_url TEXT,
  resume_url TEXT,
  pdf_url TEXT,
  -- Status
  status lor_status NOT NULL DEFAULT 'pending',
  faculty_remarks TEXT,
  decision_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  -- Outcome
  placement_status placement_status,
  company_name TEXT,
  offer_type TEXT,
  package_lpa DECIMAL(5,2),
  program_admitted TEXT,
  outcome_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  lor_id UUID REFERENCES lor_requests(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_lor_student ON lor_requests(student_id);
CREATE INDEX idx_lor_faculty ON lor_requests(faculty_id);
CREATE INDEX idx_lor_status ON lor_requests(status);
CREATE INDEX idx_notif_user ON notifications(user_id);
CREATE INDEX idx_notif_read ON notifications(user_id, read);

-- Auto update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER lor_updated_at BEFORE UPDATE ON lor_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lor_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users RLS: anyone can read, service role bypasses all
CREATE POLICY "Users visible to all authenticated" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON users FOR UPDATE TO authenticated USING (auth.uid() = id);

-- LOR RLS
CREATE POLICY "Students see own LORs" ON lor_requests FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR faculty_id = auth.uid());
CREATE POLICY "Students insert own LORs" ON lor_requests FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());
CREATE POLICY "Faculty update assigned LORs" ON lor_requests FOR UPDATE TO authenticated
  USING (faculty_id = auth.uid() OR student_id = auth.uid());

-- Notifications RLS
CREATE POLICY "Users see own notifications" ON notifications FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Seed: default admin (update email/password after setup)
-- You can create the admin user via Supabase Dashboard > Auth > Users, then run:
-- INSERT INTO users (id, name, email, role) VALUES ('<auth-user-id>', 'Admin', 'admin@gsss.edu', 'admin');
