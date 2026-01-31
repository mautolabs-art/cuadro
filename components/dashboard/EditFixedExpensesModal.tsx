'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, ChevronDown, ChevronUp, Zap, Droplets, Flame, Wifi, Signal, Building, Film, Music, ShoppingBag, Apple, Tv, Gamepad2, Home, Car, CreditCard, Heart, GraduationCap } from 'lucide-react'

interface SubItem {
  id: string
  name: string
  amount: number
  fullId?: string // The actual ID in the database
}

interface ExpenseCategory {
  id: string
  name: string
  icon: string
  isExpanded: boolean
  subItems: SubItem[]
  totalAmount: number
}

interface FixedExpense {
  id: string
  name: string
  amount: number
  paid: boolean
}

interface Props {
  isOpen: boolean
  onClose: () => void
  fixedExpenses: FixedExpense[]
  onSave: (expenses: FixedExpense[]) => void
}

const iconMap: { [key: string]: React.ReactNode } = {
  home: <Home className="w-5 h-5" />,
  wifi: <Wifi className="w-5 h-5" />,
  tv: <Tv className="w-5 h-5" />,
  car: <Car className="w-5 h-5" />,
  creditcard: <CreditCard className="w-5 h-5" />,
  heart: <Heart className="w-5 h-5" />,
  graduation: <GraduationCap className="w-5 h-5" />,
  services: <Wifi className="w-5 h-5" />,
  streaming: <Tv className="w-5 h-5" />,
  other: <Plus className="w-5 h-5" />,
}

const subItemIcons: { [key: string]: React.ReactNode } = {
  'Luz': <Zap className="w-4 h-4" />,
  'Agua': <Droplets className="w-4 h-4" />,
  'Gas': <Flame className="w-4 h-4" />,
  'Internet': <Wifi className="w-4 h-4" />,
  'Plan celular': <Signal className="w-4 h-4" />,
  'Admón edificio': <Building className="w-4 h-4" />,
  'Netflix': <Film className="w-4 h-4" />,
  'Spotify': <Music className="w-4 h-4" />,
  'Amazon Prime': <ShoppingBag className="w-4 h-4" />,
  'Apple': <Apple className="w-4 h-4" />,
  'Disney+': <Tv className="w-4 h-4" />,
  'Max (HBO)': <Tv className="w-4 h-4" />,
  'YouTube Premium': <Film className="w-4 h-4" />,
  'Gaming': <Gamepad2 className="w-4 h-4" />,
}

