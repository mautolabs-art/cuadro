'use client'

import { MessageSquare, LayoutDashboard, Settings } from 'lucide-react'

type View = 'chat' | 'dashboard' | 'settings'

interface Props {
  currentView: View
  onChangeView: (view: View) => void
}

export default function BottomNavigation({ currentView, onChangeView }: Props) {
  const navItems = [
    { id: 'chat' as View, label: 'Registrar', icon: MessageSquare },
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'settings' as View, label: 'Ajustes', icon: Settings },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background-card border-t border-gray-800 px-6 py-2 z-40">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id

          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all ${
                isActive
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-primary' : ''}`} />
              <span className={`text-xs font-medium ${isActive ? 'text-primary' : ''}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
