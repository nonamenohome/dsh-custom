/**
 * dsh-pet-switch — 客户端半侧
 *
 * 在「设置」里加一个分区：桌宠开关。
 * 勾选哪些桌宠插件参与启动，保存后写回 profile 的 dsh.profile.bundles（改动下次启动生效）。
 * 数据接口由宿主半侧挂在 DSH 自己的 webServer 上（同源，走页面会话）：
 *   GET  /api/pet-switch/state
 *   POST /api/pet-switch/apply   { enabled: string[] }
 */
window.__ModuleLoader__.load({
  id: 'dsh-pet-switch',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useCallback, useEffect, useState } = React

    const STATE_URL = '/api/pet-switch/state'
    const APPLY_URL = '/api/pet-switch/apply'

    const S = {
      wrap: { display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 2px 8px' },
      hint: { fontSize: 12.5, lineHeight: 1.6, opacity: 0.72, margin: 0 },
      card: { border: '1px solid rgba(127,149,178,.28)', borderRadius: 10, overflow: 'hidden' },
      row: { display: 'flex', gap: 12, padding: '12px 14px', alignItems: 'flex-start', borderTop: '1px solid rgba(127,149,178,.18)' },
      rowFirst: { borderTop: 0 },
      meta: { display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 },
      name: { fontWeight: 600, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 8 },
      pkg: { fontFamily: 'ui-monospace, Consolas, monospace', fontSize: 11.5, opacity: 0.6 },
      desc: { fontSize: 12, lineHeight: 1.55, opacity: 0.66 },
      tagOn: { fontSize: 11, padding: '1px 7px', borderRadius: 999, border: '1px solid rgba(63,185,80,.5)', color: '#3fb950' },
      tagOff: { fontSize: 11, padding: '1px 7px', borderRadius: 999, border: '1px solid rgba(127,149,178,.35)', opacity: 0.65 },
      bar: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
      btn: { padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(77,158,247,.55)', background: 'rgba(77,158,247,.15)', color: 'inherit', fontSize: 13, cursor: 'pointer' },
      btnOff: { opacity: 0.5, cursor: 'default' },
      ok: { fontSize: 12.5, color: '#3fb950' },
      bad: { fontSize: 12.5, color: '#f85149' },
      muted: { fontSize: 12, opacity: 0.6 },
    }

    // 宿主把非 JSON（例如纯文本 404 "not found"）直接回给页面时，别让 JSON.parse 的
    // "Unexpected token" 成为用户看到的报错——转成一句能看懂的话。
    async function readJson(res) {
      const text = await res.text()
      try {
        return JSON.parse(text)
      } catch {
        const snippet = text.trim().slice(0, 80) || '（空响应）'
        throw new Error(`接口 ${res.url} 返回 HTTP ${res.status}：${snippet}`)
      }
    }

    function Section() {
      const [state, setState] = useState(null)
      const [sel, setSel] = useState([])
      const [busy, setBusy] = useState(false)
      const [msg, setMsg] = useState('')
      const [err, setErr] = useState('')

      const load = useCallback(async () => {
        setErr('')
        try {
          const json = await readJson(await fetch(STATE_URL, { cache: 'no-store' }))
          if (!json.ok) throw new Error(json.error || '读取失败')
          setState(json)
          setSel(json.pets.filter((p) => p.enabled).map((p) => p.id))
        } catch (e) {
          setErr(String((e && e.message) || e))
        }
      }, [])

      useEffect(() => {
        load()
      }, [load])

      const isOn = (id) => sel.indexOf(id) >= 0
      const toggle = (id) => {
        setMsg('')
        setSel((prev) => (prev.indexOf(id) >= 0 ? prev.filter((x) => x !== id) : prev.concat([id])))
      }

      const save = async () => {
        setBusy(true)
        setMsg('')
        setErr('')
        try {
          const json = await readJson(await fetch(APPLY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled: sel }),
          }))
          if (!json.ok) throw new Error(json.error || '写入失败')
          setMsg('已写入 ' + json.profile + ' profile。完全退出 DSH（含托盘）再重开，改动才生效。')
          await load()
        } catch (e) {
          setErr(String((e && e.message) || e))
        } finally {
          setBusy(false)
        }
      }

      if (!state && !err) return h('p', { style: S.hint }, '正在读取桌宠状态…')
      if (err && !state) return h('p', { style: S.bad }, '读取失败：' + err)

      const pets = (state && state.pets) || []
      const others = (state && state.others) || []

      return h(
        'div',
        { style: S.wrap },
        h('p', { style: S.hint }, '勾选要参与启动的桌宠。改的是 ' + ((state && state.profile) || 'desktop') + ' profile 的 dsh.profile.bundles，其它插件不动；每次写入前会备份原文件。'),
        h(
          'div',
          { style: S.card },
          pets.map((p, i) =>
            h(
              'label',
              { key: p.id, style: i === 0 ? Object.assign({}, S.row, S.rowFirst) : S.row },
              h('input', {
                type: 'checkbox',
                checked: isOn(p.id),
                onChange: () => toggle(p.id),
                style: { width: 16, height: 16, marginTop: 3, accentColor: '#4d9ef7', cursor: 'pointer' },
              }),
              h(
                'span',
                { style: S.meta },
                h(
                  'span',
                  { style: S.name },
                  p.name,
                  h('span', { style: isOn(p.id) ? S.tagOn : S.tagOff }, isOn(p.id) ? '启用' : '停用'),
                ),
                h('span', { style: S.pkg }, p.pkg),
                h('span', { style: S.desc }, p.desc),
              ),
            ),
          ),
        ),
        h(
          'div',
          { style: S.bar },
          h('button', { type: 'button', onClick: save, disabled: busy, style: busy ? Object.assign({}, S.btn, S.btnOff) : S.btn }, busy ? '写入中…' : '保存并应用'),
          h('button', { type: 'button', onClick: load, disabled: busy, style: Object.assign({}, S.btn, { background: 'transparent' }) }, '重新读取'),
          msg ? h('span', { style: S.ok }, msg) : null,
          err ? h('span', { style: S.bad }, err) : null,
        ),
        others.length ? h('p', { style: S.muted }, '保持不动的条目：' + others.join('、')) : null,
        h('p', { style: S.hint }, '插件在启动时装载，所以这里保存后必须重启 DSH 才生效。'),
      )
    }

    function apply(ctx) {
      if (!ctx || !ctx.slots || typeof ctx.slots.inject !== 'function') return
      ctx.slots.inject('settings.section', () =>
        ctx.slots.register(
          {
            name: 'settings.section',
            id: 'pet-switch',
            order: 31,
            label: () => '桌宠开关',
          },
          Section,
        ),
      )
    }

    return {
      name: 'dsh-pet-switch-client',
      inject: ['slots'],
      apply,
    }
  },
})
