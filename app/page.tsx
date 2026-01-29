'use client'

import { useState, useEffect } from 'react'
import AuthScreen from '@/components/auth/AuthScreen'
import LegalConsent from '@/components/auth/LegalConsent'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'
import Dashboard from '@/components/dashboard/Dashboard'
import ChatInterface from '@/components/chat/ChatInterface'

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

// Local storage keys
const STORAGE_KEY = 'cuadro_user_data'
const AUTH_KEY = 'cuadro_auth'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [legalAccepted, setLegalAccepted] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [currentView, setCurrentView] = useState<'auth' | 'legal' | 'onboarding' | 'dashboard' | 'chat'>('auth')
  const [isLoading, setIsLoading] = useState(true)

  // Load data from localStorage on mount
  useEffect(() => {
    const authData = localStorage.getItem(AUTH_KEY)
    const savedData = localStorage.getItem(STORAGE_KEY)

    if (authData) {
      const parsed = JSON.parse(authData)
      setIsAuthenticated(parsed.authenticated || false)
      setLegalAccepted(parsed.legalAccepted || false)
    }

    if (savedData) {
      const parsed = JSON.parse(savedData)
      // Convert date strings back to Date objects
      if (parsed.variableExpenses) {
        parsed.variableExpenses = parsed.variableExpenses.map((exp: any) => ({
          ...exp,
          date: new Date(exp.date)
        }))
      }
      setUserData(parsed)
    }

    // Determine initial view
    if (!authData || !JSON.parse(authData).authenticated) {
      setCurrentView('auth')
    } else if (!JSON.parse(authData).legalAccepted) {
      setCurrentView('legal')
    } else if (savedData && JSON.parse(savedData).onboardingComplete) {
      setCurrentView('dashboard')
    } else {
      setCurrentView('onboarding')
    }

    setIsLoading(false)

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration)
        })
        .catch((error) => {
          console.log('SW registration failed:', error)
        })
    }
  }, [])

  // Save data to localStorage whenever it changes
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
  const handleAuthSuccess = () => {
    setIsAuthenticated(true)
    setCurrentView('legal')
  }

  // Handle legal consent
  const handleLegalAccept = () => {
    setLegalAccepted(true)
    setCurrentView('onboarding')
  }

  // Handle onboarding completion
  const handleOnboardingComplete = (data: { income: number; fixedExpenses: any[]; savings?: number }) => {
    const newUserData: UserData = {
      income: data.income,
      fixedExpenses: data.fixedExpenses.map(exp => ({
        ...exp,
        paid: false
      })),
      variableExpenses: [],
      savings: data.savings || 0,
      onboardingComplete: true,
      legalAccepted: true
    }
    setUserData(newUserData)
    setCurrentView('dashboard')
  }

  // Toggle fixed expense paid status
  const handleTogglePaid = (id: string) => {
    if (!userData) return

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

  // Check if expense is a duplicate (same description and amount today)
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

  // Delete an expense by search term
  const deleteExpense = (searchTerm: string): { deleted: VariableExpense | null, message: string } => {
    if (!userData?.variableExpenses || userData.variableExpenses.length === 0) {
      return { deleted: null, message: 'No tienes gastos para borrar.' }
    }

    const expenses = [...userData.variableExpenses].reverse() // Most recent first
    let expenseToDelete: VariableExpense | null = null

    // If "ultimo" or empty search, delete the most recent
    if (searchTerm === 'ultimo' || searchTerm === 'último' || !searchTerm) {
      expenseToDelete = expenses[0]
    } else {
      // Try to find by description or amount
      const searchLower = searchTerm.toLowerCase()
      const searchNum = parseInt(searchTerm.replace(/\D/g, ''))

      expenseToDelete = expenses.find(exp => {
        const matchesDesc = exp.description.toLowerCase().includes(searchLower)
        const matchesAmount = !isNaN(searchNum) && exp.amount === searchNum
        return matchesDesc || matchesAmount
      }) || null
    }

    if (expenseToDelete) {
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

  // Handle chat message with OpenAI parsing
  const handleSendMessage = async (message: string): Promise<string> => {
    try {
      // Get recent expenses to send to API
      const recentExpenses = userData?.variableExpenses
        ?.slice(-10)
        .reverse()
        .map(exp => ({
          description: exp.description,
          amount: exp.amount
        })) || []

      // Call OpenAI API to parse the message
      const response = await fetch('/api/parse-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          recentExpenses
        })
      })

      const parsed = await response.json()

      // Handle DELETE
      if (parsed.tipo === 'borrar') {
        const result = deleteExpense(parsed.buscar || 'ultimo')
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

        // Check for duplicate
        const duplicate = checkForDuplicate(description, amount)
        if (duplicate) {
          // Still add it but warn the user
          const newExpense: VariableExpense = {
            id: Date.now().toString(),
            description,
            amount,
            category: categorizeExpense(description),
            date: new Date()
          }

          setUserData(prev => {
            if (!prev) return prev
            return {
              ...prev,
              variableExpenses: [...prev.variableExpenses, newExpense]
            }
          })

          const totalFixed = userData?.fixedExpenses.reduce((sum, exp) => sum + exp.amount, 0) || 0
          const totalVariable = (userData?.variableExpenses.reduce((sum, exp) => sum + exp.amount, 0) || 0) + amount
          const available = (userData?.income || 0) - totalFixed - totalVariable

          return `✅ Listo, ${description} por $${amount.toLocaleString('es-CO')}\n\n⚠️ Ojo: Ya tenías un gasto parecido hoy ("${duplicate.description}" por $${duplicate.amount.toLocaleString('es-CO')}). Si fue error, escribe "borrar último".\n\n📊 Te quedan $${available.toLocaleString('es-CO')} pa'l mes.`
        }

        // Add variable expense normally
        const newExpense: VariableExpense = {
          id: Date.now().toString(),
          description,
          amount,
          category: categorizeExpense(description),
          date: new Date()
        }

        setUserData(prev => {
          if (!prev) return prev
          return {
            ...prev,
            variableExpenses: [...prev.variableExpenses, newExpense]
          }
        })

        const totalFixed = userData?.fixedExpenses.reduce((sum, exp) => sum + exp.amount, 0) || 0
        const totalVariable = (userData?.variableExpenses.reduce((sum, exp) => sum + exp.amount, 0) || 0) + amount
        const available = (userData?.income || 0) - totalFixed - totalVariable

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

      // Default: no_entendido
      return 'Epa, no te entendí bien. 🤔\n\nEscríbeme algo como:\n• "Almuerzo 15000"\n• "10k uber"\n• "Gasté 5 lucas en café"\n• "Borrar último gasto"\n\nO pregúntame "¿cuánto llevo?"'

    } catch (error) {
      console.error('Error parsing message:', error)
      return fallbackParse(message)
    }
  }

  // Fallback parser in case API fails
  const fallbackParse = (message: string): string => {
    const expensePattern = /(\d+(?:[.,]\d+)?)\s*(?:k|mil|lucas)?/i
    const match = message.match(expensePattern)

    if (match) {
      let amount = parseFloat(match[1].replace(',', '.'))
      if (message.toLowerCase().includes('k') || message.toLowerCase().includes('lucas') || message.toLowerCase().includes('mil')) {
        amount *= 1000
      }

      const words = message.replace(/[\d.,]+\s*(k|mil|lucas)?/gi, '').trim()
      const description = words || 'Gasto'

      const newExpense: VariableExpense = {
        id: Date.now().toString(),
        description,
        amount: Math.round(amount),
        category: categorizeExpense(description),
        date: new Date()
      }

      setUserData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          variableExpenses: [...prev.variableExpenses, newExpense]
        }
      })

      const available = getAvailableMoney() - Math.round(amount)
      return `✅ Listo, ${description} por $${Math.round(amount).toLocaleString('es-CO')}\n\n📊 Te quedan $${available.toLocaleString('es-CO')} pa'l mes.`
    }

    if (message.toLowerCase().includes('gastado') || message.toLowerCase().includes('cuanto') || message.toLowerCase().includes('llevo')) {
      const totalVariable = userData?.variableExpenses.reduce((sum, exp) => sum + exp.amount, 0) || 0
      return `📊 Este mes llevas $${totalVariable.toLocaleString('es-CO')} en gasticos variables.`
    }

    return 'Epa, no te entendí. Escríbeme algo como "Almuerzo 15000" o pregúntame "¿cuánto llevo?"'
  }

  // Simple expense categorization
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
