import { NextRequest, NextResponse } from "next/server"
import { buildSystemPrompt } from "@/lib/chat"

export const runtime = "edge"

const NIM_BASE = "https://integrate.api.nvidia.com/v1/chat/completions"

// Ordem prioriza velocidade média observada
const NIM_MODELS = [
  "deepseek-ai/deepseek-v4-flash",
  "z-ai/glm-5.1",
  "meta/llama-3.3-70b-instruct",
]

const MODEL_TIMEOUTS: Record<string, number> = {
  "deepseek-ai/deepseek-v4-flash": 10000,
  "z-ai/glm-5.1": 12000,
  "meta/llama-3.3-70b-instruct": 15000,
}

async function callNim(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: { role: string; content: string }[],
): Promise<string | null> {
  const controller = new AbortController()

  const timeout = setTimeout(() => {
    controller.abort()
  }, MODEL_TIMEOUTS[model] ?? 12000)

  try {
    console.time(model)

    const response = await fetch(NIM_BASE, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 512,
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...messages,
        ],
      }),
    })

    if (!response.ok) {
      console.error(
        `Model ${model} failed with status ${response.status}`,
      )
      return null
    }

    const data = await response.json()

    console.timeEnd(model)

    return data?.choices?.[0]?.message?.content ?? null
  } catch (error) {
    console.error(`Model ${model} error:`, error)
    return null
  } finally {
    clearTimeout(timeout)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const apiKey = process.env.NVIDIA_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "NVIDIA_API_KEY not configured",
        },
        {
          status: 500,
        },
      )
    }

    const systemPrompt = buildSystemPrompt()

    const promises = NIM_MODELS.map(async (model) => {
      const text = await callNim(
        apiKey,
        model,
        systemPrompt,
        messages,
      )

      if (!text) {
        throw new Error(`${model} returned empty response`)
      }

      return {
        text,
        model,
      }
    })

    const result = await Promise.any(promises)

    console.log(
      `[CHAT] Winner model: ${result.model}`
    )

    return NextResponse.json({
      text: result.text,
      model: result.model,
    })
  } catch (error) {
    console.error(
      "[CHAT] All models failed:",
      error,
    )

    return NextResponse.json(
      {
        text: "Desculpe, estou temporariamente indisponível. Tente novamente em alguns instantes.",
      },
      {
        status: 503,
      },
    )
  }
}
