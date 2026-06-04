import { Navbar } from "@/components/ui/Navbar"
import { Hero } from "@/components/ui/Hero"
import { CatalogGrid } from "@/components/catalog/CatalogGrid"
import { ChatWidget } from "@/components/chat/ChatWidget"
import { Footer } from "@/components/ui/Footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <CatalogGrid />
      <Footer />
      <ChatWidget />
    </main>
  )
}
