/**
 * Work notes (工作便签) — Host half.
 *
 * Owns the board document on disk and exposes it to the Web UI through one
 * same-origin JSON endpoint. The board is a single JSON file under the DSH
 * home directory, so notes survive restarts, port changes and upgrades;
 * browser storage on the Client side is only a cache.
 */
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const ROUTE_PATH = '/api/work-notes'
const STORE_NAME = 'work-notes.json'
const VERSION = 1
const COLORS = ['yellow', 'green', 'blue', 'pink', 'purple', 'gray']
const MAX_NOTES = 1000
const MAX_TEXT = 2000
const MAX_TOMBSTONES = 400
const MAX_BODY_BYTES = 2 * 1024 * 1024

function dshHome() {
  const fromEnv = process.env.DSH_HOME
  if (typeof fromEnv === 'string' && fromEnv.trim()) return fromEnv.trim()
  return join(homedir(), '.dsh')
}

function storePath() {
  return join(dshHome(), STORE_NAME)
}

function emptyDoc() {
  return { version: VERSION, rev: 0, notes: [], tombstones: [] }
}

function normalizeNote(raw) {
  if (!raw || typeof raw !== 'object') return undefined
  const id = typeof raw.id === 'string' ? raw.id.trim().slice(0, 64) : ''
  const body = typeof raw.text === 'string' ? raw.text.slice(0, MAX_TEXT) : ''
  if (!id || !body.trim()) return undefined
  const created = Number(raw.createdAt)
  const updated = Number(raw.updatedAt)
  const doneAt = Number(raw.doneAt)
  const note = {
    id,
    text: body,
    done: raw.done === true,
    pinned: raw.pinned === true,
    color: COLORS.includes(raw.color) ? raw.color : 'yellow',
    createdAt: Number.isFinite(created) ? created : Date.now(),
    updatedAt: Number.isFinite(updated) ? updated : Date.now(),
  }
  if (note.done && Number.isFinite(doneAt)) note.doneAt = doneAt
  return note
}

function normalizeDoc(raw) {
  const doc = emptyDoc()
  if (!raw || typeof raw !== 'object') return doc
  if (Array.isArray(raw.notes)) {
    const seen = new Set()
    for (const item of raw.notes) {
      const note = normalizeNote(item)
      if (!note || seen.has(note.id)) continue
      seen.add(note.id)
      doc.notes.push(note)
      if (doc.notes.length >= MAX_NOTES) break
    }
  }
  if (Array.isArray(raw.tombstones)) {
    const seen = new Set()
    for (const item of raw.tombstones) {
      if (!item || typeof item.id !== 'string') continue
      const id = item.id.trim().slice(0, 64)
      const at = Number(item.at)
      if (!id || !Number.isFinite(at) || seen.has(id)) continue
      seen.add(id)
      doc.tombstones.push({ id, at })
    }
    doc.tombstones = doc.tombstones.slice(-MAX_TOMBSTONES)
  }
  const rev = Number(raw.rev)
  doc.rev = Number.isFinite(rev) && rev >= 0 ? Math.floor(rev) : 0
  return doc
}

function loadDoc() {
  try {
    return normalizeDoc(JSON.parse(readFileSync(storePath(), 'utf8')))
  } catch {
    return emptyDoc()
  }
}

function saveDoc(doc) {
  const next = normalizeDoc(doc)
  // Keep the revision monotonic even when a stale Client writes an older rev.
  next.rev = Math.max(loadDoc().rev, next.rev) + 1
  const target = storePath()
  const temp = target + '.tmp'
  mkdirSync(dshHome(), { recursive: true })
  writeFileSync(temp, JSON.stringify(next, null, 2) + '\n', 'utf8')
  renameSync(temp, target)
  return next
}

function sendJson(res, status, body) {
  const text = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(text),
  })
  res.end(text)
}

function sameOrigin(req) {
  const origin = req.headers.origin
  const host = req.headers.host
  if (!origin || !host) return true
  try {
    return new URL(origin).host.toLowerCase() === String(host).split('/')[0].toLowerCase()
  } catch {
    return false
  }
}

async function readBody(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_BODY_BYTES) throw new Error('请求体过大')
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

async function handle(req, res) {
  const method = (req.method || 'GET').toUpperCase()
  if (method === 'GET' || method === 'HEAD') {
    sendJson(res, 200, { ok: true, doc: loadDoc() })
    return
  }
  if (method === 'PUT' || method === 'POST') {
    if (!sameOrigin(req)) {
      sendJson(res, 403, { ok: false, error: 'cross-origin request rejected' })
      return
    }
    try {
      const parsed = JSON.parse(await readBody(req))
      const saved = saveDoc(normalizeDoc(parsed && parsed.doc))
      sendJson(res, 200, { ok: true, doc: saved })
    } catch (error) {
      sendJson(res, 400, { ok: false, error: String((error && error.message) || error) })
    }
    return
  }
  sendJson(res, 405, { ok: false, error: 'method not allowed' })
}

/** Register the board endpoint for the Web UI. */
export function apply(ctx) {
  let server
  try {
    server = typeof ctx.get === 'function' ? ctx.get('webServer') : ctx.webServer
  } catch {
    server = undefined
  }
  if (!server || typeof server.register !== 'function') return
  const route = { kind: 'exact', path: ROUTE_PATH, handler: handle }
  if (typeof ctx.effect === 'function') ctx.effect(() => server.register(route))
  else server.register(route)
}
