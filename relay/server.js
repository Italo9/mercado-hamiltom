// Relay WhatsApp — servidor standalone que mantém a conexão Baileys viva
// e gerencia as sessões de atendimento humano. Sobe em host persistente
// (Railway, Fly.io, Docker) enquanto o Next.js roda na Vercel em serverless.
//
// Endpoints (todos exigem header Authorization: Bearer <RELAY_AUTH_TOKEN>):
//   GET  /qr        → QR code atual ou null
//   GET  /status    → status da conexão WhatsApp
//   POST /start     → inicia sessão de atendimento e notifica o atendente
//   POST /message   → encaminha mensagem do cliente ao atendente
//   GET  /poll      → drena mensagens do atendente para a sessão
//   POST /end       → encerra sessão

const express = require("express")

// --------------- Config ---------------
const PORT = process.env.PORT || 4000
const AUTH_TOKEN = process.env.RELAY_AUTH_TOKEN || "change-me"
const WHATSAPP_ENABLED = (process.env.WHATSAPP_ENABLED || "false").toLowerCase() === "true"
const ATTENDANT_NUMBER = (process.env.WHATSAPP_ATTENDANT_NUMBER || "5574999690535").replace(/\D/g, "")
const AUTH_DIR = process.env.WHATSAPP_AUTH_DIR || "./.whatsapp-auth"
const HUMAN_TIMEOUT_MS = Number(process.env.HUMAN_TIMEOUT_MS || 180000)

// --------------- Auth middleware ---------------
function auth(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "")
  if (token !== AUTH_TOKEN) {
    return res.status(401).json({ error: "unauthorized" })
  }
  next()
}

// --------------- Session store ---------------
let sessions = new Map()
let activeSessionId = null
let counter = 0

function nextId() {
  counter += 1
  return `${Date.now()}-${counter}`
}

function startSession(id, name) {
  const session = { id, name, active: true, lastClientActivity: Date.now(), queue: [], ended: null }
  sessions.set(id, session)
  activeSessionId = id
  return session
}

function getActiveSession() {
  if (!activeSessionId) return null
  const s = sessions.get(activeSessionId)
  return s && s.active ? s : null
}

function endSession(id, reason) {
  const s = sessions.get(id)
  if (!s) return
  s.active = false
  s.ended = { reason }
  if (activeSessionId === id) activeSessionId = null
}

function drainSession(id) {
  const s = sessions.get(id)
  if (!s) return { active: false, messages: [], ended: null }
  const messages = s.queue
  s.queue = []
  const ended = s.ended
  if (ended) sessions.delete(id)
  return { active: s.active, messages, ended }
}

function sweepTimeouts() {
  const now = Date.now()
  for (const s of sessions.values()) {
    if (s.active && now - s.lastClientActivity >= HUMAN_TIMEOUT_MS) {
      endSession(s.id, "timeout")
    }
  }
}

setInterval(sweepTimeouts, 30000)

// --------------- WhatsApp ---------------
let sock = null
let latestQR = null
let connectionState = "disconnected"

function extractText(message) {
  const conversation = message.conversation
  if (typeof conversation === "string") return conversation
  const extended = message.extendedTextMessage
  if (extended && typeof extended.text === "string") return extended.text
  return ""
}

