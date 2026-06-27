import { MapPin, Clock, MessageCircle, Phone } from "lucide-react"
import { Logo } from "./Logo"
import { market, assistant, whatsappUrl } from "@/lib/config"

export function Footer() {
  const wa = whatsappUrl()

  return (
    <footer className="bg-sage-950 text-cream-200/80 py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div>
            <Logo tone="light" size="md" className="mb-4" />
            <p className="font-body text-sm leading-relaxed text-cream-200/60 max-w-xs">
              {market.name}: {market.description}.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-white font-bold mb-3 text-base">Contato</h3>
            <ul className="space-y-2.5 font-body text-sm text-cream-200/60">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                {market.address}{market.cep ? ` · ${market.cep}` : ""}
              </li>
              {(wa || market.phoneDisplay) && (
                <li className="flex items-center gap-2">
                  {wa ? <MessageCircle className="w-4 h-4 text-gold-400 flex-shrink-0" aria-hidden="true" /> : <Phone className="w-4 h-4 text-gold-400 flex-shrink-0" aria-hidden="true" />}
                  {wa ? (
                    <a href={wa} target="_blank" rel="noopener noreferrer" className="hover:text-gold-300 transition-colors">
                      {market.phoneDisplay || "WhatsApp"}
                    </a>
                  ) : (
                    <span>{market.phoneDisplay}</span>
                  )}
                </li>
              )}
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold-400 flex-shrink-0" aria-hidden="true" />
                {market.hours}
              </li>
            </ul>
          </div>

          {/* Sobre */}
          <div>
            <h3 className="font-display text-white font-bold mb-3 text-base">Sobre</h3>
            <p className="font-body text-sm text-cream-200/60 leading-relaxed">
              Site informativo do {market.name}: consulte os preços e a disponibilidade dos produtos.
              Para dúvidas, fale com o {assistant.name}, {assistant.availability.toLowerCase()}, no canto da tela.
            </p>
          </div>
        </div>

        {/* Mapa de localização */}
        {market.address && (
          <div className="mb-10">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="font-display text-white font-bold text-base">Onde estamos</h3>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${market.name}, ${market.address}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-gold-400 hover:text-gold-300 font-body text-sm font-semibold transition-colors"
              >
                <MapPin className="w-4 h-4" aria-hidden="true" />
                Como chegar
              </a>
            </div>
            <div className="overflow-hidden rounded-2xl ring-1 ring-sage-800 shadow-lg shadow-black/30">
              <iframe
                title={`Mapa do ${market.name}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(`${market.name}, ${market.address}`)}&output=embed`}
                className="w-full h-64 border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        )}

        <div className="border-t border-sage-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 font-body text-xs text-cream-200/50">
          <p>&copy;&nbsp;{new Date().getFullYear()} {market.name}. Todos os direitos reservados.</p>
          {market.developerName && (
            <p>
              Desenvolvido por{" "}
              {market.developerUrl ? (
                <a
                  href={market.developerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-400 hover:text-gold-300 transition-colors underline underline-offset-2 decoration-gold-600 hover:decoration-gold-400"
                >
                  {market.developerName}
                </a>
              ) : (
                market.developerName
              )}
            </p>
          )}
        </div>
      </div>
    </footer>
  )
}
