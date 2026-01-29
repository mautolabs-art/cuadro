'use client'

import { useState, useEffect } from 'react'
import AuthScreen from '@/components/auth/AuthScreen'
import LegalConsent from '@/components/auth/LegalConsent'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'
import Dashboard from '@/components/dashboard/Dashboard'
import ChatInterface from '@/components/chat/ChatInterface'
import { db } from '@/lib/supabase'

interface FixedExpense {
  id: string
  name: string
  icon?: string
  amount: number
  selected?: boolean
  paid: boolean
}

interface VariableExpense {
  id: string
  description: string
  amount: number
  category: string
  date: Date
}

interface UserData {
  income: number
  fixedExpenses: FixedExpense[]
  variableExpenses: VariableExpense[]
  savings: number
  onboardingComplete: boolean
  legalAccepted: boolean
}

interface GoogleUser {
  id: string
  email: string
  name: string
  picture: string
}

// Local storage keys
const STORAGE_KEY = 'cuadro_user_data'
const AUTH_KEY = 'cuadro_auth'
const USER_KEY = 'cuadro_user'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [legalAccepted, setLegalAccepted] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [currentView, setCurrentView] = useState<'auth' | 'legal' | 'onboarding' | 'dashboard' | 'chat'>('auth')
  const [isLoading, setIsLoading] = useState(true)
  const [dbUserId, setDbUserId] = useState<string | null>(null)
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null)

  // Load data on mount
  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const authData = localStorage.getItem(AUTH_KEY)
      const savedUser = localStorage.getItem(USER_KEY)

      if (authData) {
        const parsed = JSON.parse(authData)
        setIsAuthenticated(parsed.authenticated || false)
        setLegalAccepted(parsed.legalAccepted || false)
      }

      if (savedUser) {
        const user = JSON.parse(savedUser)
        setGoogleUser(user)

        // Load from Supabase if user exists
        if (user.id) {
          const dbUser = await db.getUserByGoogleId(user.id)

          if (dbUser) {
            setDbUserId(dbUser.id)

            // Load fixed expenses
            const fixedExpenses = await db.getFixedExpenses(dbUser.id)

            // Load variable expenses (current month)
            const now = new Date()
            const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
            const variableExpenses = await db.getVariableExpenses(dbUser.id, startOfMonth)

            const userData: UserData = {
              income: dbUser.income,
              fixedExpenses: fixedExpenses.map(exp => ({
                id: exp.id,
                name: exp.name,
                amount: exp.amount,
                icon: exp.icon || undefined,
                paid: exp.paid
              })),
              variableExpenses: variableExpenses.map(exp => ({
                id: exp.id,
                description: exp.description,
                amount: exp.amount,
                category: exp.category,
                date: new Date(exp.expense_date)
              })),
              savings: dbUser.savings,
              onboardingComplete: dbUser.onboarding_complete,
              legalAccepted: true
            }

            setUserData(userData)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))

            // Determine view
            if (dbUser.onboarding_complete) {
              setCurrentView('dashboard')
            } else {
              setCurrentView('onboarding')
            }
          } else {
            // User logged in but not in DB yet
            if (authData && JSON.parse(authData).legalAccepted) {
              setCurrentView('onboarding')
            } else if (authData && JSON.parse(authData).authenticated) {
              setCurrentView('legal')
            }
          }
        }
      }

      // Default view if nothing loaded
      if (!authData || !JSON.parse(authData).authenticated) {
        setCurrentView('auth')
      }

    } catch (error) {
      console.error('Error loading user data:', error)
      // Fallback to localStorage
      const savedData = localStorage.getItem(STORAGE_KEY)
      if (savedData) {
        const parsed = JSON.parse(savedData)
        if (parsed.variableExpenses) {
          parsed.variableExpenses = parsed.variableExpenses.map((exp: any) => ({
            ...exp,
            date: new Date(exp.date)
          }))
        }
        setUserData(parsed)
        if (parsed.onboardingComplete) {
          setCurrentView('dashboard')
        }
      }
    } finally {
      setIsLoading(false)
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error)
    }
  }

  // Save to localStorage when userData changes
  useEffect(() => {
    if (userData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
    }
  }, [userData])

  // Save auth state
  useEffect(() => {
    localStorage.setItem(AUTH_KEY, JSON.stringify({
      authenticated: isAuthenticated,
      legalAccepted: legalAccepted
    }))
  }, [isAuthenticated, legalAccepted])

  // Handle successful authentication
  const handleAuthSuccess = async () => {
    setIsAuthenticated(true)

    // Get Google user from localStorage (set by AuthScreen)
    const savedUser = localStorage.getItem(USER_KEY)
    if (savedUser) {
      const user = JSON.parse(savedUser)
      setGoogleUser(user)

      // Check if user exists in Supabase
      let dbUser = await db.getUserByGoogleId(user.id)

      if (dbUser) {
        setDbUserId(dbUser.id)

        if (dbUser.onboarding_complete) {
          // Load existing data
          const fixedExpenses = await db.getFixedExpenses(dbUser.id)
          const now = new Date()
          const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
          const variableExpenses = await db.getVariableExpenses(dbUser.id, startOfMonth)

          setUserData({
            income: dbUser.income,
            fixedExpenses: fixedExpenses.map(exp => ({
              id: exp.id,
              name: exp.name,
              amount: exp.amount,
              icon: exp.icon || undefined,
              paid: exp.paid
            })),
            variableExpenses: variableExpenses.map(exp => ({
              id: exp.id,
              description: exp.description,
              amount: exp.amount,
              category: exp.category,
              date: new Date(exp.expense_date)
            })),
            savings: dbUser.savings,
            onboardingComplete: true,
            legalAccepted: true
          })
          setLegalAccepted(true)
          setCurrentView('dashboard')
          return
        }
      }
    }

    setCurrentView('legal')
  }

  // Handle legal consent
  const handleLegalAccept = async () => {
    setLegalAccepted(true)

    // Create user in Supabase if doesn't exist
    if (googleUser && !dbUserId) {
      const newUser = await db.createUser({
        google_id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture
      })

      if (newUser) {
        setDbUserId(newUser.id)
      }
    }

    setCurrentView('onboarding')
  }

  // Handle onboarding completion
  const handleOnboardingComplete = async (data: { income: number; fixedExpenses: any[]; savings?: number }) => {
    const newUserData: UserData = {
      income: data.income,
      fixedExpenses: data.fixedExpenses.map(exp => ({
        ...exp,
        id: exp.id || Date.now().toString() + Math.random(),
        paid: false
      })),
      variableExpenses: [],
      savings: data.savings || 0,
      onboardingComplete: true,
      legalAccepted: true
    }

    // Save to Supabase
    if (dbUserId) {
      // Update user with income and savings
      await db.updateUser(dbUserId, {
        income: data.income,
        savings: data.savings || 0,
        onboarding_complete: true
      })

      // Delete old fixed expenses and create new ones
      await db.deleteAllFixedExpenses(dbUserId)

      const fixedExpensesToCreate = data.fixedExpenses.map(exp => ({
        user_id: dbUserId,
        name: exp.name,
        amount: exp.amount,
        icon: exp.icon
      }))

      const createdExpenses = await db.createManyFixedExpenses(fixedExpensesToCreate)

      // Update IDs with Supabase IDs
      newUserData.fixedExpenses = createdExpenses.map(exp => ({
        id: exp.id,
        name: exp.name,
        amount: exp.amount,
        icon: exp.icon || undefined,
        paid: exp.paid
      }))
    }

    setUserData(newUserData)
    setCurrentView('dashboard')
  }

  // Toggle fixed expense paid status
  const handleTogglePaid = async (id: string) => {
    if (!userData) return

    const expense = userData.fixedExpenses.find(exp => exp.id === id)
    if (!expense) return

    // Update in Supabase
    if (dbUserId) {
      await db.updateFixedExpense(id, { paid: !expense.paid })
    }

    setUserData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        fixedExpenses: prev.fixedExpenses.map(exp =>
          exp.id === id ? { ...exp, paid: !exp.paid } : exp
        )
      }
    })
  }

  // Check if expense is a duplicate
  const checkForDuplicate = (description: string, amount: number): VariableExpense | null => {
    if (!userData?.variableExpenses) return null

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return userData.variableExpenses.find(exp => {
      const expDate = new Date(exp.date)
      expDate.setHours(0, 0, 0, 0)

      const isSameDay = expDate.getTime() === today.getTime()
      const isSimilar = exp.description.toLowerCase().includes(description.toLowerCase()) ||
                        description.toLowerCase().includes(exp.description.toLowerCase())
      const isSameAmount = exp.amount === amount

      return isSameDay && (isSimilar || isSameAmount)
    }) || null
  }

  // Add variable expense (with Supabase sync)
  const addVariableExpense = async (description: string, amount: number, category: string): Promise<VariableExpense> => {
    let newExpense: VariableExpense = {
      id: Date.now().toString(),
      description,
      amount,
      category,
      date: new Date()
    }

    // Save to Supabase
    if (dbUserId) {
      const dbExpense = await db.createVariableExpense({
        user_id: dbUserId,
        description,
        amount,
        category
      })

      if (dbExpense) {
        newExpense.id = dbExpense.id
      }
    }

    setUserData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        variableExpenses: [...prev.variableExpenses, newExpense]
      }
    })

    return newExpense
  }

  // Delete expense (with Supabase sync)
  const deleteExpense = async (searchTerm: string): Promise<{ deleted: VariableExpense | null, message: string }> => {
    if (!userData?.variableExpenses || userData.variableExpenses.length === 0) {
      return { deleted: null, message: 'No tienes gastos para borrar.' }
    }

    const expenses = [...userData.variableExpenses].reverse()
    let expenseToDelete: VariableExpense | null = null

    if (searchTerm === 'ultimo' || searchTerm === 'último' || !searchTerm) {
      expenseToDelete = expenses[0]
    } else {
      const searchLower = searchTerm.toLowerCase()
      const searchNum = parseInt(searchTerm.replace(/\D/g, ''))

      expenseToDelete = expenses.find(exp => {
        const matchesDesc = exp.description.toLowerCase().includes(searchLower)
        const matchesAmount = !isNaN(searchNum) && exp.amount === searchNum
        return matchesDesc || matchesAmount
      }) || null
    }

    if (expenseToDelete) {
      // Delete from Supabase
      if (dbUserId) {
        await db.deleteVariableExpense(expenseToDelete.id)
      }

      setUserData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          variableExpenses: prev.variableExpenses.filter(exp => exp.id !== expenseToDelete!.id)
        }
      })

      return {
        deleted: expenseToDelete,
        message: `🗑️ Listo, borré "${expenseToDelete.description}" por $${expenseToDelete.amount.toLocaleString('es-CO')}`
      }
    }

    return { deleted: null, message: `No encontré ningún gasto con "${searchTerm}". ¿Cuál querías borrar?` }
  }

  // Handle chat message
  const handleSendMessage = async (message: string): Promise<string> => {
    try {
      const recentExpenses = userData?.variableExpenses
        ?.slice(-10)
        .reverse()
        .map(exp => ({
          description: exp.description,
          amount: exp.amount
        })) || []

      const response = await fetch('/api/parse-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, recentExpenses })
      })

      const parsed = await response.json()

      // Handle DELETE
      if (parsed.tipo === 'borrar') {
        const result = await deleteExpense(parsed.buscar || 'ultimo')
        if (result.deleted) {
          const available = getAvailableMoney() + result.deleted.amount
          return `${result.message}\n\n📊 Te quedan $${available.toLocaleString('es-CO')} pa'l mes.`
        }
        return result.message
      }

      // Handle EXPENSE
      if (parsed.tipo === 'gasto' && parsed.monto) {
        const description = parsed.categoria || 'Gasto'
        const amount = parsed.monto
        const category = categorizeExpense(description)

        const duplicate = checkForDuplicate(description, amount)
        await addVariableExpense(description, amount, category)

        const totalFixed = userData?.fixedExpenses.reduce((sum, exp) => sum + exp.amount, 0) || 0
        const totalVariable = (userData?.variableExpenses.reduce((sum, exp) => sum + exp.amount, 0) || 0) + amount
        const available = (userData?.income || 0) - totalFixed - totalVariable

        if (duplicate) {
          return `✅ Listo, ${description} por $${amount.toLocaleString('es-CO')}\n\n⚠️ Ojo: Ya tenías un gasto parecido hoy ("${duplicate.description}" por $${duplicate.amount.toLocaleString('es-CO')}). Si fue error, escribe "borrar último".\n\n📊 Te quedan $${available.toLocaleString('es-CO')} pa'l mes.`
        }

        return `✅ Listo, ${description} por $${amount.toLocaleString('es-CO')}\n\n📊 Te quedan $${available.toLocaleString('es-CO')} pa'l mes.`
      }

      if (parsed.tipo === 'consulta') {
        const totalVariable = userData?.variableExpenses.reduce((sum, exp) => sum + exp.amount, 0) || 0
        const categories = getCategorySummary()

        let response = `📊 Este mes llevas $${totalVariable.toLocaleString('es-CO')} en gasticos variables.\n\n`

        if (categories.length > 0) {
          response += 'Así va la cosa:\n'
          categories.forEach(cat => {
            response += `• ${cat.name}: $${cat.total.toLocaleString('es-CO')}\n`
          })
        }

        return response
      }

      if (parsed.tipo === 'saludo') {
        const available = getAvailableMoney()
        return `¡Qué más, parcero! 👋\n\nTe quedan $${available.toLocaleString('es-CO')} pa'l mes.\n\nCuéntame en qué gastaste, por ejemplo:\n• "Almuerzo 15000"\n• "10k en uber"\n• "Gasté 5 lucas en café"\n\n💡 Para borrar: "borrar último" o "quitar el uber"`
      }

      return 'Epa, no te entendí bien. 🤔\n\nEscríbeme algo como:\n• "Almuerzo 15000"\n• "10k uber"\n• "Gasté 5 lucas en café"\n• "Borrar último gasto"\n\nO pregúntame "¿cuánto llevo?"'

    } catch (error) {
      console.error('Error parsing message:', error)
      return fallbackParse(message)
    }
  }

  // Fallback parser
  const fallbackParse = async (message: string): Promise<string> => {
    const expensePattern = /(\d+(?:[.,]\d+)?)\s*(?:k|mil|lucas)?/i
    const match = message.match(expensePattern)

    if (match) {
      let amount = parseFloat(match[1].replace(',', '.'))
      if (message.toLowerCase().includes('k') || message.toLowerCase().includes('lucas') || message.toLowerCase().includes('mil')) {
        amount *= 1000
      }

      const words = message.replace(/[\d.,]+\s*(k|mil|lucas)?/gi, '').trim()
      const description = words || 'Gasto'
      const category = categorizeExpense(description)

      await addVariableExpense(description, Math.round(amount), category)

      const available = getAvailableMoney() - Math.round(amount)
      return `✅ Listo, ${description} por $${Math.round(amount).toLocaleString('es-CO')}\n\n📊 Te quedan $${available.toLocaleString('es-CO')} pa'l mes.`
    }

    if (message.toLowerCase().includes('gastado') || message.toLowerCase().includes('cuanto') || message.toLowerCase().includes('llevo')) {
      const totalVariable = userData?.variableExpenses.reduce((sum, exp) => sum + exp.amount, 0) || 0
      return `📊 Este mes llevas $${totalVariable.toLocaleString('es-CO')} en gasticos variables.`
    }

    return 'Epa, no te entendí. Escríbeme algo como "Almuerzo 15000" o pregúntame "¿cuánto llevo?"'
  }

  // Categorize expense
  const categorizeExpense = (description: string): string => {
    const lower = description.toLowerCase()
    if (lower.includes('almuerzo') || lower.includes('comida') || lower.includes('restaurante') || lower.includes('café') || lower.includes('tintico') || lower.includes('desayuno') || lower.includes('cena')) {
      return 'Alimentación'
    }
    if (lower.includes('uber') || lower.includes('taxi') || lower.includes('bus') || lower.includes('transporte') || lower.includes('gasolina') || lower.includes('parqueadero')) {
      return 'Transporte'
    }
    if (lower.includes('mercado') || lower.includes('supermercado') || lower.includes('exito') || lower.includes('d1') || lower.includes('ara')) {
      return 'Mercado'
    }
    if (lower.includes('cerveza') || lower.includes('trago') || lower.includes('rumba') || lower.includes('bar')) {
      return 'Rumba'
    }
    return 'Otros'
  }

  // Get category summary
  const getCategorySummary = () => {
    if (!userData?.variableExpenses) return []

    const categories: { [key: string]: number } = {}
    userData.variableExpenses.forEach(exp => {
      categories[exp.category] = (categories[exp.category] || 0) + exp.amount
    })

    return Object.entries(categories)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
  }

  // Calculate available money
  const getAvailableMoney = () => {
    if (!userData) return 0
    const totalFixed = userData.fixedExpenses.reduce((sum, exp) => sum + exp.amount, 0)
    const totalVariable = userData.variableExpenses.reduce((sum, exp) => sum + exp.amount, 0)
    return userData.income - totalFixed - totalVariable
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-xl">Cargando...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {currentView === 'auth' && (
        <AuthScreen onSuccess={handleAuthSuccess} />
      )}

      {currentView === 'legal' && (
        <LegalConsent onAccept={handleLegalAccept} />
      )}

      {currentView === 'onboarding' && (
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      )}

      {currentView === 'dashboard' && userData && (
        <Dashboard
          income={userData.income}
          fixedExpenses={userData.fixedExpenses}
          variableExpenses={userData.variableExpenses}
          onTogglePaid={handleTogglePaid}
          onOpenChat={() => setCurrentView('chat')}
        />
      )}

      {currentView === 'chat' && userData && (
        <ChatInterface
          onBack={() => setCurrentView('dashboard')}
          onSendMessage={handleSendMessage}
          availableMoney={getAvailableMoney()}
        />
      )}
    </main>
  )
}
