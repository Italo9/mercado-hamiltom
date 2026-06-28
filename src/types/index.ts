export interface Product {
  id: string
  title: string
  price: number
  unit: string
  category: string
  image: string
  description: string
  inStock: boolean
  badge?: "oferta" | "novidade" | "destaque"
}

export interface Category {
  id: string
  label: string
  icon: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  // true quando a mensagem veio de um atendente humano (via WhatsApp)
  human?: boolean
}

export interface Suggestion {
  label: string
  prompt: string
}
