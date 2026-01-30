'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, TrendingDown, ChevronDown, ChevronUp, DollarSign, Edit3, Check, X, Settings, LogOut, LayoutDashboard } from 'lucide-react'

interface FixedExpense {
  id: string
  name: string
  amount: number
  paid: boolean
}

interface VariableExpense {
  id: string
  description: string
  amount: number
  category: string
  date: Date
}

interface GroupedExpense {
  category: string
  icon: string
  items: FixedExpense[]
  totalAmount: number
  paidAmount: number
}

interface Props {
  income: number
  fixedExpenses: FixedExpense[]
  variableExpenses: VariableExpense[]
  onTogglePaid: (id: string) => void
  onUpdateIncome: (newIncome: number) => void
  onLogout: () => void
}

export default function Dashboard({
  income,
  fixedExpenses,
  variableExpenses,
  onTogglePaid,
  onUpdateIncome,
  onLogout
}: Props) {
  const [currentDate] = useState(new Date())
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [editingIncome, setEditingIncome] = useState(false)
  const [tempIncome, setTempIncome] = useState(income.toString())
  const [showSettings, setShowSettings] = useState(false)

  // Group expenses by category (using "Category: SubItem" naming convention)
  const groupExpenses = (): GroupedExpense[] => {
    const groups: { [key: string]: FixedExpense[] } = {}
    const standalone: FixedExpense[] = []

    fixedExpenses.forEach(expense => {
      if (expense.name.includes(': ')) {
        const [category] = expense.name.split(': ')
        if (!groups[category]) {
          groups[category] = []
        }
        groups[category].push(expense)
      } else {
        standalone.push(expense)
      }
    })

    const result: GroupedExpense[] = []

    // Add grouped expenses
    Object.entries(groups).forEach(([category, items]) => {
      const icon = getIconForCategory(category)
      const totalAmount = items.reduce((sum, item) => sum + item.amount, 0)
      const paidAmount = items.filter(item => item.paid).reduce((sum, item) => sum + item.amount, 0)
      result.push({ category, icon, items, totalAmount, paidAmount })
    })

    // Add standalone expenses as single-item groups
    standalone.forEach(expense => {
      result.push({
        category: expense.name,
        icon: 'single',
        items: [expense],
        totalAmount: expense.amount,
        paidAmount: expense.paid ? expense.amount : 0
      })
    })

    return result
  }

  const getIconForCategory = (category: string): string => {
    if (category.includes('Servicios')) return 'services'
    if (category.includes('Streaming')) return 'streaming'
    return 'other'
  }

  const groupedExpenses = groupExpenses()

  // Calculations
  const totalFixedExpenses = fixedExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  const paidFixedExpenses = fixedExpenses.filter(exp => exp.paid).reduce((sum, exp) => sum + exp.amount, 0)
  const unpaidFixedExpenses = totalFixedExpenses - paidFixedExpenses
  const totalVariableExpenses = variableExpenses.reduce((sum, exp) => sum + exp.amount, 0)

  // Available = Income - Paid Fixed - Variable - Pending Fixed
  const currentAvailable = income - paidFixedExpenses - totalVariableExpenses - unpaidFixedExpenses

  // Percentage for semaphore
  const initialAvailable = income - totalFixedExpenses
  const percentageAvailable = initialAvailable > 0 ? Math.round((currentAvailable / initialAvailable) * 100) : 0

  // Semaphore logic
  const getSemaforoColor = () => {
    const ratio = initialAvailable > 0 ? currentAvailable / initialAvailable : 0
    if (ratio >= 0.5) return 'verde'
    if (ratio >= 0.25) return 'amarillo'
    return 'rojo'
  }

  const semaforoColor = getSemaforoColor()
  const colorClasses = {
    verde: 'text-semaforo-verde bg-semaforo-verde/10 border-semaforo-verde/30',
    amarillo: 'text-semaforo-amarillo bg-semaforo-amarillo/10 border-semaforo-amarillo/30',
    rojo: 'text-semaforo-rojo bg-semaforo-rojo/10 border-semaforo-rojo/30'
  }

  // Get current month name in Spanish
  const monthName = currentDate.toLocaleDateString('es-CO', { month: 'long' })

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  // Format money for input
  const formatMoney = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  // Handle income save
  const handleSaveIncome = () => {
    const newIncome = parseInt(tempIncome.replace(/\./g, '')) || 0
    if (newIncome > 0) {
      onUpdateIncome(newIncome)
    }
    setEditingIncome(false)
  }

  // Get display name (remove category prefix for sub-items)
  const getDisplayName = (expense: FixedExpense) => {
    if (expense.name.includes(': ')) {
      return expense.name.split(': ')[1]
    }
    return expense.name
  }

  // Recent variable expenses
  const recentExpenses = variableExpenses.slice(-3).reverse()

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="bg-background-card p-6 pb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-gray-400 text-sm capitalize">{monthName} 2025</p>
              <h1 className="text-xl font-bold text-white">Tu resumen</h1>
            </div>
          </div>
          {/* Settings button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-background rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Settings dropdown */}
        {showSettings && (
          <div className="absolute right-6 top-20 bg-background-card border border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
            <button
              onClick={() => {
                setShowSettings(false)
                onLogout()
              }}
              className="flex items-center gap-3 px-4 py-3 w-full hover:bg-background transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-gray-400" />
              <span className="text-white">Cerrar sesión</span>
            </button>
          </div>
        )}

        {/* Income display/edit */}
        <div className="bg-background rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400">Ingreso mensual</span>
            </div>
            {editingIncome ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatMoney(tempIncome)}
                    onChange={(e) => setTempIncome(e.target.value.replace(/\./g, ''))}
                    className="w-32 bg-background-card border border-gray-600 rounded-lg py-1 pl-6 pr-2 text-white text-right outline-none focus:border-primary"
                    autoFocus
                  />
                </div>
                <button onClick={handleSaveIncome} className="p-1 text-primary hover:bg-primary/20 rounded">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setEditingIncome(false)} className="p-1 text-gray-400 hover:bg-gray-700 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setTempIncome(income.toString())
                  setEditingIncome(true)
                }}
                className="flex items-center gap-2 text-white hover:text-primary transition-colors"
              >
                <span className="font-semibold">${income.toLocaleString('es-CO')}</span>
                <Edit3 className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* Main money display */}
        <div className={`rounded-2xl p-6 border-2 ${colorClasses[semaforoColor]} text-center mb-4`}>
          <p className="text-sm opacity-70 mb-1">Pa' gastar este mes</p>
          <p className={`text-4xl font-bold money-display ${
            semaforoColor === 'verde' ? 'text-semaforo-verde' :
            semaforoColor === 'amarillo' ? 'text-semaforo-amarillo' :
            'text-semaforo-rojo'
          }`}>
            ${currentAvailable.toLocaleString('es-CO')}
          </p>
          <p className="text-xs opacity-50 mt-2">
            {percentageAvailable}% de tu presupuesto disponible
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-background rounded-xl p-3">
            <p className="text-gray-500 text-xs">Fijos pagados</p>
            <p className="text-white font-semibold">
              ${paidFixedExpenses.toLocaleString('es-CO')}
            </p>
          </div>
          <div className="bg-background rounded-xl p-3">
            <p className="text-gray-500 text-xs">Gastos variables</p>
            <p className="text-white font-semibold">
              ${totalVariableExpenses.toLocaleString('es-CO')}
            </p>
          </div>
        </div>
      </div>

      {/* Fixed expenses with expandable categories */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">Gastos fijos del mes</h2>
          <span className="text-sm text-gray-400">
            {fixedExpenses.filter(e => e.paid).length}/{fixedExpenses.length} pagados
          </span>
        </div>

        <div className="space-y-2">
          {groupedExpenses.map((group) => {
            const isExpanded = expandedCategories.has(group.category)
            const hasMultipleItems = group.items.length > 1
            const allPaid = group.items.every(item => item.paid)
            const somePaid = group.items.some(item => item.paid)
            const pendingAmount = group.totalAmount - group.paidAmount

            if (!hasMultipleItems) {
              // Single item - render as before
              const expense = group.items[0]
              return (
                <button
                  key={expense.id}
                  onClick={() => onTogglePaid(expense.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                    expense.paid
                      ? 'bg-primary/10 border border-primary/30'
                      : 'bg-background-card border border-transparent'
                  }`}
                >
                  {expense.paid ? (
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-500 flex-shrink-0" />
                  )}
                  <span className={`flex-1 text-left ${expense.paid ? 'text-gray-400 line-through' : 'text-white'}`}>
                    {expense.name}
                  </span>
                  <span className={expense.paid ? 'text-gray-500' : 'text-gray-300'}>
                    ${expense.amount.toLocaleString('es-CO')}
                  </span>
                </button>
              )
            }

            // Multiple items - render as expandable group
            return (
              <div key={group.category} className="bg-background-card rounded-xl overflow-hidden">
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(group.category)}
                  className={`w-full flex items-center gap-3 p-4 transition-all ${
                    allPaid ? 'bg-primary/10' : ''
                  }`}
                >
                  {allPaid ? (
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                  ) : somePaid ? (
                    <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center flex-shrink-0">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                    </div>
                  ) : (
                    <Circle className="w-6 h-6 text-gray-500 flex-shrink-0" />
                  )}
                  <div className="flex-1 text-left">
                    <span className={allPaid ? 'text-gray-400 line-through' : 'text-white'}>
                      {group.category}
                    </span>
                    {!allPaid && pendingAmount > 0 && (
                      <p className="text-xs text-semaforo-amarillo">
                        Pendiente: ${pendingAmount.toLocaleString('es-CO')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={allPaid ? 'text-gray-500' : 'text-gray-300'}>
                      ${group.paidAmount.toLocaleString('es-CO')} / ${group.totalAmount.toLocaleString('es-CO')}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded sub-items */}
                {isExpanded && (
                  <div className="border-t border-gray-700 p-2 space-y-1">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => onTogglePaid(item.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                          item.paid
                            ? 'bg-primary/5'
                            : 'hover:bg-background'
                        }`}
                      >
                        {item.paid ? (
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-600 flex-shrink-0" />
                        )}
                        <span className={`flex-1 text-left text-sm ${item.paid ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                          {getDisplayName(item)}
                        </span>
                        <span className={`text-sm ${item.paid ? 'text-gray-600' : 'text-gray-400'}`}>
                          ${item.amount.toLocaleString('es-CO')}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {unpaidFixedExpenses > 0 && (
          <div className="mt-4 bg-semaforo-amarillo/10 border border-semaforo-amarillo/30 rounded-xl p-3">
            <p className="text-semaforo-amarillo text-sm">
              ⚠️ Te faltan ${unpaidFixedExpenses.toLocaleString('es-CO')} en fijos por pagar
            </p>
          </div>
        )}
      </div>

      {/* Recent variable expenses */}
      {recentExpenses.length > 0 && (
        <div className="px-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Últimos gastos registrados</h2>
          <div className="space-y-2">
            {recentExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center gap-3 p-3 bg-background-card rounded-xl"
              >
                <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">{expense.description}</p>
                  <p className="text-gray-500 text-xs">{expense.category}</p>
                </div>
                <span className="text-red-400 font-medium">
                  -${expense.amount.toLocaleString('es-CO')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
