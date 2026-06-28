import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const RELAY = process.env.RELAY_URL
const TOKEN = process.env.RELAY_AUTH_TOKEN || "change-me"

async function post(path: string, body: unknown) {
  if (!RELAY) return null
  try {
    console.log("[START-PROXY] calling", path)
    const res = await fetch(`${RELAY}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    console.log("[START-PROXY] response ok:", data?.ok, "enabled:", data?.enabled)
    return data
  } catch (e: any) {
    console.error("[START-PROXY] error:", e?.message || e)
    return null
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const result = await post("/start", body)
  if (!result) {
    return NextResponse.json({ ok: false, enabled: false })
  }
  return NextResponse.json(result)
}
