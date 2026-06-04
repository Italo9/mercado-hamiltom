"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { X, Send, Bot } from "lucide-react"
import { ChatMessage } from "@/types"
import { SUGGESTIONS } from "@/lib/chat"
import { TypingIndicator } from "./TypingIndicator"
import { clsx } from "clsx"

let msgId = 0
const nextId = () => String(++msgId)

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Oi! Eu sou o Dininho 🛒, assistente da DINIZ Comercial e Frios.\n\nPosso te ajudar a achar produtos, comparar preços e montar sua listinha. Como posso te ajudar?",
  timestamp: new Date(),
}

function RobotAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-gold-400 flex items-center justify-center flex-shrink-0 shadow-sm ring-1 ring-gold-300/50">
      <Bot className="w-4 h-4 text-sage-900" aria-hidden="true" />
    </div>
  )
}

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const [showPill, setShowPill] = useState(true)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Rola só o container das mensagens (nunca a página)
  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages, loading, open])

  // Ao abrir: foca o input, zera não lidas e trava o scroll do fundo
  useEffect(() => {
    if (open) {
      setUnread(0)
      setShowPill(false)
      const t = setTimeout(() => inputRef.current?.focus(), 200)
      document.body.style.overflow = "hidden"
      return () => {
        clearTimeout(t)
        document.body.style.overflow = ""
      }
    }
    document.body.style.overflow = ""
  }, [open])

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || loading) {
        return
      }

      const userMsg: ChatMessage = {
        id: nextId(),
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMsg])
      setInput("")
      setLoading(true)

      const history = [...messages, userMsg]
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }))

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        })

        const data = await response.json()
        const botMsg: ChatMessage = {
          id: nextId(),
          role: "assistant",
          content: data.text ?? "Não consegui responder agora. Tenta de novo daqui a pouco!",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, botMsg])
        if (!open) {
          setUnread((n) => n + 1)
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: "assistant",
            content: "Ops, tive um problema de conexão agora. Pode tentar de novo?",
            timestamp: new Date(),
          },
        ])
      } finally {
        setLoading(false)
      }
    },
    [loading, messages, open],
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <>
      {/* Estado fechado: selo com o nome + botão flutuante */}
      {!open && (
        <div className="fixed bottom-16 right-5 z-50 flex items-center gap-2">
          {showPill && (
            <button
              onClick={() => setOpen(true)}
              className="max-w-[58vw] sm:max-w-none bg-white text-sage-800 text-sm font-body font-semibold pl-3.5 pr-4 py-2.5 rounded-full shadow-lg ring-1 ring-cream-300 animate-fade-up text-left leading-snug"
            >
              👋 Fale com o <span className="text-brand-600 font-bold">Dininho</span>
            </button>
          )}
          <button
            onClick={() => setOpen(true)}
            aria-label="Abrir assistente Dininho"
            className="relative w-14 h-14 rounded-full shadow-xl bg-brand-600 hover:bg-brand-700 text-white ring-2 ring-gold-400/60 flex items-center justify-center transition-colors focus:outline-none focus:ring-4 focus:ring-gold-300 flex-shrink-0"
          >
            <Bot className="w-6 h-6" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold-400 text-sage-900 text-xs rounded-full flex items-center justify-center font-bold">
                {unread}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Painel: tela cheia no mobile, card flutuante em telas maiores */}
      <div
        role="dialog"
        aria-label="Assistente Dininho"
        aria-hidden={!open}
        className={clsx(
          "fixed z-50 bg-white flex flex-col overflow-hidden transition-opacity duration-200",
          "inset-0 h-[100dvh]",
          "sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[600px] sm:max-h-[calc(100dvh-3rem)] sm:w-[380px] sm:rounded-2xl sm:shadow-2xl sm:border sm:border-cream-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-sage-800 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gold-400 flex items-center justify-center ring-1 ring-gold-300/50">
              <Bot className="w-5 h-5 text-sage-900" aria-hidden="true" />
            </div>
            <div>
              <p className="text-white font-body font-semibold text-sm leading-none">Dininho</p>
              <p className="text-gold-200 text-xs mt-0.5">Assistente da DINIZ &middot; online</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Fechar chat"
            className="text-white/80 hover:text-white transition-colors p-2 -mr-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensagens */}
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-3 bg-cream-50"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={clsx(
                "flex items-end gap-2 animate-fade-up",
                msg.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              {msg.role === "assistant" && <RobotAvatar />}
              <div
                className={clsx(
                  "relative max-w-[80%] px-4 py-2.5 rounded-2xl text-sm font-body leading-relaxed whitespace-pre-wrap",
                  msg.role === "user"
                    ? "bg-brand-500 text-white rounded-br-none"
                    : "bg-white text-gray-800 border border-brand-100 rounded-bl-none shadow-sm",
                )}
              >
                {msg.content}
                <span
                  className={clsx(
                    "block text-right mt-1 text-[10px] leading-none",
                    msg.role === "user" ? "text-brand-100" : "text-gray-400",
                  )}
                >
                  {msg.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-end gap-2 justify-start">
              <RobotAvatar />
              <TypingIndicator />
            </div>
          )}
        </div>

        {/* Sugestões */}
        {messages.length <= 2 && !loading && (
          <div className="px-3 py-2 flex gap-1.5 overflow-x-auto border-t border-cream-200 flex-shrink-0 bg-white">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.prompt}
                onClick={() => sendMessage(s.prompt)}
                className="flex-shrink-0 text-xs font-body font-medium px-3 py-2 rounded-full bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 transition-colors whitespace-nowrap"
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-3 pt-3 border-t border-cream-200 flex items-center gap-2 bg-white flex-shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte sobre nossos produtos…"
            disabled={loading}
            enterKeyHint="send"
            className="flex-1 bg-cream-100 rounded-full px-4 py-2.5 text-[16px] font-body text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-300 disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            aria-label="Enviar mensagem"
            className={clsx(
              "w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
              input.trim() && !loading
                ? "bg-brand-500 text-white hover:bg-brand-600"
                : "bg-gray-200 text-gray-400 cursor-not-allowed",
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  )
}
