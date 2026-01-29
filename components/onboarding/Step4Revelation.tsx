'use client'

import { useEffect, useState } from 'react'
import { Sparkles, TrendingUp, PiggyBank } from 'lucide-react'

interface FixedExpense {
  id: string
  name: string
  amount: number
}

interface Props {
  income: number
  fixedExpenses: FixedExpense[]
  savings?: number
  onComplete: () => void
}

export default function Step4Revelation({ income, fixedExpenses, savings = 0, onComplete }: Props) {
  const [showAmount, setShowAmount] = useState(false)
  const [animatedValue, setAnimatedValue] = useState(0)

  const totalFixed = fixedExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  const totalCommitted = totalFixed + savings // Gastos fijos + ahorro programado
  const available = income - totalCommitted
  const percentageAvailable = Math.round((available / income) * 100)
  const hasSavings = savings > 0

  // Animate the number
  useEffect(() => {
    const timer = setTimeout(() => setShowAmount(true), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (showAmount) {
      const duration = 1500
      const steps = 50
      const increment = available / steps
      let current = 0

      const interval = setInterval(() => {
        current += increment
        if (current >= available) {
          setAnimatedValue(available)
          clearInterval(interval)
        } else {
          setAnimatedValue(Math.round(current))
        }
      }, duration / steps)

      return () => clearInterval(interval)
    }
  }, [showAmount, available])

  // Determine semaphore color
  const getSemaforoColor = () => {
    if (percentageAvailable >= 30) return 'text-semaforo-verde'
    if (percentageAvailable >= 15) return 'text-semaforo-amarillo'
    return 'text-semaforo-rojo'
  }

  const getSemaforoMessage = () => {
    if (percentageAvailable >= 30) {
      return {
        emoji: '🎉',
        title: '¡Bien ahi!',
        message: hasSavings
          ? 'Tienes buen margen y ya estas ahorrando. ¡Sos un cuadro!'
          : 'Tienes buen margen pa\' los gusticos y guardar algo.'
      }
    }
    if (percentageAvailable >= 15) {
      return {
        emoji: '⚠️',
        title: 'Ojo pues',
        message: hasSavings
          ? 'El margen esta ajustado, pero ya estas ahorrando. ¡Sigue asi!'
          : 'El margen esta ajustado. Cada gastico hormiga cuenta.'
      }
    }
    return {
      emoji: '🚨',
      title: 'Pilas',
      message: hasSavings
        ? 'El margen esta apretado, pero que chimba que ya ahorras. Revisemos juntos.'
        : 'El margen esta apretado. Toca cuidar cada peso.'
    }
  }

  const semaforo = getSemaforoMessage()

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      {/* Progress complete */}
      <div className="flex gap-2 mb-8 w-full max-w-xs">
        <div className="h-1 flex-1 bg-primary rounded"></div>
        <div className="h-1 flex-1 bg-primary rounded"></div>
        <div className="h-1 flex-1 bg-primary rounded"></div>
        <div className="h-1 flex-1 bg-primary rounded"></div>
        <div className="h-1 flex-1 bg-primary rounded"></div>
      </div>

      {/* Celebration icon */}
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
        percentageAvailable >= 30 ? 'bg-semaforo-verde/20' :
        percentageAvailable >= 15 ? 'bg-semaforo-amarillo/20' :
        'bg-semaforo-rojo/20'
      }`}>
        <span className="text-4xl">{semaforo.emoji}</span>
      </div>

      {/* Title */}
      <h2 className="text-xl text-gray-400 mb-2">
        Lo que te queda pa'l mes es:
      </h2>

      {/* The big number */}
      <div className={`money-display mb-4 ${getSemaforoColor()}`}>
        <span className="text-5xl font-bold">
          ${showAmount ? animatedValue.toLocaleString('es-CO') : '---'}
        </span>
      </div>

      {/* Percentage */}
      <p className="text-gray-500 mb-6">
        {percentageAvailable}% de tus ingresos
      </p>

      {/* Status message */}
      <div className="bg-background-card rounded-xl p-4 mb-6 max-w-sm">
        <h3 className={`font-bold mb-1 ${getSemaforoColor()}`}>
          {semaforo.title}
        </h3>
        <p className="text-gray-400 text-sm">
          {semaforo.message}
        </p>
      </div>

      {/* Breakdown */}
      <div className="w-full max-w-sm bg-background-card rounded-xl p-4 mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Ingresos</span>
          <span className="text-white">${income.toLocaleString('es-CO')}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Gastos fijos</span>
          <span className="text-red-400">-${totalFixed.toLocaleString('es-CO')}</span>
        </div>
        {hasSavings && (
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400 flex items-center gap-1">
              <PiggyBank className="w-3 h-3" />
              Ahorro programado
            </span>
            <span className="text-primary">-${savings.toLocaleString('es-CO')}</span>
          </div>
        )}
        <div className="border-t border-gray-700 my-2"></div>
        <div className="flex justify-between">
          <span className="text-gray-400">Te queda para vivir</span>
          <span className={`font-bold ${getSemaforoColor()}`}>
            ${available.toLocaleString('es-CO')}
          </span>
        </div>
      </div>

      {/* Savings celebration */}
      {hasSavings && (
        <div className="w-full max-w-sm bg-primary/10 border border-primary/30 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-xl">💪</span>
            </div>
            <div>
              <p className="text-primary font-medium text-sm">¡Ya estas ahorrando!</p>
              <p className="text-gray-400 text-xs">
                Eso te pone adelante del 80% de los colombianos. Sigue asi, cuadro.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Insight */}
      <div className="flex items-center gap-2 text-gray-400 text-sm mb-8">
        <TrendingUp className="w-4 h-4 text-primary" />
        <span>Te ayudo a cuidar cada peso de esa plata</span>
      </div>

      {/* CTA */}
      <button
        onClick={onComplete}
        className="w-full max-w-xs bg-primary hover:bg-primary-dark text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
      >
        <Sparkles className="w-5 h-5" />
        ¡Dale, empecemos!
      </button>
    </div>
  )
}
