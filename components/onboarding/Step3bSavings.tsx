'use client'

import { useState, useEffect } from 'react'
import { PiggyBank, Sparkles } from 'lucide-react'

interface Props {
  onNext: (savings: number) => void
  onBack: () => void
  initialValue?: number
}

export default function Step3bSavings({ onNext, onBack, initialValue = 0 }: Props) {
  const [savings, setSavings] = useState(initialValue)
  const [noSavings, setNoSavings] = useState(false)
  const [showPositiveMessage, setShowPositiveMessage] = useState(false)

  const formatMoney = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const handleInputChange = (value: string) => {
    const numericValue = parseInt(value.replace(/\./g, '')) || 0
    setSavings(numericValue)
    setNoSavings(false)
  }

  const handleNoSavings = () => {
    setNoSavings(true)
    setSavings(0)
  }

  // Mostrar mensaje positivo cuando el monto es significativo
  useEffect(() => {
    if (savings > 0) {
      const timer = setTimeout(() => setShowPositiveMessage(true), 300)
      return () => clearTimeout(timer)
    } else {
      setShowPositiveMessage(false)
    }
  }, [savings])

  const handleSubmit = () => {
    onNext(savings)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      {/* Progress indicator */}
      <div className="flex gap-2 mb-8">
        <div className="h-1 flex-1 bg-primary rounded"></div>
        <div className="h-1 flex-1 bg-primary rounded"></div>
        <div className="h-1 flex-1 bg-primary rounded"></div>
        <div className="h-1 flex-1 bg-primary/50 rounded"></div>
        <div className="h-1 flex-1 bg-gray-700 rounded"></div>
      </div>

      {/* Back button */}
      <button onClick={onBack} className="text-gray-400 text-sm mb-6">
        ← Volver
      </button>

      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
          <span className="text-4xl">🐷</span>
        </div>
      </div>

      {/* Question */}
      <h2 className="text-2xl font-bold text-white text-center mb-2">
        ¿Ya te estas pagando a ti mismo?
      </h2>
      <p className="text-gray-400 text-center mb-8">
        Si ya tienes un ahorro mensual programado, cuentame cuanto
      </p>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Savings input */}
        <div className="bg-background-card rounded-xl p-6 mb-4">
          <label className="text-gray-400 text-sm mb-2 block">
            Ahorro mensual programado
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">$</span>
            <input
              type="text"
              inputMode="numeric"
              value={savings > 0 ? formatMoney(savings.toString()) : ''}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="0"
              disabled={noSavings}
              className={`w-full bg-background border-2 rounded-xl py-4 pl-10 pr-4 text-2xl text-white outline-none transition-colors ${
                noSavings
                  ? 'border-gray-700 text-gray-500'
                  : 'border-gray-700 focus:border-primary'
              }`}
            />
          </div>

          {/* Positive message */}
          {showPositiveMessage && savings > 0 && (
            <div className="mt-4 flex items-center gap-2 text-primary animate-pulse">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">¡Bien ahi, cuadro! 💪</span>
            </div>
          )}
        </div>

        {/* No savings option */}
        <button
          onClick={handleNoSavings}
          className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
            noSavings
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-gray-700 text-gray-400 hover:border-gray-600'
          }`}
        >
          <PiggyBank className="w-5 h-5" />
          Todavia no ahorro
        </button>

        {/* Tip */}
        {noSavings && (
          <div className="bg-background-card rounded-xl p-4 mt-4">
            <p className="text-gray-400 text-sm">
              <span className="text-primary font-medium">Tip:</span> No pasa nada, parce. Con Cuadro vas a poder empezar a guardar aunque sea un poquito cada mes. El secreto esta en la constancia.
            </p>
          </div>
        )}

        {savings > 0 && (
          <div className="bg-background-card rounded-xl p-4 mt-4">
            <p className="text-gray-400 text-sm">
              <span className="text-primary font-medium">Excelente:</span> Ya tienes el habito mas importante de las finanzas personales. Ahora te ayudo a optimizar el resto.
            </p>
          </div>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={handleSubmit}
        className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-4 rounded-xl transition-all duration-200 mt-6"
      >
        Continuar →
      </button>
    </div>
  )
}
