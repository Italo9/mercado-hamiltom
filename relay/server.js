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
const AUTH_DIR = (process.env.WHATSAPP_AUTH_DIR || "./.whatsapp-auth") + "/state"
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

function jidMatches(jid, number) {
  const clean = (s) => s.replace(/\D/g, "")
  const a = clean(jid)
  const b = clean(number)
  if (a === b) return true
  // Celular brasileiro pode ter 9 extra: 55XX9XXXX-XXXX vs 55XXXX-XXXX
  if (b.length >= 12 && a.length >= 11) {
    const shorter = a.length < b.length ? a : b
    const longer = a.length < b.length ? b : a
    if (longer.length === shorter.length + 1 && longer.startsWith(shorter.slice(0, 4))) {
      return longer.slice(0, 4) + longer.slice(5) === shorter
    }
  }
  return false
}

function extractText(message) {
  const conversation = message.conversation
  if (typeof conversation === "string") return conversation
  const extended = message.extendedTextMessage
  if (extended && typeof extended.text === "string") return extended.text
  return ""
}

async function connectWhatsApp() {
  connectionState = "connecting"

  // Garante que o diretório de auth existe
  try { require("fs").mkdirSync(AUTH_DIR, { recursive: true }) } catch (_) {}

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
      connectWhatsApp._attempt = 0
      console.log("[WHATSAPP] Conectado!")
    }
    if (connection === "close") {
      connectionState = "close"
      const err = lastDisconnect?.error
      const statusCode = err?.output?.statusCode
      console.log("[WHATSAPP] Desconectado, statusCode:", statusCode, "message:", err?.message || "")

      // 401 = logged out / session expired: limpa auth pra gerar QR novo
      if (statusCode === 401) {
        try {
          const fs = require("fs")
          const path = require("path")
          if (fs.existsSync(AUTH_DIR)) {
            for (const f of fs.readdirSync(AUTH_DIR)) {
              try { fs.unlinkSync(path.join(AUTH_DIR, f)) } catch (_) {}
            }
            console.log("[WHATSAPP] auth limpo, novo QR sera gerado")
          }
        } catch (_) {}
      }

      // Sempre reconecta
      sock = null
      const attempt = (connectWhatsApp._attempt = (connectWhatsApp._attempt || 0) + 1)
      const delay = Math.min(5000 * Math.pow(2, attempt - 1), 120000)
      console.log("[WHATSAPP] reconectando em", delay / 1000, "s (tentativa", attempt, ")")
      setTimeout(connectWhatsApp, delay)
    }
  })

  sock.ev.on("messages.upsert", (raw) => {
    const list = raw.messages ?? []
    for (const m of list) {
      const key = m.key
      const message = m.message
      if (!message || !key) continue

      const from = (key.remoteJid ?? "").toString()
      const isMe = !!key.fromMe

      // Só aceita mensagens da própria conta (fromMe) ou do número do atendente.
      // Em multi-device, respostas do celular chegam como fromMe:true via LID JID.
      if (!isMe && !jidMatches(from, ATTENDANT_NUMBER)) continue

      const text = extractText(message)
      if (!text.trim()) continue

      // Ignora eco das mensagens enviadas pelo relay (prefixos conhecidos)
      if (isMe && (text.startsWith("Cliente:") || text.startsWith("*NOVO"))) continue

      console.log("[WHATSAPP] texto do atendente:", text.substring(0, 80))

      const session = getActiveSession()
      if (!session) { console.log("[WHATSAPP] sem sessao ativa"); continue }

      session.queue.push({ id: nextId(), text: text.trim(), at: Date.now() })
      console.log("[WHATSAPP] resposta do atendente:", text.trim().substring(0, 80))
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

app.get("/qr-page", (_req, res) => {
  if (!WHATSAPP_ENABLED) {
    return res.send("<h2>WHATSAPP_ENABLED=false</h2>")
  }
  if (connectionState === "open") {
    return res.send("<html><body style=\"font-family:sans-serif;text-align:center;margin-top:80px;background:#f0f0f0\"><h2 style=\"color:#075e54\">WhatsApp conectado!</h2></body></html>")
  }
  const qrData = latestQR || ""
  const refresh = qrData ? 5 : 3
  const heading = qrData ? "Escaneie com o WhatsApp do atendente" : "Aguardando QR..."
  const js = qrData
    ? 'new QRCode(document.getElementById("qr"),{text:' + JSON.stringify(qrData) + ',width:280,height:280})'
    : ""

  res.send("<!DOCTYPE html>\n<html lang=\"pt\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<title>QR — WhatsApp</title>\n" +
    '<meta http-equiv="refresh" content="' + refresh + '">\n' +
    '<script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"><\/script>\n' +
    "<style>body{font-family:sans-serif;text-align:center;margin-top:40px;background:#f0f0f0}" +
    "#qr{margin:20px auto;display:inline-block;padding:16px;background:#fff;border-radius:12px;border:3px solid #075e54}" +
    "h2{color:#075e54}p{color:#666;font-size:14px}<\/style>\n<\/head>\n<body>\n" +
    "<h2>" + heading + "<\/h2>\n" +
    (qrData ? "<p>Aparelhos conectados → Conectar um aparelho<\/p>\n<div id=\"qr\"><\/div>\n<p>O QR atualiza a cada 5s<\/p>\n" : "") +
    "<script>" + js + "<\/script>\n" +
    "<\/body>\n<\/html>")
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
