"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { X, Send, UserRound, PhoneOff } from "lucide-react"
import { ChatMessage } from "@/types"
import { SUGGESTIONS } from "@/lib/chat"
import { assistant, market } from "@/lib/config"
import { TypingIndicator } from "./TypingIndicator"
import { WhatsAppGlyph } from "./WhatsAppGlyph"
import { clsx } from "clsx"

let msgId = 0
const nextId = () => String(++msgId)

// Frases que se alternam no balão do botão. Tudo na página convida a conversar
// com o robô, que é o elemento principal do site.
const PILL_PHRASES = [
  "Fale com o",
  "Tire dúvidas com o",
  "Pergunte os preços ao",
  "Veja se tem em estoque com o",
  "Precisa de ajuda? Chame o",
  "Converse agora com o",
]

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: `Oi! Eu sou o ${assistant.name} 🛒, ${assistant.role} do ${market.name}.\n\nFunciono 24 horas: me diga um produto e eu confiro na hora o preço e se tem em estoque. Se estiver em falta, te indico uma alternativa que temos. Quer, também posso te passar para um atendente. O que você procura?`,
  timestamp: new Date(),
}

function TomAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-gold-400 flex items-center justify-center flex-shrink-0 shadow-sm ring-1 ring-gold-300/50">
      <WhatsAppGlyph className="w-5 h-5 text-brand-600" />
    </div>
  )
}

