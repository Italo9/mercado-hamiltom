import { ShoppingCart } from "lucide-react"
import { clsx } from "clsx"

type LogoSize = "sm" | "md" | "lg"
type LogoTone = "dark" | "light"

interface LogoProps {
  /** "dark" para fundos claros (texto vinho), "light" para fundos escuros/vermelhos (texto creme). */
  tone?: LogoTone
  size?: LogoSize
  showTagline?: boolean
  className?: string
}

const DISC = {
  sm: "w-9 h-9",
  md: "w-11 h-11",
  lg: "w-14 h-14",
}

const CART = {
  sm: "w-5 h-5",
  md: "w-6 h-6",
  lg: "w-7 h-7",
}

const WORDMARK = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
}

const TAGLINE = {
  sm: "text-[9px]",
  md: "text-[10px]",
  lg: "text-xs",
}

export function Logo({
  tone = "dark",
  size = "md",
  showTagline = true,
  className,
}: LogoProps) {
  return (
    <span className={clsx("flex items-center gap-2.5 group", className)}>
      {/* Disco dourado com o carrinho */}
      <span
        className={clsx(
          "relative grid place-items-center rounded-full flex-shrink-0",
          "bg-gradient-to-br from-gold-300 via-gold-400 to-gold-500",
          "ring-1 ring-gold-600/40 shadow-md",
          "transition-transform duration-300 group-hover:scale-105",
          DISC[size],
        )}
      >
        <ShoppingCart
          className={clsx("text-sage-800", CART[size])}
          strokeWidth={2.4}
          aria-hidden="true"
        />
      </span>

      {/* Wordmark */}
      <span className="flex flex-col leading-none">
        <span
          className={clsx(
            "font-display font-black tracking-tight leading-none",
            WORDMARK[size],
            tone === "light" ? "text-cream-50" : "text-sage-700",
          )}
        >
          DINIZ
        </span>
        {showTagline && (
          <span
            className={clsx(
              "font-body font-semibold uppercase leading-none mt-0.5",
              "tracking-[0.18em]",
              TAGLINE[size],
              tone === "light" ? "text-gold-300" : "text-brand-600",
            )}
          >
            Comercial&nbsp;e&nbsp;Frios
          </span>
        )}
      </span>
    </span>
  )
}
