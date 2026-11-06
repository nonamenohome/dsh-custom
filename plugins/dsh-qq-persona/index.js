/**
 * dsh-qq-persona —— 宿主半侧
 *
 * 只做一件事：把 QQ 机器人的人格文件暴露成一个本机 HTTP 路由，
 * 供客户端半侧的「QQ 人格」设置页读写。
 *
 *   GET  /api/qq-persona  → { path, text, mtime, bytes }
 *   POST /api/qq-persona  → { ok, path, bytes, backup }（body: { text })
 *
 * 路径写死在 PERSONA_FILE，不接受前端传入的路径，避免任意文件读写。
 */
import { copyFileSync, existsSync, readFileSync, statSync, writeFileSync } from 'node:fs'

export const name = 'qq-persona'

/** webServer 是本插件唯一的依赖服务 */
export const inject = ['webServer']

/** 人格文件位置 —— 必须和 dsh-qq-bridge 配置里的 bot 工作区一致 */
const PERSONA_FILE = 'D:\\QYD\\dsh-file\\qq-bot\\AGENTS.md'
const ROUTE = '/api/qq-persona'

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  res.end(body)
}

function readBody(req, limit = 512 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let total = 0
    req.on('data', (chunk) => {
      total += chunk.length
      if (total > limit) {
        reject(new Error(`内容过大（上限 ${Math.round(limit / 1024)} KB）`))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

export function apply(ctx) {
  ctx.effect(() =>
    ctx.webServer.register({
      kind: 'exact',
      path: ROUTE,
      handler: async (req, res) => {
        try {
          if (req.method === 'GET') {
            if (!existsSync(PERSONA_FILE)) {
              sendJson(res, 200, { ok: false, path: PERSONA_FILE, text: '', missing: true })
              return
            }
            const text = readFileSync(PERSONA_FILE, 'utf8')
            const stat = statSync(PERSONA_FILE)
            sendJson(res, 200, {
              ok: true,
              path: PERSONA_FILE,
              text,
              bytes: stat.size,
              mtime: stat.mtimeMs,
            })
            return
          }

          if (req.method === 'POST') {
            const raw = await readBody(req)
            let text
            try {
              text = JSON.parse(raw).text
            } catch {
              sendJson(res, 400, { ok: false, error: '请求体不是合法 JSON' })
              return
            }
            if (typeof text !== 'string') {
              sendJson(res, 400, { ok: false, error: '缺少 text 字段' })
              return
            }

            let backup
            if (existsSync(PERSONA_FILE)) {
              const stamp = new Date().toISOString().replace(/[:.]/g, '-')
              backup = `${PERSONA_FILE}.bak-${stamp}`
              copyFileSync(PERSONA_FILE, backup)
            }
            // writeFileSync 用 utf8 写入，不会带 BOM
            writeFileSync(PERSONA_FILE, text, 'utf8')

            const stat = statSync(PERSONA_FILE)
            sendJson(res, 200, { ok: true, path: PERSONA_FILE, bytes: stat.size, backup })
            return
          }

          sendJson(res, 405, { ok: false, error: `不支持的方法 ${req.method}` })
        } catch (err) {
          sendJson(res, 500, { ok: false, error: (err && err.message) || String(err) })
        }
      },
    }),
  )
}
