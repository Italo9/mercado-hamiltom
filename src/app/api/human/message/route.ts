import { NextRequest, NextResponse } from "next/server"
import { getSession, touchClient } from "@/lib/humanSessions"
import { sendToAttendant, whatsappEnabled } from "@/lib/whatsapp"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const { sessionId, text } = (await req.json()) as { sessionId?: string; text?: string }

  if (!sessionId || !text || text.trim() === "") {
    return NextResponse.json({ ok: false, error: "dados incompletos" }, { status: 400 })
  }

  const session = getSession(sessionId)
  if (!session || !session.active) {
    return NextResponse.json({ ok: false, active: false })
  }

  touchClient(sessionId)

  if (!whatsappEnabled()) {
    return NextResponse.json({ ok: false, enabled: false })
  }

  try {
    await sendToAttendant(`Cliente: ${session.name}\n\n${text.trim()}`)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[HUMAN/message] erro ao enviar ao atendente:", error)
    return NextResponse.json({ ok: false, error: "whatsapp indisponivel" })
  }
}
