'use client'

import { useState } from 'react'
import { Home, Wifi, Tv, Car, CreditCard, Heart, GraduationCap, Smartphone, Plus, X, Zap, Droplets, Flame, Building, Signal, Apple, ShoppingBag, Music, Gamepad2, Cloud, Film } from 'lucide-react'

interface SubItem {
  id: string
  name: string
  amount: number
  isCustom?: boolean
}

interface FixedExpense {
  id: string
  name: string
  icon: string
  amount: number
  selected: boolean
  hasSubItems?: boolean
  subItems?: SubItem[]
}

interface Props {
  onNext: (expenses: FixedExpense[]) => void
  onBack: () => void
}

const defaultExpenses: FixedExpense[] = [
  { id: 'arriendo', name: 'Arriendo/Hipoteca', icon: 'home', amount: 0, selected: false },
  {
    id: 'servicios',
    name: 'Servicios del hogar',
    icon: 'wifi',
    amount: 0,
    selected: false,
    hasSubItems: true,
    subItems: [
      { id: 'luz', name: 'Luz', amount: 0 },
      { id: 'agua', name: 'Agua', amount: 0 },
      { id: 'gas', name: 'Gas', amount: 0 },
      { id: 'internet', name: 'Internet', amount: 0 },
      { id: 'celular', name: 'Plan celular', amount: 0 },
      { id: 'admin', name: 'Admón edificio', amount: 0 },
    ]
  },
  {
    id: 'streaming',
    name: 'Streaming y suscripciones',
    icon: 'tv',
    amount: 0,
    selected: false,
    hasSubItems: true,
    subItems: [
      { id: 'netflix', name: 'Netflix', amount: 0 },
      { id: 'spotify', name: 'Spotify', amount: 0 },
      { id: 'amazon', name: 'Amazon Prime', amount: 0 },
      { id: 'apple', name: 'Apple (iCloud/Music/TV)', amount: 0 },
      { id: 'disney', name: 'Disney+', amount: 0 },
      { id: 'hbo', name: 'Max (HBO)', amount: 0 },
      { id: 'youtube', name: 'YouTube Premium', amount: 0 },
      { id: 'gaming', name: 'Gaming (Xbox/PS/Nintendo)', amount: 0 },
    ]
  },
  { id: 'transporte', name: 'Transporte/Gasolina', icon: 'car', amount: 0, selected: false },
  { id: 'credito', name: 'Tarjeta de crédito', icon: 'creditcard', amount: 0, selected: false },
  { id: 'salud', name: 'EPS/Medicina prepagada', icon: 'heart', amount: 0, selected: false },
  { id: 'educacion', name: 'Educación/Cursos', icon: 'graduation', amount: 0, selected: false },
]

const iconMap: { [key: string]: React.ReactNode } = {
  home: <Home className="w-5 h-5" />,
  wifi: <Wifi className="w-5 h-5" />,
  smartphone: <Smartphone className="w-5 h-5" />,
  tv: <Tv className="w-5 h-5" />,
  car: <Car className="w-5 h-5" />,
  creditcard: <CreditCard className="w-5 h-5" />,
  heart: <Heart className="w-5 h-5" />,
  graduation: <GraduationCap className="w-5 h-5" />,
  custom: <Plus className="w-5 h-5" />,
}

const subItemIcons: { [key: string]: React.ReactNode } = {
  luz: <Zap className="w-4 h-4" />,
  agua: <Droplets className="w-4 h-4" />,
  gas: <Flame className="w-4 h-4" />,
  internet: <Wifi className="w-4 h-4" />,
  celular: <Signal className="w-4 h-4" />,
  admin: <Building className="w-4 h-4" />,
  netflix: <Film className="w-4 h-4" />,
  spotify: <Music className="w-4 h-4" />,
  amazon: <ShoppingBag className="w-4 h-4" />,
  apple: <Apple className="w-4 h-4" />,
  disney: <Tv className="w-4 h-4" />,
  hbo: <Tv className="w-4 h-4" />,
  youtube: <Film className="w-4 h-4" />,
  gaming: <Gamepad2 className="w-4 h-4" />,
  cloud: <Cloud className="w-4 h-4" />,
}

