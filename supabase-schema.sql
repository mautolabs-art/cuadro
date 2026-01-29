-- Cuadro Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (linked to Google auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  picture TEXT,
  income INTEGER DEFAULT 0,
  savings INTEGER DEFAULT 0,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fixed expenses (rent, utilities, etc.)
CREATE TABLE fixed_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  icon TEXT,
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Variable expenses (daily spending)
CREATE TABLE variable_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount INTEGER NOT NULL,
  category TEXT DEFAULT 'Otros',
  expense_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_fixed_expenses_user ON fixed_expenses(user_id);
CREATE INDEX idx_variable_expenses_user ON variable_expenses(user_id);
CREATE INDEX idx_variable_expenses_date ON variable_expenses(expense_date);

-- Row Level Security (RLS) - Users can only see their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE variable_expenses ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (true);

-- Policies for fixed_expenses
CREATE POLICY "Users can view own fixed expenses" ON fixed_expenses
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own fixed expenses" ON fixed_expenses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own fixed expenses" ON fixed_expenses
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own fixed expenses" ON fixed_expenses
  FOR DELETE USING (true);

-- Policies for variable_expenses
CREATE POLICY "Users can view own variable expenses" ON variable_expenses
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own variable expenses" ON variable_expenses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own variable expenses" ON variable_expenses
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own variable expenses" ON variable_expenses
  FOR DELETE USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
