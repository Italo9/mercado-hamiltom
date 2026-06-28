"use client"

import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { clsx } from "clsx"
import { Logo } from "./Logo"
import { market, assistant } from "@/lib/config"
import { openTomChat } from "@/components/chat/OpenChatButton"
import { WhatsAppGlyph } from "@/components/chat/WhatsAppGlyph"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={clsx(
        "sticky top-0 z-40 transition-shadow duration-300",
        "bg-cream-50/95 backdrop-blur-md border-b border-cream-200",
        scrolled ? "shadow-md" : "shadow-sm",
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="/" aria-label={`${market.name}, página inicial`}>
          <Logo tone="dark" size="sm" />
        </a>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-7 font-body text-sm font-semibold text-sage-800">
          <a href="#catalogo" className="hover:text-brand-600 transition-colors">Produtos</a>
          <a href="#ofertas" className="hover:text-brand-600 transition-colors">Ofertas</a>
          <button
            type="button"
            onClick={openTomChat}
            className="inline-flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-full font-bold shadow-sm ring-1 ring-gold-400/60 hover:bg-brand-700 transition-colors"
          >
            <WhatsAppGlyph className="w-4 h-4 text-gold-300" />
            Falar com o {assistant.name}
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="sm:hidden p-2 -mr-2 rounded-lg text-sage-800 hover:bg-cream-200 transition-colors"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden bg-cream-50 border-t border-cream-200 px-4 pb-4 pt-2 space-y-1 font-body text-base font-semibold shadow-lg">
          <a href="#catalogo" className="block py-3 text-sage-800 hover:text-brand-600" onClick={() => setMenuOpen(false)}>
            Produtos
          </a>
          <a href="#ofertas" className="block py-3 text-sage-800 hover:text-brand-600" onClick={() => setMenuOpen(false)}>
            Ofertas
          </a>
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false)
              openTomChat()
            }}
            className="w-full flex items-center justify-center gap-2 mt-2 bg-brand-600 text-white py-3 rounded-full font-bold ring-1 ring-gold-400/60"
          >
            <WhatsAppGlyph className="w-5 h-5 text-gold-300" />
            Falar com o {assistant.name}
          </button>
        </div>
      )}
    </header>
  )
}