export default function Step3FixedExpenses({ onNext, onBack }: Props) {
  const [expenses, setExpenses] = useState<FixedExpense[]>(defaultExpenses)
  const [showCustom, setShowCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [addingSubItemTo, setAddingSubItemTo] = useState<string | null>(null)
  const [newSubItemName, setNewSubItemName] = useState('')

  const formatMoney = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const toggleExpense = (id: string) => {
    setExpenses(prev =>
      prev.map(exp =>
        exp.id === id ? { ...exp, selected: !exp.selected } : exp
      )
    )
  }

  const updateAmount = (id: string, value: string) => {
    const numericValue = parseInt(value.replace(/\./g, '')) || 0
    setExpenses(prev =>
      prev.map(exp =>
        exp.id === id ? { ...exp, amount: numericValue } : exp
      )
    )
  }

  const updateSubItemAmount = (expenseId: string, subItemId: string, value: string) => {
    const numericValue = parseInt(value.replace(/\./g, '')) || 0
    setExpenses(prev =>
      prev.map(exp => {
        if (exp.id === expenseId && exp.subItems) {
          const updatedSubItems = exp.subItems.map(sub =>
            sub.id === subItemId ? { ...sub, amount: numericValue } : sub
          )
          const totalAmount = updatedSubItems.reduce((sum, sub) => sum + sub.amount, 0)
          return { ...exp, subItems: updatedSubItems, amount: totalAmount }
        }
        return exp
      })
    )
  }

  const addSubItem = (expenseId: string) => {
    if (!newSubItemName.trim()) return

    setExpenses(prev =>
      prev.map(exp => {
        if (exp.id === expenseId && exp.subItems) {
          const newSubItem: SubItem = {
            id: `custom-${Date.now()}`,
            name: newSubItemName.trim(),
            amount: 0,
            isCustom: true
          }
          return { ...exp, subItems: [...exp.subItems, newSubItem] }
        }
        return exp
      })
    )
    setNewSubItemName('')
    setAddingSubItemTo(null)
  }

  const removeSubItem = (expenseId: string, subItemId: string) => {
    setExpenses(prev =>
      prev.map(exp => {
        if (exp.id === expenseId && exp.subItems) {
          const updatedSubItems = exp.subItems.filter(sub => sub.id !== subItemId)
          const totalAmount = updatedSubItems.reduce((sum, sub) => sum + sub.amount, 0)
          return { ...exp, subItems: updatedSubItems, amount: totalAmount }
        }
        return exp
      })
    )
  }

  const addCustomExpense = () => {
    if (customName.trim()) {
      const newExpense: FixedExpense = {
        id: `custom-${Date.now()}`,
        name: customName.trim(),
        icon: 'custom',
        amount: 0,
        selected: true
      }
      setExpenses(prev => [...prev, newExpense])
      setCustomName('')
      setShowCustom(false)
    }
  }

  const removeExpense = (id: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id))
  }

  const selectedExpenses = expenses.filter(exp => exp.selected)
  const totalFixed = selectedExpenses.reduce((sum, exp) => sum + exp.amount, 0)

  const handleSubmit = () => {
    onNext(selectedExpenses)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      {/* Progress indicator */}
      <div className="flex gap-2 mb-8">
        <div className="h-1 flex-1 bg-primary rounded"></div>
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
      <h2 className="text-2xl font-bold text-white mb-2">
        ¿Qué gastos fijos tienes? 📋
      </h2>
      <p className="text-gray-400 mb-6">
        Elige los que apliquen y pon cuánto pagas
      </p>

      {/* Expenses list */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className={`bg-background-card rounded-xl p-4 transition-all ${
              expense.selected ? 'border-2 border-primary' : 'border-2 border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Checkbox area */}
              <button
                onClick={() => toggleExpense(expense.id)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${
                  expense.selected
                    ? 'bg-primary text-white'
                    : 'bg-background-light text-gray-400'
                }`}
              >
                {iconMap[expense.icon]}
              </button>

              {/* Name and total for items with subitems */}
              <div className="flex-1 min-w-0">
                <span className="text-white">{expense.name}</span>
                {expense.selected && expense.hasSubItems && expense.amount > 0 && (
                  <p className="text-primary text-sm font-medium">
                    Total: ${expense.amount.toLocaleString('es-CO')}
                  </p>
                )}
              </div>

              {/* Remove custom */}
              {expense.id.startsWith('custom-') && (
                <button
                  onClick={() => removeExpense(expense.id)}
                  className="text-gray-500 hover:text-red-400 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Amount input or SubItems (only when selected) */}
            {expense.selected && (
              <>
                {expense.hasSubItems && expense.subItems ? (
                  // Sub-items grid
                  <div className="mt-3 space-y-2">
                    <p className="text-gray-500 text-xs mb-2">¿Cuánto pagas de cada uno? (deja en 0 si no aplica)</p>
                    <div className="grid grid-cols-2 gap-2">
                      {expense.subItems.map((subItem) => (
                        <div key={subItem.id} className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-md bg-background flex items-center justify-center text-gray-400 flex-shrink-0">
                            {subItemIcons[subItem.id] || <Plus className="w-3 h-3" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <p className="text-gray-400 text-xs truncate">{subItem.name}</p>
                              {subItem.isCustom && (
                                <button
                                  onClick={() => removeSubItem(expense.id, subItem.id)}
                                  className="text-gray-600 hover:text-red-400"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={subItem.amount > 0 ? formatMoney(subItem.amount.toString()) : ''}
                                onChange={(e) => updateSubItemAmount(expense.id, subItem.id, e.target.value)}
                                placeholder="0"
                                className="w-full bg-background border border-gray-700 rounded-md py-1.5 pl-5 pr-2 text-white text-sm outline-none focus:border-primary"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add new sub-item button */}
                    {addingSubItemTo === expense.id ? (
                      <div className="flex gap-2 mt-2">
                        <input
                          type="text"
                          value={newSubItemName}
                          onChange={(e) => setNewSubItemName(e.target.value)}
                          placeholder="Nombre del servicio..."
                          className="flex-1 bg-background border border-gray-700 rounded-md py-1.5 px-2 text-white text-sm outline-none focus:border-primary"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') addSubItem(expense.id)
                            if (e.key === 'Escape') setAddingSubItemTo(null)
                          }}
                        />
                        <button
                          onClick={() => addSubItem(expense.id)}
                          className="bg-primary text-white px-3 py-1.5 rounded-md text-sm"
                        >
                          +
                        </button>
                        <button
                          onClick={() => setAddingSubItemTo(null)}
                          className="bg-gray-700 text-white px-3 py-1.5 rounded-md text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingSubItemTo(expense.id)}
                        className="w-full mt-2 border border-dashed border-gray-600 rounded-md py-2 text-gray-400 text-xs hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Agregar otro
                      </button>
                    )}
                  </div>
                ) : (
                  // Regular single input
                  <div className="mt-3 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={expense.amount > 0 ? formatMoney(expense.amount.toString()) : ''}
                      onChange={(e) => updateAmount(expense.id, e.target.value)}
                      placeholder="Monto mensual"
                      className="w-full bg-background border border-gray-700 rounded-lg py-2 pl-8 pr-3 text-white outline-none focus:border-primary"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        {/* Add custom expense */}
        {showCustom ? (
          <div className="bg-background-card rounded-xl p-4">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Nombre del gasto..."
              className="w-full bg-background border border-gray-700 rounded-lg py-2 px-3 text-white outline-none focus:border-primary mb-2"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={addCustomExpense}
                className="flex-1 bg-primary text-white py-2 rounded-lg text-sm"
              >
                Agregar
              </button>
              <button
                onClick={() => setShowCustom(false)}
                className="flex-1 bg-gray-700 text-white py-2 rounded-lg text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCustom(true)}
            className="w-full bg-background-card border-2 border-dashed border-gray-700 rounded-xl p-4 text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Agregar otra categoría
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="bg-background-card rounded-xl p-4 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Total gastos fijos:</span>
          <span className="text-xl font-bold text-white">
            ${totalFixed.toLocaleString('es-CO')}
          </span>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleSubmit}
        className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-4 rounded-xl transition-all duration-200"
      >
        Ver cuánto me queda →
      </button>
    </div>
  )
}