async function connectWhatsApp() {
  connectionState = "connecting"
  const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys")
  const pino = require("pino")
  const logger = pino({ level: "silent" })

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR)

  sock = makeWASocket({
    auth: state,
    logger,
    printQRInTerminal: false,
    browser: ["Mercado Diniz", "Chrome", "1.0.0"],
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", (raw) => {
    const { qr, connection, lastDisconnect } = raw
    if (qr) {
      latestQR = qr
      const qrcode = require("qrcode-terminal")
      qrcode.generate(qr, { small: true })
      console.log("[WHATSAPP] QR code gerado — escaneie com o WhatsApp do atendente")
    }
    if (connection === "open") {
      connectionState = "open"
      latestQR = null
      console.log("[WHATSAPP] Conectado!")
    }
    if (connection === "close") {
      connectionState = "close"
      const statusCode = lastDisconnect?.error?.output?.statusCode
      const loggedOut = DisconnectReason?.loggedOut ?? 401
      console.log("[WHATSAPP] Desconectado, statusCode:", statusCode)
      if (statusCode !== loggedOut) {
        sock = null
        setTimeout(connectWhatsApp, 5000)
      }
    }
  })

  sock.ev.on("messages.upsert", (raw) => {
    const list = raw.messages ?? []
    for (const m of list) {
      const key = m.key
      const message = m.message
      if (!message || !key || key.fromMe) continue
      const from = key.remoteJid ?? ""
      if (!from.startsWith(ATTENDANT_NUMBER)) continue
      const text = extractText(message)
      if (!text.trim()) continue

      const session = getActiveSession()
      if (session) {
        session.queue.push({ id: nextId(), text: text.trim(), at: Date.now() })
      }
    }
  })
}

async function sendToAttendant(text) {
  if (!sock || connectionState !== "open") {
    throw new Error("WhatsApp offline")
  }
  const jid = `${ATTENDANT_NUMBER}@s.whatsapp.net`
  await sock.sendMessage(jid, { text })
}

// --------------- Express app ---------------
const app = express()
app.use(express.json())

app.get("/qr", auth, (_req, res) => {
  res.json({ enabled: WHATSAPP_ENABLED, connection: connectionState, qr: latestQR })
})

app.get("/status", auth, (_req, res) => {
  res.json({ enabled: WHATSAPP_ENABLED, connection: connectionState })
})

app.post("/start", auth, async (req, res) => {
  const { sessionId, name } = req.body
  if (!sessionId || !name || !name.trim()) {
    return res.status(400).json({ ok: false, error: "dados incompletos" })
  }
  startSession(sessionId, name.trim())

  if (!WHATSAPP_ENABLED || connectionState !== "open") {
    return res.json({ ok: false, enabled: false })
  }

  try {
    await sendToAttendant(
      `*NOVO ATENDIMENTO*\n\nCliente: ${name.trim()}\n\nResponda por aqui. Suas mensagens aparecem para o cliente dentro do site.`,
    )
    return res.json({ ok: true, enabled: true })
  } catch (error) {
    console.error("[RELAY/start] erro:", error.message)
    return res.json({ ok: false, enabled: true, error: "whatsapp indisponivel" })
  }
})

app.post("/message", auth, async (req, res) => {
  const { sessionId, text } = req.body
  if (!sessionId || !text || !text.trim()) {
    return res.status(400).json({ ok: false, error: "dados incompletos" })
  }

  const session = sessions.get(sessionId)
  if (!session || !session.active) {
    return res.json({ ok: false, active: false })
  }

  session.lastClientActivity = Date.now()

  if (!WHATSAPP_ENABLED || connectionState !== "open") {
    return res.json({ ok: false, enabled: false })
  }

  try {
    await sendToAttendant(`Cliente: ${session.name}\n\n${text.trim()}`)
    return res.json({ ok: true })
  } catch (error) {
    console.error("[RELAY/message] erro:", error.message)
    return res.json({ ok: false, error: "whatsapp indisponivel" })
  }
})

app.get("/poll", auth, (req, res) => {
  const sessionId = req.query.sessionId
  if (!sessionId) {
    return res.json({ active: false, messages: [], ended: null })
  }
  sweepTimeouts()
  const result = drainSession(sessionId)
  return res.json(result)
})

app.post("/end", auth, (req, res) => {
  const { sessionId } = req.body
  if (!sessionId) {
    return res.status(400).json({ ok: false, error: "dados incompletos" })
  }
  endSession(sessionId, "manual")
  res.json({ ok: true })
})

// --------------- Start ---------------
app.listen(PORT, () => {
  console.log(`[RELAY] rodando na porta ${PORT}`)
  if (WHATSAPP_ENABLED) {
    connectWhatsApp().catch((err) => {
      console.error("[RELAY] falha ao iniciar WhatsApp:", err)
    })
  } else {
    console.log("[RELAY] WHATSAPP_ENABLED=false — WhatsApp offline")
  }
})
