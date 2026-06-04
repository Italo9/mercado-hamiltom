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
}

export interface Suggestion {
  label: string
  prompt: string
}
