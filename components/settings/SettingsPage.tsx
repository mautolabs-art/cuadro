'use client'

import { useState, useEffect } from 'react'
import { LogOut, MessageSquare, ChevronRight, X, Check, Send, Bell, BellOff } from 'lucide-react'
import {
  isNotificationSupported,
  getNotificationPermission,
  areNotificationsEnabled,
  requestNotificationPermission,
  disableNotifications,
  enableNotifications
} from '@/lib/notifications'

interface Props {
  onSendFeedback: (message: string) => Promise<boolean>
  onLogout: () => void
}

export default function SettingsPage({ onSendFeedback, onLogout }: Props) {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackSending, setFeedbackSending] = useState(false)
  const [feedbackSent, setFeedbackSent] = useState(false)

  // Notification state
  const [notificationsSupported, setNotificationsSupported] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<string>('default')
  const [requestingPermission, setRequestingPermission] = useState(false)

  useEffect(() => {
    // Check notification support and status on mount
    const supported = isNotificationSupported()
    setNotificationsSupported(supported)

    if (supported) {
      setNotificationPermission(getNotificationPermission())
      setNotificationsEnabled(areNotificationsEnabled())
    }
  }, [])

  const handleToggleNotifications = async () => {
    if (notificationsEnabled) {
      // Disable notifications
      disableNotifications()
      setNotificationsEnabled(false)
    } else {
      // Enable notifications - need to request permission if not granted
      if (notificationPermission !== 'granted') {
        setRequestingPermission(true)
        const granted = await requestNotificationPermission()
        setRequestingPermission(false)

        if (granted) {
          setNotificationPermission('granted')
          setNotificationsEnabled(true)
        }
      } else {
        enableNotifications()
        setNotificationsEnabled(true)
      }
    }
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

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-background-card p-6">
        <h1 className="text-xl font-bold text-white">Ajustes</h1>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Notifications section */}
        {notificationsSupported && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Recordatorios</h2>

            <button
              onClick={handleToggleNotifications}
              disabled={requestingPermission || notificationPermission === 'denied'}
              className="w-full bg-background-card rounded-xl p-4 flex items-center justify-between hover:bg-background-card/80 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  notificationsEnabled ? 'bg-primary/20' : 'bg-gray-700'
                }`}>
                  {notificationsEnabled ? (
                    <Bell className="w-5 h-5 text-primary" />
                  ) : (
                    <BellOff className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Recordatorio diario</p>
                  <p className="text-gray-500 text-sm">
                    {notificationPermission === 'denied'
                      ? 'Bloqueado en tu navegador'
                      : notificationsEnabled
                        ? 'Te recordamos a las 9pm'
                        : 'Activa para no olvidar registrar'
                    }
                  </p>
                </div>
              </div>
              <div className={`w-12 h-7 rounded-full p-1 transition-colors ${
                notificationsEnabled ? 'bg-primary' : 'bg-gray-600'
              }`}>
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
            </button>

            {notificationPermission === 'denied' && (
              <p className="text-semaforo-amarillo text-xs px-2">
                ⚠️ Las notificaciones están bloqueadas. Ve a la configuración de tu navegador para activarlas.
              </p>
            )}
          </div>
        )}

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
