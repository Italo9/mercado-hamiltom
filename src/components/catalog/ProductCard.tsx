"use client"

import Image from "next/image"
import { Product } from "@/types"
import { clsx } from "clsx"

const BADGE_STYLES = {
  oferta:    "bg-brand-500 text-white",
  novidade:  "bg-sage-500 text-white",
  destaque:  "bg-amber-500 text-white",
}

const BADGE_LABELS = {
  oferta:   "Oferta",
  novidade: "Novidade",
  destaque: "Destaque",
}

interface ProductCardProps {
  product: Product
  style?: React.CSSProperties
}

export function ProductCard({ product, style }: ProductCardProps) {
  const priceFormatted = product.price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })

  return (
    <article
      className={clsx(
        "group relative bg-white rounded-2xl overflow-hidden shadow-sm",
        "border border-cream-300 hover:shadow-lg hover:-translate-y-1",
        "transition-all duration-300 ease-out animate-fade-up",
        !product.inStock && "opacity-60",
      )}
      style={style}
    >
      {/* Badge */}
      {product.badge && (
        <span
          className={clsx(
            "absolute top-3 left-3 z-10 text-xs font-body font-semibold",
            "px-2.5 py-1 rounded-full tracking-wide uppercase",
            BADGE_STYLES[product.badge],
          )}
        >
          {BADGE_LABELS[product.badge]}
        </span>
      )}

      {/* Out of stock overlay */}
      {!product.inStock && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 rounded-2xl">
          <span className="bg-gray-700 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Sem estoque
          </span>
        </div>
      )}

      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-cream-100">
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="text-xs text-sage-600 font-body font-medium uppercase tracking-widest mb-1">
          {product.category}
        </p>
        <h3 className="font-display text-gray-900 text-base font-bold leading-snug mb-1 text-balance">
          {product.title}
        </h3>
        <p className="text-xs text-gray-500 font-body line-clamp-2 mb-3 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-end justify-between">
          <div>
            <span className="font-display text-brand-600 text-xl font-bold">
              {priceFormatted}
            </span>
            <span className="text-gray-400 text-xs ml-1 font-body">/ {product.unit}</span>
          </div>

          <button
            disabled={!product.inStock}
            className={clsx(
              "text-xs font-body font-semibold px-3 py-1.5 rounded-full transition-colors",
              product.inStock
                ? "bg-brand-500 text-white hover:bg-brand-600 cursor-pointer"
                : "bg-gray-200 text-gray-400 cursor-not-allowed",
            )}
          >
            {product.inStock ? "Quero!" : "Indisponível"}
          </button>
        </div>
      </div>
    </article>
  )
}
