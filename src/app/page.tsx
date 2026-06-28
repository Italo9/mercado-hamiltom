import { Navbar } from "@/components/ui/Navbar"
import { Hero } from "@/components/ui/Hero"
import { CatalogGrid } from "@/components/catalog/CatalogGrid"
import { ChatWidget } from "@/components/chat/ChatWidget"
import { Footer } from "@/components/ui/Footer"
import { getProducts } from "@/lib/products"

export default async function Home() {
  const products = await getProducts()

  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <CatalogGrid products={products} />
      <Footer />
      <ChatWidget />
    </main>
  )
}
