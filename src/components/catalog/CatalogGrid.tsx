"use client"

import { useState, useMemo, useEffect } from "react"
import { Search } from "lucide-react"
import { Product } from "@/types"
import { buildCategories } from "@/lib/products"
import { assistant } from "@/lib/config"
import { ProductCard } from "./ProductCard"
import { clsx } from "clsx"

interface CatalogGridProps {
  products: Product[]
}

export function CatalogGrid({ products }: CatalogGridProps) {
  const [activeCategory, setActiveCategory] = useState("todos")
  const [query, setQuery] = useState("")

  const hasOffers = useMemo(() => products.some((p) => p.badge === "oferta"), [products])

  // Insere uma aba "Ofertas" logo após "Todos" quando existem produtos em oferta.
  const categories = useMemo(() => {
    const base = buildCategories(products)
    if (!hasOffers) {
      return base
    }
    const [todos, ...rest] = base
    return [todos, { id: "ofertas", label: "Ofertas", icon: "🏷️" }, ...rest]
  }, [products, hasOffers])

  // "Ofertas" no menu aponta para #ofertas: ao abrir ou trocar o hash, aplica o filtro.
  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace("#", "")
      if (hash === "ofertas" && hasOffers) {
        setActiveCategory("ofertas")
      } else if (hash === "catalogo") {
        setActiveCategory("todos")
      }
    }
    applyHash()
    window.addEventListener("hashchange", applyHash)
    return () => window.removeEventListener("hashchange", applyHash)
  }, [hasOffers])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        activeCategory === "todos"
          ? true
          : activeCategory === "ofertas"
            ? p.badge === "oferta"
            : p.category === activeCategory
      const matchQ =
        query.trim() === "" ||
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      return matchCat && matchQ
    })
  }, [products, activeCategory, query])

  return (
    <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-24">
      <span id="ofertas" aria-hidden="true" className="block scroll-mt-28" />
      {/* Section header */}
      <div className="mb-8">
        <p className="text-brand-500 font-body font-semibold text-sm uppercase tracking-widest mb-1">
          Nosso mercado
        </p>
        <h2 className="font-display text-3xl sm:text-4xl text-gray-900 font-bold">
          Produtos e preços
        </h2>
        <p className="font-body text-gray-500 text-sm mt-1">
          Consulte os valores e a disponibilidade em tempo real. Dúvidas? Fale com o {assistant.name} no canto da tela, {assistant.availability.toLowerCase()}.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="search"
          placeholder="Buscar produto&hellip;"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={clsx(
            "w-full pl-10 pr-4 py-2.5 rounded-full border border-cream-400",
            "bg-white font-body text-[16px] text-gray-800 placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-brand-300",
          )}
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={clsx(
              "flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full",
              "font-body text-sm font-medium transition-all duration-200 whitespace-nowrap",
              activeCategory === cat.id
                ? "bg-brand-500 text-white shadow-sm"
                : "bg-white text-gray-600 border border-cream-400 hover:border-brand-300 hover:text-brand-600",
            )}
          >
            <span role="img" aria-label={cat.label}>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 font-body">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-lg">Nenhum produto encontrado</p>
          <p className="text-sm mt-1">Tente outra busca ou categoria</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filtered.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              style={{ animationDelay: `${Math.min(i, 12) * 40}ms`, animationFillMode: "both" }}
            />
          ))}
        </div>
      )}

      {/* Count */}
      <p className="mt-6 text-sm text-gray-400 font-body text-center">
        {filtered.length} produto{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
      </p>
    </section>
  )
}
