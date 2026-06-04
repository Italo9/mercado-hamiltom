import { MapPin, Clock, MessageCircle } from "lucide-react"
import { Logo } from "./Logo"

const WHATSAPP = "5574999995365"
const WHATSAPP_URL = `https://wa.me/${WHATSAPP}`

const CATEGORIES = ["Frios", "Hortifruti", "Laticínios", "Padaria", "Carnes", "Bebidas", "Mercearia"]

export function Footer() {
  return (
    <footer className="bg-sage-950 text-cream-200/80 py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div>
            <Logo tone="light" size="md" className="mb-4" />
            <p className="font-body text-sm leading-relaxed text-cream-200/60 max-w-xs">
              Servindo o bairro com frios selecionados, produtos frescos e o preço justo
              que você merece.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-white font-bold mb-3 text-base">Contato</h3>
            <ul className="space-y-2.5 font-body text-sm text-cream-200/60">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                Lagoa Nova, Irecê&nbsp;&ndash;&nbsp;BA &middot; 44900-000
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-gold-400 flex-shrink-0" aria-hidden="true" />
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold-300 transition-colors"
                >
                  (74) 99999-5365 — WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold-400 flex-shrink-0" aria-hidden="true" />
                Seg a Sáb: até 20h
              </li>
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-display text-white font-bold mb-3 text-base">Categorias</h3>
            <ul className="grid grid-cols-2 gap-1.5 font-body text-sm text-cream-200/60">
              {CATEGORIES.map((c) => (
                <li key={c}>
                  <a href="#catalogo" className="hover:text-gold-300 transition-colors">{c}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-sage-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 font-body text-xs text-cream-200/50">
          <p>&copy;&nbsp;{new Date().getFullYear()} DINIZ Comercial e Frios. Todos os direitos reservados.</p>
          <p>
            Desenvolvido por{" "}
            <a
              href="https://italolima.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-400 hover:text-gold-300 transition-colors underline underline-offset-2 decoration-gold-600 hover:decoration-gold-400"
            >
              Ítalo Lima
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
