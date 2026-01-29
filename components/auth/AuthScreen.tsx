'use client'

import { useState } from 'react'
import { Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { auth } from '@/lib/supabase'

interface Props {
  onSuccess?: () => void
}

export default function AuthScreen({ onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValidEmail(email)) {
      setError('Por favor ingresa un email valido')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error: authError } = await auth.sendMagicLink(email)

      if (authError) {
        setError('Hubo un problema enviando el enlace. Intenta de nuevo.')
        console.error('Auth error:', authError)
      } else {
        setSent(true)
      }
    } catch (err) {
      setError('Algo salio mal. Intenta de nuevo.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          {/* Success icon */}
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-2">
            Revisa tu correo
          </h1>

          <p className="text-gray-400 mb-6">
            Te enviamos un enlace magico a <span className="text-primary font-medium">{email}</span>
          </p>

          <p className="text-gray-500 text-sm mb-8">
            Haz clic en el enlace para entrar a Cuadro. Si no lo ves, revisa la carpeta de spam.
          </p>

          {/* Continue button (temporal - for demo/testing) */}
          <button
            onClick={() => onSuccess?.()}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-4 rounded-xl transition-all duration-200 mb-4"
          >
            Continuar →
          </button>

          {/* Retry button */}
          <button
            onClick={() => {
              setSent(false)
              setEmail('')
            }}
            className="text-primary hover:text-primary-light transition-colors text-sm"
          >
            Usar otro email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Cuadro</h1>
          <p className="text-gray-400">
            Tu parcero financiero personal
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email input */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError(null)
              }}
              placeholder="tucorreo@ejemplo.com"
              className="w-full bg-background-card border-2 border-gray-700 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-gray-500 outline-none focus:border-primary transition-colors"
              disabled={loading}
              autoComplete="email"
              autoFocus
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full bg-primary hover:bg-primary-dark disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Mail className="w-5 h-5" />
                Enviar magic link
              </>
            )}
          </button>
        </form>

        {/* Info */}
        <p className="text-gray-500 text-xs text-center mt-6">
          Te enviaremos un enlace para entrar. Sin contrasenas, sin rollos.
        </p>
      </div>
    </div>
  )
}
