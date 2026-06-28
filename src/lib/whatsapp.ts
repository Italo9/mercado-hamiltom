// Conexão com o WhatsApp via Baileys (@whiskeysockets/baileys).
//
// Só carrega a biblioteca quando WHATSAPP_ENABLED=true, então o restante do
// site (e o build) não dependem dela. O socket e a sessão de credenciais ficam
// em um singleton de processo: funciona no deploy persistente (Docker, node
// server.js), e NÃO em serverless.
//
// Pareamento: na primeira conexão o Baileys emite um QR. Ele é exibido no log
// do container (docker logs) e também fica disponível em GET /api/human/qr.

import { enqueueFromAttendant } from "./humanSessions"

type AnySock = {
  sendMessage: (jid: string, content: { text: string }) => Promise<unknown>
  ev: { on: (event: string, cb: (arg: unknown) => void) => void }
}

let sockPromise: Promise<AnySock | null> | null = null
let latestQR: string | null = null
let connectionState: "disconnected" | "connecting" | "open" | "close" = "disconnected"

export function whatsappEnabled(): boolean {
  return (process.env.WHATSAPP_ENABLED ?? "").toLowerCase() === "true"
}

export function attendantNumber(): string {
  // Número do atendente (só dígitos, com DDI). Padrão: número de teste.
  return (process.env.WHATSAPP_ATTENDANT_NUMBER || "5574999690535").replace(/\D/g, "")
}

function extractText(message: Record<string, unknown>): string {
  const conversation = message["conversation"]
  if (typeof conversation === "string") {
    return conversation
  }
  const extended = message["extendedTextMessage"] as { text?: string } | undefined
  if (extended && typeof extended.text === "string") {
    return extended.text
  }
  return ""
}

async function init(): Promise<AnySock | null> {
  connectionState = "connecting"

  // Import por especificador em variável: o bundler do Next não resolve isto em
  // build (mantém como require em runtime). Assim o build da Vercel não depende
  // do Baileys; ele só é carregado no host persistente (Docker) com WHATSAPP_ENABLED=true.
  const baileysPkg = "@whiskeysockets/baileys"
  const baileys = await import(baileysPkg)
  const makeWASocket = (baileys.default ?? (baileys as unknown as { makeWASocket: unknown }).makeWASocket) as (
    config: Record<string, unknown>,
  ) => AnySock
  const { useMultiFileAuthState, DisconnectReason } = baileys as unknown as {
    useMultiFileAuthState: (dir: string) => Promise<{ state: unknown; saveCreds: () => Promise<void> }>
    DisconnectReason: Record<string, number>
  }

  const pinoPkg = "pino"
  const pino = (await import(pinoPkg)).default
  const logger = pino({ level: "silent" })

  const authDir = process.env.WHATSAPP_AUTH_DIR || "./.whatsapp-auth"
  const { state, saveCreds } = await useMultiFileAuthState(authDir)

  const sock = makeWASocket({
    auth: state,
    logger,
    printQRInTerminal: false,
    browser: ["Mercado do Hamiltom", "Chrome", "1.0.0"],
  })

  sock.ev.on("creds.update", saveCreds as () => void)

  sock.ev.on("connection.update", (raw: unknown) => {
    const update = raw as {
      qr?: string
      connection?: string
      lastDisconnect?: { error?: { output?: { statusCode?: number } } }
    }
    if (update.qr) {
      latestQR = update.qr
      const qrPkg = "qrcode-terminal"
      import(qrPkg)
        .then((q) => (q.default ?? q).generate(update.qr as string, { small: true }))
        .catch(() => undefined)
    }
    if (update.connection === "open") {
      connectionState = "open"
      latestQR = null
    }
    if (update.connection === "close") {
      connectionState = "close"
      const statusCode = update.lastDisconnect?.error?.output?.statusCode
      const loggedOut = DisconnectReason?.loggedOut ?? 401
      // Reconecta sozinho, exceto quando a sessão foi desconectada de propósito.
      if (statusCode !== loggedOut) {
        sockPromise = null
        void ensureWhatsapp()
      }
    }
  })

  sock.ev.on("messages.upsert", (raw: unknown) => {
    const event = raw as { messages?: Array<Record<string, unknown>> }
    const list = event.messages ?? []
    for (const m of list) {
      const key = m["key"] as { fromMe?: boolean; remoteJid?: string } | undefined
      const message = m["message"] as Record<string, unknown> | undefined
      if (!message || !key || key.fromMe) {
        continue
      }
      const from = key.remoteJid ?? ""
      // Só aceita mensagens vindas do número do atendente.
      if (!from.startsWith(attendantNumber())) {
        continue
      }
      const text = extractText(message)
      if (text.trim() !== "") {
        enqueueFromAttendant(text.trim())
      }
    }
  })

  return sock
}

export async function ensureWhatsapp(): Promise<AnySock | null> {
  if (!whatsappEnabled()) {
    return null
  }
  if (!sockPromise) {
    sockPromise = init().catch((error) => {
      console.error("[WHATSAPP] falha ao iniciar:", error)
      sockPromise = null
      connectionState = "disconnected"
      return null
    })
  }
  return sockPromise
}

export async function sendToAttendant(text: string): Promise<void> {
  const sock = await ensureWhatsapp()
  if (!sock) {
    throw new Error("WhatsApp desativado ou indisponível")
  }
  const jid = `${attendantNumber()}@s.whatsapp.net`
  await sock.sendMessage(jid, { text })
}

export function whatsappStatus(): {
  enabled: boolean
  connection: string
  qr: string | null
} {
  return { enabled: whatsappEnabled(), connection: connectionState, qr: latestQR }
}