type Mode = "bot" | "askName" | "human"

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const [pillIndex, setPillIndex] = useState(0)
  const [mode, setMode] = useState<Mode>("bot")

  const modeRef = useRef<Mode>("bot")
  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  // Identificador estável da conversa (sessão de atendimento humano).
  const [sessionId] = useState(() =>
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
  )
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Posição do botão flutuante (null = canto inferior direito padrão)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const drag = useRef({ active: false, moved: false, startX: 0, startY: 0, originX: 0, originY: 0 })
  const launcherRef = useRef<HTMLDivElement>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const pushAssistant = useCallback((content: string, human = false) => {
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: "assistant", content, timestamp: new Date(), human },
    ])
  }, [])

  // Rola só o container das mensagens (nunca a página)
  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages, loading, open])

  // Qualquer "Fale com o Tom" na página abre o chat (evento global).
  useEffect(() => {
    const openHandler = () => setOpen(true)
    window.addEventListener("tom:open", openHandler)
    return () => window.removeEventListener("tom:open", openHandler)
  }, [])

  // Alterna as frases do balão enquanto o botão está visível.
  useEffect(() => {
    if (open) {
      return
    }
    const timer = setInterval(() => {
      setPillIndex((i) => (i + 1) % PILL_PHRASES.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [open])

  // Ao abrir: foca o input e zera não lidas. No mobile (tela cheia) trava o
  // scroll do fundo; no desktop NÃO trava, para a roda do mouse seguir rolando
  // a página normalmente.
  useEffect(() => {
    if (open) {
      setUnread(0)
      const t = setTimeout(() => inputRef.current?.focus(), 200)
      const isMobile =
        typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches
      if (isMobile) {
        document.body.style.overflow = "hidden"
      }
      return () => {
        clearTimeout(t)
        document.body.style.overflow = ""
      }
    }
    document.body.style.overflow = ""
  }, [open])

  // Minimiza ao clicar fora do painel (no desktop, onde o chat é um cartão).
  useEffect(() => {
    if (!open) {
      return
    }
    const onDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [open])

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  // Busca periódica das respostas do atendente e do encerramento da sessão.
  const startPolling = useCallback(() => {
    stopPolling()
    pollRef.current = setInterval(async () => {
      if (modeRef.current !== "human") {
        stopPolling()
        return
      }
      try {
        const r = await fetch(`/api/human/poll?sessionId=${encodeURIComponent(sessionId)}`)
        const d = await r.json()
        if (Array.isArray(d.messages)) {
          for (const m of d.messages) {
            pushAssistant(m.text, true)
            if (!open) {
              setUnread((n) => n + 1)
            }
          }
        }
        if (d.ended) {
          stopPolling()
          setMode("bot")
          pushAssistant(
            d.ended.reason === "timeout"
              ? "O atendimento humano foi encerrado por inatividade. Posso continuar te ajudando 😊"
              : "Atendimento humano encerrado. Posso continuar te ajudando 😊",
          )
        } else if (d.active === false) {
          stopPolling()
          setMode("bot")
        }
      } catch {
        // mantém o polling; tenta de novo no próximo ciclo
      }
    }, 3000)
  }, [sessionId, open, pushAssistant, stopPolling])

  useEffect(() => {
    return () => {
      stopPolling()
      document.body.style.overflow = ""
    }
  }, [stopPolling])

  // --- Arrastar o botão flutuante ---
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    const rect = launcherRef.current?.getBoundingClientRect()
    if (!rect) {
      return
    }
    drag.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      originX: rect.left,
      originY: rect.top,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    if (!d.active) {
      return
    }
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
      d.moved = true
    }
    if (!d.moved) {
      return
    }
    const rect = launcherRef.current?.getBoundingClientRect()
    const w = rect?.width ?? 56
    const h = rect?.height ?? 56
    const x = Math.min(Math.max(8, d.originX + dx), window.innerWidth - w - 8)
    const y = Math.min(Math.max(8, d.originY + dy), window.innerHeight - h - 8)
    setPos({ x, y })
  }, [])

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    d.active = false
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      // ignora
    }
    if (!d.moved) {
      setOpen(true)
    }
  }, [])

  const askForHuman = useCallback(() => {
    if (modeRef.current !== "bot") {
      return
    }
    setMode("askName")
    pushAssistant("Claro! Vou te encaminhar para um atendente. Qual é o seu nome?")
  }, [pushAssistant])

  const startHuman = useCallback(
    async (name: string) => {
      try {
        const r = await fetch("/api/human/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, name }),
        })
        const d = await r.json()
        if (d.ok && d.enabled) {
          setMode("human")
          pushAssistant(`Prontinho, ${name}! Um atendente assumiu sua conversa. Pode mandar sua mensagem 😊`)
          startPolling()
        } else {
          setMode("bot")
          pushAssistant(
            `No momento não consegui falar com um atendente, ${name}. Mas eu, o ${assistant.name}, continuo te ajudando agora mesmo! O que você precisa?`,
          )
        }
      } catch {
        setMode("bot")
        pushAssistant("Tive um problema para chamar o atendente, mas pode falar comigo que eu te ajudo!")
      }
    },
    [sessionId, pushAssistant, startPolling],
  )

  const sendToHuman = useCallback(
    async (text: string) => {
      try {
        const r = await fetch("/api/human/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, text }),
        })
        const d = await r.json()
        if (!d.ok && d.active === false) {
          stopPolling()
          setMode("bot")
          pushAssistant("Atendimento humano encerrado. Posso continuar te ajudando 😊")
        }
      } catch {
        // ignora; o atendente responde por polling
      }
    },
    [sessionId, pushAssistant, stopPolling],
  )

  const endHuman = useCallback(async () => {
    stopPolling()
    setMode("bot")
    pushAssistant("Atendimento humano encerrado. Posso continuar te ajudando 😊")
    try {
      await fetch("/api/human/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
    } catch {
      // ignora
    }
  }, [sessionId, pushAssistant, stopPolling])

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || loading) {
        return
      }

      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "user", content: trimmed, timestamp: new Date() },
      ])
      setInput("")

      if (modeRef.current === "askName") {
        startHuman(trimmed)
        return
      }

      if (modeRef.current === "human") {
        sendToHuman(trimmed)
        return
      }

      setLoading(true)
      const history = [...messages, { id: "tmp", role: "user" as const, content: trimmed }]
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }))

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        })
        const data = await response.json()
        pushAssistant(data.text ?? "Não consegui responder agora. Tenta de novo daqui a pouco!")
        if (!open) {
          setUnread((n) => n + 1)
        }
      } catch {
        pushAssistant("Ops, tive um problema de conexão agora. Pode tentar de novo?")
      } finally {
        setLoading(false)
      }
    },
    [loading, messages, open, pushAssistant, startHuman, sendToHuman],
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const placeholder =
    mode === "askName"
      ? "Digite seu nome…"
      : mode === "human"
        ? "Escreva para o atendente…"
        : "Pergunte sobre preços e produtos…"

  return (
    <>
      {/* Botão flutuante (arrastável) + balão sempre visível com o nome */}
      {!open && (
        <div
          ref={launcherRef}
          className={clsx("fixed z-50 w-14 h-14", !pos && "bottom-5 right-5")}
          style={pos ? { left: pos.x, top: pos.y } : undefined}
        >
          <button
            onClick={() => setOpen(true)}
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-white text-sage-800 text-sm font-body font-semibold pl-3 pr-4 py-2.5 rounded-full shadow-lg ring-1 ring-cream-300 flex items-center gap-1.5"
          >
            <WhatsAppGlyph className="w-4 h-4 text-brand-600" />
            <span>
              {PILL_PHRASES[pillIndex]} <span className="text-brand-600 font-bold">{assistant.name}</span>
            </span>
          </button>
          <button
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            aria-label={`Abrir ${assistant.name} (arraste para reposicionar)`}
            style={{ touchAction: "none" }}
            className="relative w-14 h-14 rounded-full shadow-xl bg-brand-600 hover:bg-brand-700 text-gold-300 ring-2 ring-gold-400/70 flex items-center justify-center transition-colors focus:outline-none focus:ring-4 focus:ring-gold-300 cursor-grab active:cursor-grabbing"
          >
            <WhatsAppGlyph className="w-7 h-7" />
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
        ref={panelRef}
        role="dialog"
        aria-label={`Assistente ${assistant.name}`}
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
              <WhatsAppGlyph className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <p className="text-white font-body font-semibold text-sm leading-none">{assistant.name}</p>
              <p className="text-gold-200 text-xs mt-0.5">
                {mode === "human" ? "Atendente humano" : assistant.availability}
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Minimizar chat"
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
              {msg.role === "assistant" && <TomAvatar />}
              <div
                className={clsx(
                  "relative max-w-[80%] px-4 py-2.5 rounded-2xl text-sm font-body leading-relaxed whitespace-pre-wrap",
                  msg.role === "user"
                    ? "bg-brand-500 text-white rounded-br-none"
                    : msg.human
                      ? "bg-emerald-50 text-gray-800 border border-emerald-200 rounded-bl-none shadow-sm"
                      : "bg-white text-gray-800 border border-brand-100 rounded-bl-none shadow-sm",
                )}
              >
                {msg.human && (
                  <span className="block text-[10px] font-bold uppercase tracking-wide text-emerald-700 mb-0.5">
                    Atendente
                  </span>
                )}
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
              <TomAvatar />
              <TypingIndicator />
            </div>
          )}
        </div>

        {/* Atalhos: encerrar (no atendimento humano) ou sugestões (sempre visíveis) */}
        {mode === "human" ? (
          <div className="px-3 py-2 border-t border-cream-200 flex-shrink-0 bg-white">
            <button
              onClick={endHuman}
              className="w-full inline-flex items-center justify-center gap-2 text-sm font-body font-semibold px-3 py-2.5 rounded-full bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
            >
              <PhoneOff className="w-4 h-4" aria-hidden="true" />
              Encerrar atendimento
            </button>
          </div>
        ) : (
          !loading && (
            <div className="px-3 py-2 flex gap-1.5 overflow-x-auto border-t border-cream-200 flex-shrink-0 bg-white">
              {mode === "bot" && (
                <button
                  onClick={askForHuman}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-body font-semibold px-3 py-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors whitespace-nowrap"
                >
                  <UserRound className="w-3.5 h-3.5" aria-hidden="true" />
                  Falar com um humano
                </button>
              )}
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
          )
        )}

        {/* Input */}
        <div className="px-3 pt-3 border-t border-cream-200 flex items-center gap-2 bg-white flex-shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
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
