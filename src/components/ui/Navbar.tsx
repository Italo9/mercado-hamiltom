"use client"

import { useState, useEffect } from "react"
import { Menu, X, MessageCircle } from "lucide-react"
import { clsx } from "clsx"
import { Logo } from "./Logo"

const WHATSAPP_URL = "https://wa.me/5574999995365"

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
        <a href="/" aria-label="DINIZ Comercial e Frios — página inicial">
          <Logo tone="dark" size="sm" />
        </a>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-7 font-body text-sm font-semibold text-sage-800">
          <a href="#catalogo" className="hover:text-brand-600 transition-colors">Produtos</a>
          <a href="#catalogo" className="hover:text-brand-600 transition-colors">Ofertas</a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gold-400 text-sage-900 px-5 py-2.5 rounded-full font-bold shadow-sm hover:bg-gold-300 transition-colors"
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
            WhatsApp
          </a>
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
          <a href="#catalogo" className="block py-3 text-sage-800 hover:text-brand-600" onClick={() => setMenuOpen(false)}>
            Ofertas
          </a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 mt-2 bg-gold-400 text-sage-900 py-3 rounded-full font-bold"
            onClick={() => setMenuOpen(false)}
          >
            <MessageCircle className="w-5 h-5" aria-hidden="true" />
            WhatsApp — (74) 99999-5365
          </a>
        </div>
      )}
    </header>
  )
}
