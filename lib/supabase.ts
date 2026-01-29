import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Configuracion de Supabase - Proyecto Cuadro
const supabaseUrl = 'https://zmpvzayyubugvlocceon.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptcHZ6YXl5dWJ1Z3Zsb2NjZW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NDEyMzQsImV4cCI6MjA4NTIxNzIzNH0.3dg_rIwhIgMzM-apyQBMiSnAj27EuRaX874rwH83JLc'

// Cliente de Supabase para uso en el cliente (browser)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Funciones de autenticacion
export const auth = {
  // Enviar magic link al email
  async sendMagicLink(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback`
          : undefined
      }
    })
    return { error }
  },

  // Obtener sesion actual
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // Obtener usuario actual
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Cerrar sesion
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Escuchar cambios de autenticacion
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Funciones de base de datos
export const db = {
  // Perfiles de usuario
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    return { data, error }
  },

  async createUserProfile(profile: {
    user_id: string
    monthly_income: number
  }) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profile)
      .select()
      .single()
    return { data, error }
  },

  async updateUserProfile(userId: string, updates: {
    monthly_income?: number
  }) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single()
    return { data, error }
  },

  // Gastos fijos
  async getFixedExpenses(userId: string) {
    const { data, error } = await supabase
      .from('fixed_expenses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    return { data, error }
  },

  async createFixedExpense(expense: {
    user_id: string
    expense_type: string
    name: string
    amount: number
  }) {
    const { data, error } = await supabase
      .from('fixed_expenses')
      .insert(expense)
      .select()
      .single()
    return { data, error }
  },

  async deleteFixedExpenses(userId: string) {
    const { error } = await supabase
      .from('fixed_expenses')
      .delete()
      .eq('user_id', userId)
    return { error }
  },

  // Ahorros
  async getSavings(userId: string) {
    const { data, error } = await supabase
      .from('savings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    return { data, error }
  },

  async createOrUpdateSavings(savings: {
    user_id: string
    amount: number
  }) {
    const { data, error } = await supabase
      .from('savings')
      .upsert(savings, { onConflict: 'user_id' })
      .select()
      .single()
    return { data, error }
  },

  // Consentimientos legales
  async getLegalConsents(userId: string) {
    const { data, error } = await supabase
      .from('legal_consents')
      .select('*')
      .eq('user_id', userId)
      .single()
    return { data, error }
  },

  async createLegalConsents(consents: {
    user_id: string
    terms_accepted: boolean
    privacy_accepted: boolean
    not_financial_advisor_accepted: boolean
  }) {
    const { data, error } = await supabase
      .from('legal_consents')
      .insert({
        ...consents,
        accepted_at: new Date().toISOString()
      })
      .select()
      .single()
    return { data, error }
  }
}

export default supabase
