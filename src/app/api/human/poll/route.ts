import { NextRequest, NextResponse } from "next/server"
import { relayGet } from "@/lib/relay"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId")
  const result = await relayGet(`/poll?sessionId=${encodeURIComponent(sessionId ?? "")}`)
  if (!result) {
    return NextResponse.json({ active: false, messages: [], ended: null })
  }
  return NextResponse.json(result)
}
