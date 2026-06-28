import { NextResponse } from "next/server"
import { ensureWhatsapp, whatsappStatus, whatsappEnabled } from "@/lib/whatsapp"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Dispara a conexão (gera o QR na primeira vez) e devolve o status.
// O QR também é impresso no log do container (docker logs).
export async function GET() {
  if (!whatsappEnabled()) {
    return NextResponse.json({ enabled: false, connection: "disconnected", qr: null })
  }
  await ensureWhatsapp()
  return NextResponse.json(whatsappStatus())
}
