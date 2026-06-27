import { Navbar } from "@/components/ui/Navbar"
import { Hero } from "@/components/ui/Hero"
import { CatalogGrid } from "@/components/catalog/CatalogGrid"
import { ChatWidget } from "@/components/chat/ChatWidget"
import { Footer } from "@/components/ui/Footer"
import { getProducts } from "@/lib/products"
import { assistant, market, whatsappUrl } from "@/lib/config"

export default async function Home() {
  const products = await getProducts()
  const wa = whatsappUrl()

  return (
    <main className="min-h-screen">
      {/* Faixa fixa de atendimento: sempre visível no topo do site */}
      <div className="bg-sage-950 text-cream-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-9 py-1.5 flex flex-wrap items-center justify-center sm:justify-between gap-x-4 gap-y-1 text-xs font-body">
          <span className="inline-flex items-center gap-1.5 text-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" aria-hidden="true" />
            {assistant.availability} com o {assistant.name}, {assistant.role}
          </span>
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-gold-300 hover:text-gold-200 font-semibold transition-colors"
            >
              Falar no WhatsApp
              {market.phoneDisplay ? <span className="hidden sm:inline text-cream-200/70 font-normal">{market.phoneDisplay}</span> : null}
            </a>
          )}
        </div>
      </div>
      <Navbar />
      <Hero />
      <CatalogGrid products={products} />
      <Footer />
      <ChatWidget />
    </main>
  )
}
