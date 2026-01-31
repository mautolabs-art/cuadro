import { createClient } from '@supabase/supabase-js'

// Configuracion de Supabase - Proyecto Cuadro
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zmpvzayyubugvlocceon.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptcHZ6YXl5dWJ1Z3Zsb2NjZW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NDEyMzQsImV4cCI6MjA4NTIxNzIzNH0.3dg_rIwhIgMzM-apyQBMiSnAj27EuRaX874rwH83JLc'

// Cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface DbUser {
  id: string
  google_id: string
  email: string
  name: string | null
  picture: string | null
  income: number
  savings: number
  onboarding_complete: boolean
  created_at: string
  updated_at: string
}

export interface DbFixedExpense {
  id: string
  user_id: string
  name: string
  amount: number
  icon: string | null
  paid: boolean
  created_at: string
}

export interface DbVariableExpense {
  id: string
  user_id: string
  description: string
  amount: number
  category: string
  expense_date: string
  created_at: string
}

export interface DbFeedback {
  id: string
  user_id: string
  message: string
  created_at: string
}

export interface DbMonthlyExpenseStatus {
  id: string
  user_id: string
  expense_id: string
  year: number
  month: number
  paid: boolean
  paid_at: string | null
  created_at: string
}

// Database functions
export const db = {
  // === USERS ===
  async getUserByGoogleId(googleId: string): Promise<DbUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', googleId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user:', error)
    }
    return data
  },

  async createUser(user: {
    google_id: string
    email: string
    name?: string
    picture?: string
  }): Promise<DbUser | null> {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single()

    if (error) {
      console.error('Error creating user:', error)
      return null
    }
    return data
  },

  async updateUser(userId: string, updates: {
    income?: number
    savings?: number
    onboarding_complete?: boolean
  }): Promise<DbUser | null> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      return null
    }
    return data
  },

  // === FIXED EXPENSES ===
  async getFixedExpenses(userId: string): Promise<DbFixedExpense[]> {
    const { data, error } = await supabase
      .from('fixed_expenses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching fixed expenses:', error)
      return []
    }
    return data || []
  },

  async createFixedExpense(expense: {
    user_id: string
    name: string
    amount: number
    icon?: string
  }): Promise<DbFixedExpense | null> {
    const { data, error } = await supabase
      .from('fixed_expenses')
      .insert(expense)
      .select()
      .single()

    if (error) {
      console.error('Error creating fixed expense:', error)
      return null
    }
    return data
  },

  async updateFixedExpense(expenseId: string, updates: {
    paid?: boolean
    amount?: number
    name?: string
  }): Promise<DbFixedExpense | null> {
    const { data, error } = await supabase
      .from('fixed_expenses')
      .update(updates)
      .eq('id', expenseId)
      .select()
      .single()

    if (error) {
      console.error('Error updating fixed expense:', error)
      return null
    }
    return data
  },

  async deleteFixedExpense(expenseId: string): Promise<boolean> {
    const { error } = await supabase
      .from('fixed_expenses')
      .delete()
      .eq('id', expenseId)

    if (error) {
      console.error('Error deleting fixed expense:', error)
      return false
    }
    return true
  },

  async deleteAllFixedExpenses(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('fixed_expenses')
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting fixed expenses:', error)
      return false
    }
    return true
  },

  // === VARIABLE EXPENSES ===
  async getVariableExpenses(userId: string, startDate?: string, endDate?: string): Promise<DbVariableExpense[]> {
    let query = supabase
      .from('variable_expenses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (startDate) {
      query = query.gte('expense_date', startDate)
    }
    if (endDate) {
      query = query.lte('expense_date', endDate)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching variable expenses:', error)
      return []
    }
    return data || []
  },

  async createVariableExpense(expense: {
    user_id: string
    description: string
    amount: number
    category?: string
  }): Promise<DbVariableExpense | null> {
    const { data, error } = await supabase
      .from('variable_expenses')
      .insert({
        ...expense,
        category: expense.category || 'Otros'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating variable expense:', error)
      return null
    }
    return data
  },

  async deleteVariableExpense(expenseId: string): Promise<boolean> {
    const { error } = await supabase
      .from('variable_expenses')
      .delete()
      .eq('id', expenseId)

    if (error) {
      console.error('Error deleting variable expense:', error)
      return false
    }
    return true
  },

  // === BULK OPERATIONS ===
  async createManyFixedExpenses(expenses: {
    user_id: string
    name: string
    amount: number
    icon?: string
  }[]): Promise<DbFixedExpense[]> {
    const { data, error } = await supabase
      .from('fixed_expenses')
      .insert(expenses)
      .select()

    if (error) {
      console.error('Error creating fixed expenses:', error)
      return []
    }
    return data || []
  },

  // === ANALYTICS ===
  async getMonthlyTotal(userId: string, year: number, month: number): Promise<number> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`

    const { data, error } = await supabase
      .from('variable_expenses')
      .select('amount')
      .eq('user_id', userId)
      .gte('expense_date', startDate)
      .lte('expense_date', endDate)

    if (error || !data) return 0
    return data.reduce((sum, exp) => sum + exp.amount, 0)
  },

  async getCategoryTotals(userId: string, startDate: string, endDate: string): Promise<{category: string, total: number}[]> {
    const { data, error } = await supabase
      .from('variable_expenses')
      .select('category, amount')
      .eq('user_id', userId)
      .gte('expense_date', startDate)
      .lte('expense_date', endDate)

    if (error || !data) return []

    const totals: Record<string, number> = {}
    data.forEach(exp => {
      totals[exp.category] = (totals[exp.category] || 0) + exp.amount
    })

    return Object.entries(totals)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total)
  },

  // === FEEDBACK ===
  async createFeedback(feedback: {
    user_id: string
    message: string
  }): Promise<DbFeedback | null> {
    const { data, error } = await supabase
      .from('feedback')
      .insert(feedback)
      .select()
      .single()

    if (error) {
      console.error('Error creating feedback:', error)
      return null
    }
    return data
  },

  // === MONTHLY EXPENSE STATUS ===
  async getMonthlyExpenseStatus(userId: string, year: number, month: number): Promise<DbMonthlyExpenseStatus[]> {
    const { data, error } = await supabase
      .from('monthly_expense_status')
      .select('*')
      .eq('user_id', userId)
      .eq('year', year)
      .eq('month', month)

    if (error) {
      console.error('Error fetching monthly expense status:', error)
      return []
    }
    return data || []
  },

  async setExpensePaidStatus(
    userId: string,
    expenseId: string,
    year: number,
    month: number,
    paid: boolean
  ): Promise<DbMonthlyExpenseStatus | null> {
    // Try to upsert (insert or update)
    const { data, error } = await supabase
      .from('monthly_expense_status')
      .upsert({
        user_id: userId,
        expense_id: expenseId,
        year,
        month,
        paid,
        paid_at: paid ? new Date().toISOString() : null
      }, {
        onConflict: 'expense_id,year,month'
      })
      .select()
      .single()

    if (error) {
      console.error('Error setting expense paid status:', error)
      return null
    }
    return data
  },

  async deleteMonthlyStatusForExpense(expenseId: string): Promise<boolean> {
    const { error } = await supabase
      .from('monthly_expense_status')
      .delete()
      .eq('expense_id', expenseId)

    if (error) {
      console.error('Error deleting monthly status:', error)
      return false
    }
    return true
  }
}

export default supabase
