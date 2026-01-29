'use client'

import { useState } from 'react'
import { Check, FileText, Shield, AlertCircle } from 'lucide-react'

interface Props {
  onAccept: () => void
}

interface ConsentItem {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  link?: string
  linkText?: string
}

const consentItems: ConsentItem[] = [
  {
    id: 'terms',
    label: 'Términos y Condiciones',
    description: 'Acepto los términos de uso de Cuadro',
    icon: <FileText className="w-5 h-5" />,
    link: '/terminos',
    linkText: 'Leer términos'
  },
  {
    id: 'privacy',
    label: 'Política de Privacidad',
    description: 'Acepto el tratamiento de mis datos personales',
    icon: <Shield className="w-5 h-5" />,
    link: '/privacidad',
    linkText: 'Leer política'
  },
  {
    id: 'disclaimer',
    label: 'Entiendo que esto no es asesoría financiera',
    description: 'Cuadro es una herramienta educativa, no un asesor financiero certificado',
    icon: <AlertCircle className="w-5 h-5" />
  }
]

export default function LegalConsent({ onAccept }: Props) {
  const [consents, setConsents] = useState<Record<string, boolean>>({
    terms: false,
    privacy: false,
    disclaimer: false
  })

  const toggleConsent = (id: string) => {
    setConsents(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const allAccepted = Object.values(consents).every(Boolean)

  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Antes de empezar 📋
        </h2>
        <p className="text-gray-400">
          Por favor revisa y acepta los siguientes puntos
        </p>
      </div>

      {/* Consent items */}
      <div className="flex-1 space-y-4">
        {consentItems.map((item) => (
          <div
            key={item.id}
            className={`bg-background-card rounded-xl p-4 transition-all cursor-pointer ${
              consents[item.id] ? 'border-2 border-primary' : 'border-2 border-transparent'
            }`}
            onClick={() => toggleConsent(item.id)}
          >
            <div className="flex items-start gap-3">
              {/* Checkbox */}
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                  consents[item.id]
                    ? 'bg-primary text-white'
                    : 'bg-background-light border border-gray-600'
                }`}
              >
                {consents[item.id] && <Check className="w-4 h-4" />}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-400">{item.icon}</span>
                  <span className="text-white font-medium">{item.label}</span>
                </div>
                <p className="text-gray-500 text-sm">{item.description}</p>
                {item.link && (
                  <a
                    href={item.link}
                    onClick={(e) => e.stopPropagation()}
                    className="text-primary text-sm hover:underline mt-1 inline-block"
                  >
                    {item.linkText} →
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info box */}
      <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 my-6">
        <p className="text-primary text-sm">
          🔒 Tu información está segura. Usamos encriptación de nivel bancario 
          y nunca compartimos tus datos con terceros.
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onAccept}
        disabled={!allAccepted}
        className={`w-full font-semibold py-4 rounded-xl transition-all duration-200 ${
          allAccepted
            ? 'bg-primary hover:bg-primary-dark text-white'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        {allAccepted ? 'Continuar →' : 'Acepta todos para continuar'}
      </button>
    </div>
  )
}
