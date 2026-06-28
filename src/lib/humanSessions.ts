// Estado em memória do atendimento humano (MVP).
//
// Mantém, por sessão do chat, o nome do cliente, se o modo humano está ativo e
// a fila de mensagens do atendente que ainda não foram entregues ao cliente
// (o navegador busca por polling). Como o deploy roda em um processo Node
// persistente (Docker, output standalone), este estado em memória sobrevive
// entre requisições. NÃO use isto em serverless (Vercel), onde cada requisição
// pode cair em uma instância diferente e sem estado.
//
// Limitação assumida do MVP: um único atendente e um único número. As respostas
// do atendente são roteadas para a sessão humana ativa mais recente.

export interface AttendantMessage {
  id: string
  text: string
  at: number
}

export interface HumanSession {
  id: string
  name: string
  active: boolean
  lastClientActivity: number
  queue: AttendantMessage[]
  ended: { reason: "manual" | "timeout" } | null
}

const sessions = new Map<string, HumanSession>()
let activeSessionId: string | null = null

export const HUMAN_TIMEOUT_MS = Number(process.env.HUMAN_TIMEOUT_MS || 180000)

let counter = 0
function nextId(): string {
  counter += 1
  return `${Date.now()}-${counter}`
}

export function startSession(id: string, name: string): HumanSession {
  const session: HumanSession = {
    id,
    name,
    active: true,
    lastClientActivity: Date.now(),
    queue: [],
    ended: null,
  }
  sessions.set(id, session)
  activeSessionId = id
  return session
}

export function getSession(id: string): HumanSession | undefined {
  return sessions.get(id)
}

export function touchClient(id: string): void {
  const session = sessions.get(id)
  if (session && session.active) {
    session.lastClientActivity = Date.now()
  }
}

export function getActiveSession(): HumanSession | null {
  if (!activeSessionId) {
    return null
  }
  const session = sessions.get(activeSessionId)
  return session && session.active ? session : null
}

// Mensagem do atendente destinada ao cliente: vai para a fila da sessão ativa.
export function enqueueFromAttendant(text: string): HumanSession | null {
  const session = getActiveSession()
  if (!session) {
    return null
  }
  session.queue.push({ id: nextId(), text, at: Date.now() })
  return session
}

export function endSession(id: string, reason: "manual" | "timeout"): void {
  const session = sessions.get(id)
  if (!session) {
    return
  }
  session.active = false
  session.ended = { reason }
  if (activeSessionId === id) {
    activeSessionId = null
  }
}

// Consumido pelo navegador (polling). Entrega e limpa a fila, e informa se o
// atendimento foi encerrado (manual ou por inatividade).
export function drainSession(id: string): {
  active: boolean
  messages: AttendantMessage[]
  ended: { reason: "manual" | "timeout" } | null
} {
  const session = sessions.get(id)
  if (!session) {
    return { active: false, messages: [], ended: null }
  }
  const messages = session.queue
  session.queue = []
  const ended = session.ended
  if (ended) {
    // depois de informar o encerramento uma vez, descarta a sessão
    sessions.delete(id)
  }
  return { active: session.active, messages, ended }
}

// Encerra automaticamente sessões sem atividade do cliente além do limite.
export function sweepTimeouts(): void {
  const now = Date.now()
  for (const session of sessions.values()) {
    if (session.active && now - session.lastClientActivity >= HUMAN_TIMEOUT_MS) {
      endSession(session.id, "timeout")
    }
  }
}

// Varredura periódica também cobre o caso de o cliente fechar a aba.
declare global {
  // eslint-disable-next-line no-var
  var __humanSweep: ReturnType<typeof setInterval> | undefined
}

if (!globalThis.__humanSweep) {
  globalThis.__humanSweep = setInterval(sweepTimeouts, 30000)
}
