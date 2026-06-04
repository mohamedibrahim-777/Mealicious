'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react'

interface Msg { role: 'user' | 'assistant'; content: string }

const GREETING: Msg = {
  role: 'assistant',
  content: "Hi! I'm Mealie 🥜 your Mealicious assistant. Ask me about products, orders, shipping, or anything else!",
}

export function AIChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([GREETING])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, loading])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    const userMsg: Msg = { role: 'user', content: text }
    const history = messages.filter(m => m !== GREETING)
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      })
      const data = await res.json()
      const reply = data.response || data.reply || data.message || data.error || "Sorry, I couldn't process that. Try again or WhatsApp us."
      setMessages(prev => [...prev, { role: 'assistant', content: String(reply) }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Network error. Please try WhatsApp: wa.me/916379858978' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Launcher — sits above WhatsApp + push buttons */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="AI Chat Support"
        className="fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 shadow-lg hover:bg-orange-600 transition-colors"
      >
        {open ? <X className="h-6 w-6 text-white" /> : <MessageCircle className="h-6 w-6 text-white" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-44 right-6 z-50 flex h-[60vh] max-h-[520px] w-[calc(100vw-3rem)] max-w-sm flex-col rounded-2xl border border-neutral-200 bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 bg-orange-500 px-4 py-3 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold leading-tight">Mealie — AI Support</p>
              <p className="text-xs text-orange-100">Typically replies instantly</p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-neutral-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-orange-500 text-white rounded-br-sm'
                    : 'bg-white border border-neutral-200 text-neutral-700 rounded-bl-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-neutral-200 rounded-2xl rounded-bl-sm px-3.5 py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-neutral-200 bg-white p-3">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Type your message…"
                className="flex-1 rounded-full border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-orange-400"
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
