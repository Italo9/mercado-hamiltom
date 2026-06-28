import { NextRequest, NextResponse } from "next/server"
import { drainSession, sweepTimeouts } from "@/lib/humanSessions"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId")
  if (!sessionId) {
    return NextResponse.json({ active: false, messages: [], ended: null })
  }

  // Aproveita cada polling para encerrar sessões inativas.
  sweepTimeouts()

  const result = drainSession(sessionId)
  return NextResponse.json(result)
}
