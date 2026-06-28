import { NextRequest, NextResponse } from "next/server"
import { relayPost } from "@/lib/relay"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const result = await relayPost("/end", body)
  if (!result) {
    return NextResponse.json({ ok: false })
  }
  return NextResponse.json(result)
}
