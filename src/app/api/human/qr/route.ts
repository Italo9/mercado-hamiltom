import { NextResponse } from "next/server"
import { relayGet } from "@/lib/relay"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const result = await relayGet("/qr")
  if (!result) {
    return NextResponse.json({ enabled: false, connection: "disconnected", qr: null })
  }
  return NextResponse.json(result)
}
