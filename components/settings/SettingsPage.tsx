'use client'

import { LogOut } from 'lucide-react'

interface Props {
  onLogout: () => void
}

export default function SettingsPage({ onLogout }: Props) {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-background-card p-6">
        <h1 className="text-xl font-bold text-white">Ajustes</h1>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Logout section */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Cuenta</h2>

          <button
            onClick={onLogout}
            className="w-full bg-background-card rounded-xl p-4 flex items-center gap-3 hover:bg-red-500/10 transition-colors group"
          >
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-red-400 font-medium">Cerrar sesión</span>
          </button>
        </div>

        {/* Info text */}
        <p className="text-gray-500 text-sm text-center mt-8">
          Para editar tu ingreso, ahorro o gastos fijos, ve al Dashboard y toca el lápiz ✏️
        </p>
      </div>
    </div>
  )
}
