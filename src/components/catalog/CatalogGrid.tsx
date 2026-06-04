"use client"

import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import { PRODUCTS, CATEGORIES } from "@/lib/products"
import { ProductCard } from "./ProductCard"
import { clsx } from "clsx"

export function CatalogGrid() {
  const [activeCategory, setActiveCategory] = useState("todos")
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchCat = activeCategory === "todos" || p.category === activeCategory
      const matchQ =
        query.trim() === "" ||
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      return matchCat && matchQ
    })
  }, [activeCategory, query])

  return (
    <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Section header */}
      <div className="mb-8">
        <p className="text-brand-500 font-body font-semibold text-sm uppercase tracking-widest mb-1">
          Nosso mercado
        </p>
        <h2 className="font-display text-3xl sm:text-4xl text-gray-900 font-bold">
          Produtos do dia
        </h2>
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
            "bg-white font-body text-sm text-gray-800 placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-brand-300",
          )}
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none">
        {CATEGORIES.map((cat) => (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
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
