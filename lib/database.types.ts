// Tipos de la base de datos de Supabase para Cuadro
// Este archivo define la estructura de las tablas

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          monthly_income: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          monthly_income: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          monthly_income?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      fixed_expenses: {
        Row: {
          id: string
          user_id: string
          expense_type: string
          name: string
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          expense_type: string
          name: string
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          expense_type?: string
          name?: string
          amount?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fixed_expenses_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      savings: {
        Row: {
          id: string
          user_id: string
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "savings_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      legal_consents: {
        Row: {
          id: string
          user_id: string
          terms_accepted: boolean
          privacy_accepted: boolean
          not_financial_advisor_accepted: boolean
          accepted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          terms_accepted: boolean
          privacy_accepted: boolean
          not_financial_advisor_accepted: boolean
          accepted_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          terms_accepted?: boolean
          privacy_accepted?: boolean
          not_financial_advisor_accepted?: boolean
          accepted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_consents_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Tipos de conveniencia para usar en la app
export type User = Database['public']['Tables']['users']['Row']
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type FixedExpense = Database['public']['Tables']['fixed_expenses']['Row']
export type Savings = Database['public']['Tables']['savings']['Row']
export type LegalConsent = Database['public']['Tables']['legal_consents']['Row']

// Tipos para insercion
export type InsertUserProfile = Database['public']['Tables']['user_profiles']['Insert']
export type InsertFixedExpense = Database['public']['Tables']['fixed_expenses']['Insert']
export type InsertSavings = Database['public']['Tables']['savings']['Insert']
export type InsertLegalConsent = Database['public']['Tables']['legal_consents']['Insert']

/*
SQL para crear las tablas en Supabase:

-- Tabla de perfiles de usuario
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  monthly_income NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de gastos fijos
CREATE TABLE fixed_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  expense_type TEXT NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ahorros
CREATE TABLE savings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de consentimientos legales
CREATE TABLE legal_consents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  privacy_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  not_financial_advisor_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_consents ENABLE ROW LEVEL SECURITY;

-- Politicas de seguridad: usuarios solo pueden ver/editar sus propios datos
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own expenses" ON fixed_expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own expenses" ON fixed_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own expenses" ON fixed_expenses FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own savings" ON savings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own savings" ON savings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own savings" ON savings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own consents" ON legal_consents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own consents" ON legal_consents FOR INSERT WITH CHECK (auth.uid() = user_id);
*/
