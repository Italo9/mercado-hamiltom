import { NextRequest, NextResponse } from "next/server"
import { startSession } from "@/lib/humanSessions"
import { sendToAttendant, whatsappEnabled } from "@/lib/whatsapp"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const { sessionId, name } = (await req.json()) as { sessionId?: string; name?: string }

  if (!sessionId || !name || name.trim() === "") {
    return NextResponse.json({ ok: false, error: "dados incompletos" }, { status: 400 })
  }

  startSession(sessionId, name.trim())

  if (!whatsappEnabled()) {
    // Sem WhatsApp configurado: o cliente recebe um aviso amigável e o bot segue.
    return NextResponse.json({ ok: false, enabled: false })
  }

  try {
    await sendToAttendant(
      `*NOVO ATENDIMENTO*\n\nCliente: ${name.trim()}\n\nResponda por aqui. Suas mensagens aparecem para o cliente dentro do site.`,
    )
    return NextResponse.json({ ok: true, enabled: true })
  } catch (error) {
    console.error("[HUMAN/start] erro ao avisar atendente:", error)
    return NextResponse.json({ ok: false, enabled: true, error: "whatsapp indisponivel" })
  }
}
