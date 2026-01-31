'use client'

import { useState } from 'react'
import { DollarSign, PiggyBank, Receipt, MessageSquare, LogOut, ChevronRight, Edit3, Check, X, Send } from 'lucide-react'
import EditFixedExpensesModal from '../dashboard/EditFixedExpensesModal'

interface FixedExpense {
  id: string
  name: string
  amount: number
  paid: boolean
}

interface Props {
  income: number
  savings: number
  fixedExpenses: FixedExpense[]
  onUpdateIncome: (income: number) => void
  onUpdateSavings: (savings: number) => void
  onUpdateFixedExpenses: (expenses: FixedExpense[]) => void
  onSendFeedback: (message: string) => Promise<boolean>
  onLogout: () => void
}

export default function SettingsPage({
  income,
  savings,
  fixedExpenses,
  onUpdateIncome,
  onUpdateSavings,
  onUpdateFixedExpenses,
  onSendFeedback,
  onLogout
}: Props) {
  const [editingIncome, setEditingIncome] = useState(false)
  const [editingSavings, setEditingSavings] = useState(false)
  const [tempIncome, setTempIncome] = useState(income.toString())
  const [tempSavings, setTempSavings] = useState(savings.toString())
  const [showFixedExpensesModal, setShowFixedExpensesModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackSending, setFeedbackSending] = useState(false)
  const [feedbackSent, setFeedbackSent] = useState(false)

  const formatMoney = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const handleSaveIncome = () => {
    const newIncome = parseInt(tempIncome.replace(/\./g, '')) || 0
    if (newIncome > 0) {
      onUpdateIncome(newIncome)
    }
    setEditingIncome(false)
  }

  const handleSaveSavings = () => {
    const newSavings = parseInt(tempSavings.replace(/\./g, '')) || 0
    onUpdateSavings(newSavings)
    setEditingSavings(false)
  }

  const handleSendFeedback = async () => {
    if (!feedbackMessage.trim()) return

    setFeedbackSending(true)
    const success = await onSendFeedback(feedbackMessage)
    setFeedbackSending(false)

    if (success) {
      setFeedbackSent(true)
      setFeedbackMessage('')
      setTimeout(() => {
        setShowFeedbackModal(false)
        setFeedbackSent(false)
      }, 2000)
    }
  }

  const totalFixedExpenses = fixedExpenses.reduce((sum, exp) => sum + exp.amount, 0)

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-background-card p-6">
        <h1 className="text-2xl font-bold text-white">Ajustes</h1>
        <p className="text-gray-400 text-sm mt-1">Configura tu presupuesto</p>
      </div>

      {/* Settings sections */}
      <div className="p-6 space-y-6">
        {/* Financial settings */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Tu presupuesto</h2>

          {/* Income */}
          <div className="bg-background-card rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-white font-medium">Ingreso mensual</p>
                  <p className="text-gray-500 text-sm">Lo que recibes al mes</p>
                </div>
              </div>
              {editingIncome ? (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatMoney(tempIncome)}
                      onChange={(e) => setTempIncome(e.target.value.replace(/\./g, ''))}
                      className="w-28 bg-background border border-gray-600 rounded-lg py-1.5 pl-6 pr-2 text-white text-right text-sm outline-none focus:border-primary"
                      autoFocus
                    />
                  </div>
                  <button onClick={handleSaveIncome} className="p-1.5 text-primary hover:bg-primary/20 rounded-lg">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingIncome(false)} className="p-1.5 text-gray-400 hover:bg-gray-700 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setTempIncome(income.toString())
                    setEditingIncome(true)
                  }}
                  className="flex items-center gap-2 text-gray-300 hover:text-primary transition-colors"
                >
                  <span className="font-medium">${income.toLocaleString('es-CO')}</span>
                  <Edit3 className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          </div>

          {/* Savings */}
          <div className="bg-background-card rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-semaforo-verde/20 rounded-lg flex items-center justify-center">
                  <PiggyBank className="w-5 h-5 text-semaforo-verde" />
                </div>
                <div>
                  <p className="text-white font-medium">Ahorro mensual</p>
                  <p className="text-gray-500 text-sm">Lo que guardas cada mes</p>
                </div>
              </div>
              {editingSavings ? (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatMoney(tempSavings)}
                      onChange={(e) => setTempSavings(e.target.value.replace(/\./g, ''))}
                      className="w-28 bg-background border border-gray-600 rounded-lg py-1.5 pl-6 pr-2 text-white text-right text-sm outline-none focus:border-primary"
                      autoFocus
                    />
                  </div>
                  <button onClick={handleSaveSavings} className="p-1.5 text-primary hover:bg-primary/20 rounded-lg">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingSavings(false)} className="p-1.5 text-gray-400 hover:bg-gray-700 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setTempSavings(savings.toString())
                    setEditingSavings(true)
                  }}
                  className="flex items-center gap-2 text-gray-300 hover:text-primary transition-colors"
                >
                  <span className="font-medium">${savings.toLocaleString('es-CO')}</span>
                  <Edit3 className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          </div>

          {/* Fixed expenses */}
          <button
            onClick={() => setShowFixedExpensesModal(true)}
            className="w-full bg-background-card rounded-xl p-4 flex items-center justify-between hover:bg-background-card/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-semaforo-amarillo/20 rounded-lg flex items-center justify-center">
                <Receipt className="w-5 h-5 text-semaforo-amarillo" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Gastos fijos</p>
                <p className="text-gray-500 text-sm">{fixedExpenses.length} gastos • ${totalFixedExpenses.toLocaleString('es-CO')}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Feedback section */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Ayúdanos a mejorar</h2>

          <button
            onClick={() => setShowFeedbackModal(true)}
            className="w-full bg-background-card rounded-xl p-4 flex items-center justify-between hover:bg-background-card/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Enviar feedback</p>
                <p className="text-gray-500 text-sm">Cuéntanos qué mejorar</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Logout section */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Cuenta</h2>

          <button
            onClick={onLogout}
            className="w-full bg-background-card rounded-xl p-4 flex items-center gap-3 hover:bg-red-500/10 transition-colors group"
          >
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-red-400 font-medium">Cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* Edit Fixed Expenses Modal */}
      <EditFixedExpensesModal
        isOpen={showFixedExpensesModal}
        onClose={() => setShowFixedExpensesModal(false)}
        fixedExpenses={fixedExpenses}
        onSave={onUpdateFixedExpenses}
      />

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-background-card w-full max-w-md rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div>
                <h3 className="text-lg font-bold text-white">Enviar feedback</h3>
                <p className="text-gray-400 text-sm">Tu opinión nos ayuda a mejorar Cuadro</p>
              </div>
              <button
                onClick={() => {
                  setShowFeedbackModal(false)
                  setFeedbackMessage('')
                  setFeedbackSent(false)
                }}
                className="p-2 hover:bg-background rounded-lg"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {feedbackSent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-white font-medium text-lg">¡Gracias por tu feedback!</p>
                  <p className="text-gray-400 text-sm mt-1">Lo revisaremos pronto</p>
                </div>
              ) : (
                <>
                  <p className="text-gray-300 text-sm mb-3">
                    ¿Qué te gustaría que mejoremos? ¿Algo no te quedó claro o no te gustó?
                  </p>
                  <textarea
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder="Escribe tu feedback aquí..."
                    rows={4}
                    className="w-full bg-background border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 outline-none focus:border-primary resize-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSendFeedback}
                    disabled={!feedbackMessage.trim() || feedbackSending}
                    className="w-full mt-4 bg-primary hover:bg-primary-dark disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {feedbackSending ? (
                      <span>Enviando...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Enviar feedback</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