export default function EditFixedExpensesModal({ isOpen, onClose, fixedExpenses, onSave }: Props) {
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [standaloneExpenses, setStandaloneExpenses] = useState<FixedExpense[]>([])
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showAddStandalone, setShowAddStandalone] = useState(false)
  const [newStandaloneName, setNewStandaloneName] = useState('')
  const [newStandaloneAmount, setNewStandaloneAmount] = useState('')

  // Parse existing expenses into categories and standalone
  useEffect(() => {
    if (isOpen) {
      const cats: { [key: string]: SubItem[] } = {}
      const standalone: FixedExpense[] = []

      fixedExpenses.forEach(expense => {
        if (expense.name.includes(': ')) {
          const [category, subName] = expense.name.split(': ')
          if (!cats[category]) {
            cats[category] = []
          }
          cats[category].push({
            id: subName,
            name: subName,
            amount: expense.amount,
            fullId: expense.id
          })
        } else {
          standalone.push(expense)
        }
      })

      const categoryList: ExpenseCategory[] = Object.entries(cats).map(([name, subItems]) => ({
        id: name,
        name,
        icon: name.includes('Servicios') ? 'services' : name.includes('Streaming') ? 'streaming' : 'other',
        isExpanded: false,
        subItems,
        totalAmount: subItems.reduce((sum, s) => sum + s.amount, 0)
      }))

      setCategories(categoryList)
      setStandaloneExpenses(standalone)
    }
  }, [isOpen, fixedExpenses])

  const formatMoney = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const toggleCategory = (categoryId: string) => {
    setCategories(prev => prev.map(cat =>
      cat.id === categoryId ? { ...cat, isExpanded: !cat.isExpanded } : cat
    ))
  }

  const updateSubItemAmount = (categoryId: string, subItemId: string, value: string) => {
    const numericValue = parseInt(value.replace(/\./g, '')) || 0
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        const updatedSubItems = cat.subItems.map(sub =>
          sub.id === subItemId ? { ...sub, amount: numericValue } : sub
        )
        return {
          ...cat,
          subItems: updatedSubItems,
          totalAmount: updatedSubItems.reduce((sum, s) => sum + s.amount, 0)
        }
      }
      return cat
    }))
  }

  const addSubItem = (categoryId: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        const newSubItem: SubItem = {
          id: `Nuevo ${cat.subItems.length + 1}`,
          name: `Nuevo ${cat.subItems.length + 1}`,
          amount: 0
        }
        return {
          ...cat,
          subItems: [...cat.subItems, newSubItem],
          isExpanded: true
        }
      }
      return cat
    }))
  }

  const removeSubItem = (categoryId: string, subItemId: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        const updatedSubItems = cat.subItems.filter(sub => sub.id !== subItemId)
        return {
          ...cat,
          subItems: updatedSubItems,
          totalAmount: updatedSubItems.reduce((sum, s) => sum + s.amount, 0)
        }
      }
      return cat
    }))
  }

  const updateSubItemName = (categoryId: string, subItemId: string, newName: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          subItems: cat.subItems.map(sub =>
            sub.id === subItemId ? { ...sub, id: newName, name: newName } : sub
          )
        }
      }
      return cat
    }))
  }

  const updateStandaloneAmount = (id: string, value: string) => {
    const numericValue = parseInt(value.replace(/\./g, '')) || 0
    setStandaloneExpenses(prev => prev.map(exp =>
      exp.id === id ? { ...exp, amount: numericValue } : exp
    ))
  }

  const removeStandalone = (id: string) => {
    setStandaloneExpenses(prev => prev.filter(exp => exp.id !== id))
  }

  const addCategory = () => {
    if (newCategoryName.trim()) {
      const newCat: ExpenseCategory = {
        id: newCategoryName.trim(),
        name: newCategoryName.trim(),
        icon: 'other',
        isExpanded: true,
        subItems: [{ id: 'Item 1', name: 'Item 1', amount: 0 }],
        totalAmount: 0
      }
      setCategories(prev => [...prev, newCat])
      setNewCategoryName('')
      setShowAddCategory(false)
    }
  }

  const removeCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId))
  }

  const addStandaloneExpense = () => {
    if (newStandaloneName.trim()) {
      const amount = parseInt(newStandaloneAmount.replace(/\./g, '')) || 0
      const newExp: FixedExpense = {
        id: `new-${Date.now()}`,
        name: newStandaloneName.trim(),
        amount,
        paid: false
      }
      setStandaloneExpenses(prev => [...prev, newExp])
      setNewStandaloneName('')
      setNewStandaloneAmount('')
      setShowAddStandalone(false)
    }
  }

  const handleSave = () => {
    const allExpenses: FixedExpense[] = []

    // Add category sub-items as "Category: SubItem" format
    categories.forEach(cat => {
      cat.subItems.forEach(sub => {
        if (sub.amount > 0) {
          allExpenses.push({
            id: sub.fullId || `new-${Date.now()}-${Math.random()}`,
            name: `${cat.name}: ${sub.name}`,
            amount: sub.amount,
            paid: false
          })
        }
      })
    })

    // Add standalone expenses
    standaloneExpenses.forEach(exp => {
      if (exp.amount > 0) {
        allExpenses.push(exp)
      }
    })

    onSave(allExpenses)
    onClose()
  }

  if (!isOpen) return null

  const totalAmount = categories.reduce((sum, cat) => sum + cat.totalAmount, 0) +
    standaloneExpenses.reduce((sum, exp) => sum + exp.amount, 0)

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-background w-full max-w-lg max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-white">Editar gastos fijos</h2>
          <button onClick={onClose} className="p-2 hover:bg-background-card rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Categories with sub-items */}
          {categories.map(category => (
            <div key={category.id} className="bg-background-card rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center text-primary">
                  {iconMap[category.icon] || iconMap.other}
                </div>
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="flex-1 text-left"
                >
                  <p className="text-white font-medium">{category.name}</p>
                  <p className="text-sm text-gray-400">
                    ${category.totalAmount.toLocaleString('es-CO')} total
                  </p>
                </button>
                <button
                  onClick={() => removeCategory(category.id)}
                  className="p-2 text-gray-500 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {category.isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>

              {category.isExpanded && (
                <div className="border-t border-gray-700 p-3 space-y-2">
                  {category.subItems.map(subItem => (
                    <div key={subItem.id} className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-background flex items-center justify-center text-gray-400">
                        {subItemIcons[subItem.name] || <Plus className="w-3 h-3" />}
                      </div>
                      <input
                        type="text"
                        value={subItem.name}
                        onChange={(e) => updateSubItemName(category.id, subItem.id, e.target.value)}
                        className="flex-1 bg-background border border-gray-700 rounded-md py-1.5 px-2 text-white text-sm outline-none focus:border-primary"
                      />
                      <div className="relative w-28">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={subItem.amount > 0 ? formatMoney(subItem.amount.toString()) : ''}
                          onChange={(e) => updateSubItemAmount(category.id, subItem.id, e.target.value)}
                          placeholder="0"
                          className="w-full bg-background border border-gray-700 rounded-md py-1.5 pl-5 pr-2 text-white text-sm outline-none focus:border-primary"
                        />
                      </div>
                      <button
                        onClick={() => removeSubItem(category.id, subItem.id)}
                        className="p-1.5 text-gray-500 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addSubItem(category.id)}
                    className="w-full mt-2 border border-dashed border-gray-600 rounded-md py-2 text-gray-400 text-xs hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Agregar item
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Standalone expenses */}
          {standaloneExpenses.map(expense => (
            <div key={expense.id} className="bg-background-card rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center text-primary">
                {iconMap.other}
              </div>
              <span className="flex-1 text-white">{expense.name}</span>
              <div className="relative w-28">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={expense.amount > 0 ? formatMoney(expense.amount.toString()) : ''}
                  onChange={(e) => updateStandaloneAmount(expense.id, e.target.value)}
                  placeholder="0"
                  className="w-full bg-background border border-gray-700 rounded-md py-1.5 pl-5 pr-2 text-white text-sm outline-none focus:border-primary"
                />
              </div>
              <button
                onClick={() => removeStandalone(expense.id)}
                className="p-1.5 text-gray-500 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Add new category */}
          {showAddCategory ? (
            <div className="bg-background-card rounded-xl p-4 space-y-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nombre de la categoría (ej: Seguros)"
                className="w-full bg-background border border-gray-700 rounded-lg py-2 px-3 text-white outline-none focus:border-primary"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={addCategory}
                  className="flex-1 bg-primary text-white py-2 rounded-lg text-sm"
                >
                  Crear categoría
                </button>
                <button
                  onClick={() => setShowAddCategory(false)}
                  className="flex-1 bg-gray-700 text-white py-2 rounded-lg text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : showAddStandalone ? (
            <div className="bg-background-card rounded-xl p-4 space-y-2">
              <input
                type="text"
                value={newStandaloneName}
                onChange={(e) => setNewStandaloneName(e.target.value)}
                placeholder="Nombre del gasto"
                className="w-full bg-background border border-gray-700 rounded-lg py-2 px-3 text-white outline-none focus:border-primary"
                autoFocus
              />
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={newStandaloneAmount ? formatMoney(newStandaloneAmount) : ''}
                  onChange={(e) => setNewStandaloneAmount(e.target.value.replace(/\./g, ''))}
                  placeholder="Monto"
                  className="w-full bg-background border border-gray-700 rounded-lg py-2 pl-8 pr-3 text-white outline-none focus:border-primary"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addStandaloneExpense}
                  className="flex-1 bg-primary text-white py-2 rounded-lg text-sm"
                >
                  Agregar gasto
                </button>
                <button
                  onClick={() => setShowAddStandalone(false)}
                  className="flex-1 bg-gray-700 text-white py-2 rounded-lg text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddCategory(true)}
                className="flex-1 bg-background-card border-2 border-dashed border-gray-700 rounded-xl p-3 text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Agregar categoría
              </button>
              <button
                onClick={() => setShowAddStandalone(true)}
                className="flex-1 bg-background-card border-2 border-dashed border-gray-700 rounded-xl p-3 text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Gasto individual
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total gastos fijos:</span>
            <span className="text-xl font-bold text-white">
              ${totalAmount.toLocaleString('es-CO')}
            </span>
          </div>
          <button
            onClick={handleSave}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-all"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  )
}
