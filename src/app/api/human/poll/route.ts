import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId")
  const relayUrl = process.env.RELAY_URL
  const relayToken = process.env.RELAY_AUTH_TOKEN || "change-me"

  if (!relayUrl) {
    return NextResponse.json({ active: false, messages: [], ended: null })
  }

  try {
    const url = `${relayUrl}/poll?sessionId=${encodeURIComponent(sessionId ?? "")}`
    console.log("[POLL-PROXY] calling", url.substring(0, 70))
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${relayToken}` },
    })
    const data = await res.json()
    console.log("[POLL-PROXY] response msgs:", data?.messages?.length, "active:", data?.active)
    return NextResponse.json(data)
  } catch (e: any) {
    console.error("[POLL-PROXY] error:", e?.message || e)
    return NextResponse.json({ active: false, messages: [], ended: null })
  }
}
