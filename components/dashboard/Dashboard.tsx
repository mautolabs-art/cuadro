'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, TrendingDown, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, PiggyBank, Pencil } from 'lucide-react'
import EditFixedExpensesModal from './EditFixedExpensesModal'

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
  savings: number
  fixedExpenses: FixedExpense[]
  variableExpenses: VariableExpense[]
  currentMonth: number
  currentYear: number
  onTogglePaid: (id: string) => void
  onChangeMonth: (month: number, year: number) => void
  onUpdateFixedExpenses: (expenses: FixedExpense[]) => void
}

export default function Dashboard({
  income,
  savings,
  fixedExpenses,
  variableExpenses,
  currentMonth,
  currentYear,
  onTogglePaid,
  onChangeMonth,
  onUpdateFixedExpenses
}: Props) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [showEditModal, setShowEditModal] = useState(false)

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

  // Calculations - NOW SUBTRACTING SAVINGS
  const totalFixedExpenses = fixedExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  const paidFixedExpenses = fixedExpenses.filter(exp => exp.paid).reduce((sum, exp) => sum + exp.amount, 0)
  const unpaidFixedExpenses = totalFixedExpenses - paidFixedExpenses
  const totalVariableExpenses = variableExpenses.reduce((sum, exp) => sum + exp.amount, 0)

  // Available = Income - Savings - Paid Fixed - Variable - Pending Fixed
  const currentAvailable = income - savings - paidFixedExpenses - totalVariableExpenses - unpaidFixedExpenses

  // Percentage for semaphore (based on what's available after savings and fixed)
  const initialAvailable = income - savings - totalFixedExpenses
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

  // Month names in Spanish
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const monthName = monthNames[currentMonth - 1]

  // Check if viewing current month
  const now = new Date()
  const isCurrentMonth = currentMonth === (now.getMonth() + 1) && currentYear === now.getFullYear()

  // Navigation handlers
  const goToPreviousMonth = () => {
    if (currentMonth === 1) {
      onChangeMonth(12, currentYear - 1)
    } else {
      onChangeMonth(currentMonth - 1, currentYear)
    }
  }

  const goToNextMonth = () => {
    // Don't allow navigating past current month
    if (isCurrentMonth) return

    if (currentMonth === 12) {
      onChangeMonth(1, currentYear + 1)
    } else {
      onChangeMonth(currentMonth + 1, currentYear)
    }
  }

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
    <div className="min-h-screen bg-background pb-24">
      {/* Header with month navigation */}
      <div className="bg-background-card p-6 pb-8">
        <div className="flex justify-center items-center gap-4 mb-6">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-background rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-400" />
          </button>
          <div className="text-center min-w-[160px]">
            <h1 className="text-xl font-bold text-white">{monthName} {currentYear}</h1>
            {!isCurrentMonth && (
              <p className="text-gray-500 text-xs mt-1">Mes anterior</p>
            )}
          </div>
          <button
            onClick={goToNextMonth}
            className={`p-2 rounded-lg transition-colors ${
              isCurrentMonth
                ? 'text-gray-700 cursor-not-allowed'
                : 'hover:bg-background text-gray-400'
            }`}
            disabled={isCurrentMonth}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Income and Savings summary */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-background rounded-xl p-3">
            <p className="text-gray-500 text-xs">Ingreso</p>
            <p className="text-white font-semibold">${income.toLocaleString('es-CO')}</p>
          </div>
          <div className="bg-background rounded-xl p-3">
            <div className="flex items-center gap-1">
              <PiggyBank className="w-3 h-3 text-semaforo-verde" />
              <p className="text-gray-500 text-xs">Ahorro</p>
            </div>
            <p className="text-semaforo-verde font-semibold">${savings.toLocaleString('es-CO')}</p>
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
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">
              {fixedExpenses.filter(e => e.paid).length}/{fixedExpenses.length} pagados
            </span>
            <button
              onClick={() => setShowEditModal(true)}
              className="p-1.5 hover:bg-background-card rounded-lg transition-colors"
              title="Editar gastos fijos"
            >
              <Pencil className="w-4 h-4 text-gray-400 hover:text-primary" />
            </button>
          </div>
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

      {/* Edit Fixed Expenses Modal */}
      <EditFixedExpensesModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        fixedExpenses={fixedExpenses}
        onSave={onUpdateFixedExpenses}
      />
    </div>
  )
}
