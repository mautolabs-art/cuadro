'use client'

import { useState } from 'react'
import { LogOut, MessageSquare, ChevronRight, X, Check, Send } from 'lucide-react'

interface Props {
  onSendFeedback: (message: string) => Promise<boolean>
  onLogout: () => void
}

export default function SettingsPage({ onSendFeedback, onLogout }: Props) {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackSending, setFeedbackSending] = useState(false)
  const [feedbackSent, setFeedbackSent] = useState(false)

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

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-background-card p-6">
        <h1 className="text-xl font-bold text-white">Ajustes</h1>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Suggestions section */}
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
                <p className="text-white font-medium">Sugerencias</p>
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

        {/* Info text */}
        <p className="text-gray-500 text-sm text-center mt-8">
          Para editar tu ingreso, ahorro o gastos fijos, ve al Dashboard y toca el lápiz ✏️
        </p>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-background-card w-full max-w-md rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div>
                <h3 className="text-lg font-bold text-white">💬 Sugerencias</h3>
                <p className="text-gray-400 text-sm">Tu opinión nos ayuda a mejorar</p>
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
                  <p className="text-white font-medium text-lg">¡Gracias!</p>
                  <p className="text-gray-400 text-sm mt-1">Revisaremos tu sugerencia</p>
                </div>
              ) : (
                <>
                  <p className="text-gray-300 text-sm mb-3">
                    ¿Qué te gustaría que mejoremos? ¿Tienes alguna idea o algo no te gustó?
                  </p>
                  <textarea
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder="Escribe tu sugerencia aquí..."
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
                        <span>Enviar sugerencia</span>
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
