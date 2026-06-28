import { NextRequest, NextResponse } from "next/server"
import { endSession } from "@/lib/humanSessions"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const { sessionId } = (await req.json()) as { sessionId?: string }
  if (!sessionId) {
    return NextResponse.json({ ok: false, error: "dados incompletos" }, { status: 400 })
  }
  endSession(sessionId, "manual")
  return NextResponse.json({ ok: true })
}
