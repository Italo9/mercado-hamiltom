"use client"

// Atalho que abre o chat do Tom em qualquer lugar da página. Dispara um evento
// global que o ChatWidget escuta. Assim todas as chamadas para ação levam ao
// robô, que é o elemento principal do site.

interface OpenChatButtonProps {
  className?: string
  children: React.ReactNode
}

export function openTomChat() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tom:open"))
  }
}

export function OpenChatButton({ className, children }: OpenChatButtonProps) {
  return (
    <button type="button" onClick={openTomChat} className={className}>
      {children}
    </button>
  )
}
