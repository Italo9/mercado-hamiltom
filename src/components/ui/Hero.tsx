import { ShoppingCart, MapPin, Clock, MessageCircle, CreditCard } from "lucide-react"

const WHATSAPP_URL = "https://wa.me/5574999995365"

const PAYMENTS = ["Visa", "Mastercard", "Elo", "Hipercard", "Pix"]

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-sage-900 text-white">
      {/* Padrão pontilhado sutil */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />

      {/* Brilhos dourados */}
      <div
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-gold-400 opacity-25 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-gold-300 opacity-15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14 sm:pt-24 sm:pb-20">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <span className="inline-flex items-center gap-2 bg-gold-400/15 text-gold-200 ring-1 ring-gold-300/30 font-body text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full mb-5">
            <MapPin className="w-4 h-4" aria-hidden="true" />
            Comercial e Frios &middot; Lagoa Nova - Irecê &ndash; BA &middot; 4,6 ★ no Google
          </span>

          {/* Headline */}
          <h1 className="font-display text-[2.5rem] leading-[1.05] sm:text-6xl lg:text-7xl font-black mb-5 text-balance">
            Qualidade e{" "}
            <span className="text-gold-300">preço justo</span>{" "}
            em um só lugar.
          </h1>

          {/* Subline */}
          <p className="font-body text-cream-100/90 text-base sm:text-xl leading-relaxed max-w-xl mb-8">
            No Comercial e Frios DINIZ você encontra frios selecionados, produtos frescos
            e o melhor preço do bairro — tudo pertinho de você.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="#catalogo"
              className="inline-flex items-center justify-center gap-2 bg-gold-400 text-sage-900 font-body font-bold
                         px-6 py-3.5 rounded-full hover:bg-gold-300 transition-colors shadow-lg shadow-black/10"
            >
              <ShoppingCart className="w-5 h-5" aria-hidden="true" />
              Ver produtos
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white font-body font-semibold
                         px-6 py-3.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <MessageCircle className="w-5 h-5" aria-hidden="true" />
              Pedir no WhatsApp
            </a>
          </div>

          {/* Faixa de meios de pagamento */}
          <div className="mt-9 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-cream-100/70 text-xs font-body font-semibold uppercase tracking-wide">
              <CreditCard className="w-4 h-4" aria-hidden="true" />
              Aceitamos todos os cartões
            </span>
            {PAYMENTS.map((p) => (
              <span
                key={p}
                className="bg-white/95 text-sage-800 text-[11px] font-body font-bold px-2.5 py-1 rounded-md shadow-sm"
              >
                {p}
              </span>
            ))}
          </div>

          {/* Info strip */}
          <div className="mt-9 flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-6 text-sm font-body text-cream-100/80">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gold-300" aria-hidden="true" />
              Seg a Sáb &middot; fecha às 20h
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gold-300" aria-hidden="true" />
              Lagoa Nova, Irecê &mdash; BA &middot; CEP 44900-000
            </span>
          </div>
        </div>
      </div>

      {/* Onda dourada na base */}
      <div className="relative h-3 bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500" aria-hidden="true" />
    </section>
  )
}
