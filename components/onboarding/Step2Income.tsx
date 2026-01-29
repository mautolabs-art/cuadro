'use client'

import { useState } from 'react'
import { DollarSign } from 'lucide-react'

interface Props {
  onNext: (income: number) => void
  onBack: () => void
}

export default function Step2Income({ onNext, onBack }: Props) {
  const [income, setIncome] = useState('')

  const formatMoney = (value: string) => {
    // Remove non-numeric characters
    const numbers = value.replace(/\D/g, '')
    // Format with thousand separators
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatMoney(e.target.value)
    setIncome(formatted)
  }

  const handleSubmit = () => {
    const numericValue = parseInt(income.replace(/\./g, ''))
    if (numericValue > 0) {
      onNext(numericValue)
    }
  }

  const quickOptions = [
    { label: '1M', value: 1000000 },
    { label: '1.5M', value: 1500000 },
    { label: '2.5M', value: 2500000 },
    { label: '4M+', value: 4000000 },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      {/* Progress indicator */}
      <div className="flex gap-2 mb-8">
        <div className="h-1 flex-1 bg-primary rounded"></div>
        <div className="h-1 flex-1 bg-primary rounded"></div>
        <div className="h-1 flex-1 bg-gray-700 rounded"></div>
        <div className="h-1 flex-1 bg-gray-700 rounded"></div>
      </div>

      {/* Back button */}
      <button onClick={onBack} className="text-gray-400 text-sm mb-6">
        ← Volver
      </button>

      {/* Question */}
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-white mb-2">
          ¿Cuánta plata te entra al mes? 💰
        </h2>
        <p className="text-gray-400 mb-8">
          Tu salario o lo que te cae mensualmente
        </p>

        {/* Input */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
            $
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={income}
            onChange={handleChange}
            placeholder="0"
            className="w-full bg-background-card border-2 border-gray-700 focus:border-primary rounded-xl py-4 pl-10 pr-4 text-2xl text-white outline-none transition-colors"
          />
        </div>

        {/* Quick options */}
        <p className="text-gray-500 text-sm mb-3">Opciones comunes (o escribe cualquier monto arriba):</p>
        <div className="grid grid-cols-4 gap-2 mb-8">
          {quickOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setIncome(formatMoney(option.value.toString()))}
              className="bg-background-card hover:bg-background-light border border-gray-700 rounded-lg py-3 text-gray-300 text-sm transition-colors"
            >
              ${option.label}
            </button>
          ))}
        </div>

        {/* Privacy note */}
        <div className="bg-background-card/50 rounded-lg p-3 flex items-start gap-2">
          <span className="text-lg">🔒</span>
          <p className="text-gray-500 text-xs">
            Tu información está protegida y encriptada.
            Accede desde cualquier dispositivo.
          </p>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleSubmit}
        disabled={!income || parseInt(income.replace(/\./g, '')) <= 0}
        className="w-full bg-primary hover:bg-primary-dark disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all duration-200"
      >
        Continuar →
      </button>
    </div>
  )
}
