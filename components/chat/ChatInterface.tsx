'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Receipt } from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Props {
  onSendMessage: (message: string) => Promise<string>
  availableMoney: number
  onOpenDashboard: () => void
  onLogout: () => void
}

export default function ChatInterface({ onSendMessage, availableMoney }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: `¡Qué más, parcero! 👋\n\nTe quedan $${availableMoney.toLocaleString('es-CO')} pa'l mes.\n\nCuéntame en qué gastaste:\n• "Almuerzo 15000"\n• "10k en uber"\n• "Gasté 5 lucas en café"\n\n💡 Para borrar: "borrar último"`,
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-focus input on mount and after sending
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Re-focus after loading completes
  useEffect(() => {
    if (!isLoading) {
      // Small delay to ensure the input is enabled
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [isLoading])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await onSendMessage(input.trim())

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Epa, algo falló. ¿Le damos otra vez?',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  }

  // Quick suggestions
  const suggestions = [
    'Almuerzo 15k',
    '8000 uber',
    'Café $6.000',
    '¿Cuánto llevo?'
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col pb-16">
      {/* Header - simplified */}
      <div className="bg-background-card p-4 flex items-center gap-4 border-b border-gray-800">
        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
          <Receipt className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-white font-semibold">Registrar gasto</h1>
          <p className="text-xs text-primary">
            Disponible: ${availableMoney.toLocaleString('es-CO')}
          </p>
        </div>
        <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 ${
                message.type === 'user'
                  ? 'chat-bubble-user text-white'
                  : 'chat-bubble-ai text-gray-200'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.type === 'user' ? 'text-white/60' : 'text-gray-500'
              }`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="chat-bubble-ai px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-gray-400 text-sm">Escribiendo...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <p className="text-gray-500 text-xs mb-2">Sugerencias:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className="bg-background-card px-3 py-1.5 rounded-full text-gray-300 text-sm hover:bg-background-light transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="p-4 bg-background-card border-t border-gray-800">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu gasto... ej: Almuerzo 15000"
            className="flex-1 bg-background border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-primary transition-colors"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
