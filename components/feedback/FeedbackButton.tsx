'use client'

import { useState } from 'react'
import { MessageSquare, X, Check, Send } from 'lucide-react'

interface Props {
  onSendFeedback: (message: string) => Promise<boolean>
}

export default function FeedbackButton({ onSendFeedback }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSend = async () => {
    if (!message.trim()) return

    setSending(true)
    const success = await onSendFeedback(message)
    setSending(false)

    if (success) {
      setSent(true)
      setMessage('')
      setTimeout(() => {
        setShowModal(false)
        setSent(false)
      }, 2000)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-20 right-4 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-full shadow-lg shadow-primary/30 flex items-center gap-2 transition-all hover:scale-105 z-30"
      >
        <MessageSquare className="w-4 h-4" />
        <span className="text-sm font-medium">Sugerencias</span>
      </button>

      {/* Modal */}
      {showModal && (
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
                  setShowModal(false)
                  setMessage('')
                  setSent(false)
                }}
                className="p-2 hover:bg-background rounded-lg"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {sent ? (
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
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribe tu sugerencia aquí..."
                    rows={4}
                    className="w-full bg-background border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 outline-none focus:border-primary resize-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSend}
                    disabled={!message.trim() || sending}
                    className="w-full mt-4 bg-primary hover:bg-primary-dark disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {sending ? (
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
    </>
  )
}
