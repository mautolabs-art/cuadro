'use client'

import { useState } from 'react'
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { Loader2, AlertCircle } from 'lucide-react'

interface Props {
  onSuccess?: () => void
}

interface GoogleUserInfo {
  email: string
  name: string
  picture: string
  sub: string // Google user ID
}

const USER_KEY = 'cuadro_user'

export default function AuthScreen({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSuccess = (response: CredentialResponse) => {
    setLoading(true)
    setError(null)

    try {
      if (response.credential) {
        // Decode the JWT to get user info
        const userInfo: GoogleUserInfo = jwtDecode(response.credential)

        // Save user info to localStorage
        localStorage.setItem(USER_KEY, JSON.stringify({
          id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          loginMethod: 'google'
        }))

        // Call success callback
        onSuccess?.()
      }
    } catch (err) {
      console.error('Error decoding Google token:', err)
      setError('Hubo un problema con la autenticación. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('No se pudo iniciar sesión con Google. Intenta de nuevo.')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">Cuadro</h1>
        </div>

        {/* Google Sign-In */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-gray-400">Iniciando sesión...</span>
            </div>
          ) : (
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                size="large"
                text="continue_with"
                shape="rectangular"
                width="320"
              />
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex items-center justify-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <p className="text-gray-500 text-xs text-center mt-8">
          Un clic y listo. Accede desde cualquier dispositivo.
        </p>

        {/* Privacy note */}
        <div className="mt-6 p-4 bg-background-card rounded-xl">
          <p className="text-gray-400 text-xs text-center">
            🔒 Tus datos están protegidos con encriptación.
            Nunca compartimos tu información con terceros.
          </p>
        </div>
      </div>
    </div>
  )
}
