'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, CheckCircle2, Circle, TrendingDown, Home } from 'lucide-react'

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

interface Props {
  income: number
  fixedExpenses: FixedExpense[]
  variableExpenses: VariableExpense[]
  onTogglePaid: (id: string) => void
  onOpenChat: () => void
}

export default function Dashboard({
  income,
  fixedExpenses,
  variableExpenses,
  onTogglePaid,
  onOpenChat
}: Props) {
  const [currentDate] = useState(new Date())

  // Calculations
  const totalFixedExpenses = fixedExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  const paidFixedExpenses = fixedExpenses.filter(exp => exp.paid).reduce((sum, exp) => sum + exp.amount, 0)
  const unpaidFixedExpenses = totalFixedExpenses - paidFixedExpenses
  const totalVariableExpenses = variableExpenses.reduce((sum, exp) => sum + exp.amount, 0)

  // Available = Income - Fixed - Variable
  const initialAvailable = income - totalFixedExpenses
  const currentAvailable = income - paidFixedExpenses - totalVariableExpenses - unpaidFixedExpenses

  // Percentage for semaphore
  const percentageSpent = Math.round(((paidFixedExpenses + totalVariableExpenses) / income) * 100)
  const percentageAvailable = 100 - percentageSpent

  // Semaphore logic
  const getSemaforoColor = () => {
    const ratio = currentAvailable / initialAvailable
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

  // Recent variable expenses
  const recentExpenses = variableExpenses.slice(-3).reverse()

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-background-card p-6 pb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <Home className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-gray-400 text-sm capitalize">{monthName} 2025</p>
              <h1 className="text-xl font-bold text-white">Lo que te queda</h1>
            </div>
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
            {percentageAvailable}% de tu presupuesto inicial
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-background rounded-xl p-3">
            <p className="text-gray-500 text-xs">Gastado en fijos</p>
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

      {/* Fixed expenses checklist */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">Gastos fijos del mes</h2>
          <span className="text-sm text-gray-400">
            {fixedExpenses.filter(e => e.paid).length}/{fixedExpenses.length} pagados
          </span>
        </div>

        <div className="space-y-2">
          {fixedExpenses.map((expense) => (
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
          ))}
        </div>

        {unpaidFixedExpenses > 0 && (
          <div className="mt-4 bg-semaforo-amarillo/10 border border-semaforo-amarillo/30 rounded-xl p-3">
            <p className="text-semaforo-amarillo text-sm">
              ⚠️ Ojo, te faltan ${unpaidFixedExpenses.toLocaleString('es-CO')} en fijos por pagar
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

      {/* Floating chat button */}
      <button
        onClick={onOpenChat}
        className="fixed bottom-6 right-6 w-16 h-16 bg-primary rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 transition-transform"
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </button>

      {/* Chat hint */}
      <div className="fixed bottom-24 right-6 bg-background-card px-4 py-2 rounded-xl shadow-lg max-w-[200px]">
        <p className="text-gray-300 text-sm">
          💬 Cuéntame en qué gastaste
        </p>
      </div>
    </div>
  )
}
