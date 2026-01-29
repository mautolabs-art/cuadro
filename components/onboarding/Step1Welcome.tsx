'use client'

import { Sparkles } from 'lucide-react'

interface Props {
  onNext: () => void
}

export default function Step1Welcome({ onNext }: Props) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      {/* Logo/Icon */}
      <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-8">
        <Sparkles className="w-12 h-12 text-primary" />
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-white mb-4">
        ¿Qué más, cuadro? 👋
      </h1>

      {/* Subtitle */}
      <p className="text-gray-400 text-lg mb-2">
        Te ayudo a cuadrar tus cuentas
      </p>

      {/* Value proposition */}
      <p className="text-gray-300 text-base mb-8 max-w-xs">
        Te ayudo a descubrir a dónde se va tu plata y a
        <span className="text-primary font-semibold"> pillar esos gastos hormiga</span>
      </p>

      {/* Social proof */}
      <div className="bg-background-card rounded-xl p-4 mb-8 max-w-sm">
        <p className="text-gray-400 text-sm italic">
          "Nunca había sabido administrar mi dinero. Al final del mes me sorprendí:
          <span className="text-primary"> ¡realmente me sobró plata!</span>"
        </p>
        <p className="text-gray-500 text-xs mt-2">— Vivian, usuaria</p>
      </div>

      {/* CTA Button */}
      <button
        onClick={onNext}
        className="w-full max-w-xs bg-primary hover:bg-primary-dark text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105"
      >
        Empezar →
      </button>

      {/* Time estimate */}
      <p className="text-gray-500 text-sm mt-4">
        ⏱️ Solo toma 2 minutos
      </p>
    </div>
  )
}
