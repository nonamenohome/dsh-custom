/**
 * dsh-qq-persona —— 客户端半侧
 *
 * 在设置面板左侧导航的最下面插一个「QQ 人格」按钮，点开是一个编辑框，
 * 直接改 QQ 机器人（大肥鱼）的人格文件，保存走宿主侧路由 /api/qq-persona。
 *
 * 用的是和 dsh-settings-tidy 一样的做法：不碰官方插件源码，只在面板挂载后整理 DOM。
 */
window.__ModuleLoader__.load({
  id: 'dsh-qq-persona',
  factory() {
    const PANEL = '[data-shortcut-modal="settings"]'
    const NAV_LABELS = ['通用设置', '模型', 'Agent 预设', '账号与余额', '内置插件', '插件列表']
    const BTN_FLAG = 'data-qq-persona-btn'
    const ROUTE = '/api/qq-persona'

    const labelOf = (el) => (el.textContent || '').replace(/\s+/g, ' ').trim()

    function findNav(panel) {
      for (const btn of panel.querySelectorAll('button')) {
        if (NAV_LABELS.includes(labelOf(btn))) return btn.parentElement
      }
      // 兜底：子节点里 button 最多、且不含我们自己的那个容器
      let best = null
      let bestCount = 0
      for (const el of panel.querySelectorAll('div, nav, ul')) {
        const count = Array.from(el.children).filter((c) => c.tagName === 'BUTTON').length
        if (count > bestCount && count >= 3) {
          best = el
          bestCount = count
        }
      }
      return best
    }

    // ── 编辑框 ──────────────────────────────────────────────────────
    let modal = null

    function closeModal() {
      if (modal && modal.parentElement) modal.parentElement.removeChild(modal)
      modal = null
      document.removeEventListener('keydown', onKeydown, true)
    }

    function onKeydown(ev) {
      if (ev.key === 'Escape') {
        ev.stopPropagation()
        closeModal()
      }
    }

    function el(tag, style, text) {
      const node = document.createElement(tag)
      if (style) Object.assign(node.style, style)
      if (text !== undefined) node.textContent = text
      return node
    }

    function openModal() {
      if (modal) return
      modal = el('div', {
        position: 'fixed',
        inset: '0',
        zIndex: '2147483000',
        background: 'rgba(0,0,0,0.42)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        font: '400 14px/1.5 -apple-system, "Segoe UI", system-ui, sans-serif',
      })
      modal.addEventListener('mousedown', (ev) => {
        if (ev.target === modal) closeModal()
      })

      const card = el('div', {
        width: 'min(760px, 92vw)',
        height: 'min(640px, 86vh)',
        background: 'var(--dsh-surface, #ffffff)',
        color: 'var(--dsh-text, #1f2328)',
        borderRadius: '14px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        padding: '18px 20px',
        gap: '12px',
      })
      modal.appendChild(card)

      const head = el('div', { display: 'flex', alignItems: 'center', gap: '10px' })
      head.appendChild(el('div', { fontWeight: '600', fontSize: '16px' }, 'QQ 机器人人格'))
      const pathEl = el('div', { fontSize: '12px', opacity: '0.6', flex: '1', wordBreak: 'break-all' }, '读取中…')
      head.appendChild(pathEl)
      card.appendChild(head)

      const hint = el('div', { fontSize: '12px', opacity: '0.65' },
        '对应 QQ 机器人「大肥鱼」的人格文件。保存后下一条消息就会用新人格，不需要重启。')
      card.appendChild(hint)

      const area = el('textarea', {
        flex: '1',
        width: '100%',
        resize: 'none',
        boxSizing: 'border-box',
        padding: '12px 14px',
        borderRadius: '10px',
        border: '1px solid rgba(128,128,128,0.35)',
        background: 'transparent',
        color: 'inherit',
        font: '400 13px/1.65 ui-monospace, SFMono-Regular, Consolas, monospace',
        outline: 'none',
        opacity: '0.5',
      })
      area.disabled = true
      card.appendChild(area)

      const foot = el('div', { display: 'flex', alignItems: 'center', gap: '10px' })
      const status = el('div', { fontSize: '12px', flex: '1', opacity: '0.7' }, '')
      const btnReload = el('button', { padding: '7px 14px', borderRadius: '8px', cursor: 'pointer' }, '重新载入')
      const btnSave = el('button', { padding: '7px 14px', borderRadius: '8px', cursor: 'pointer' }, '保存')
      const btnClose = el('button', { padding: '7px 14px', borderRadius: '8px', cursor: 'pointer' }, '关闭')
      foot.append(status, btnReload, btnSave, btnClose)
      card.appendChild(foot)

      const say = (text, bad) => {
        status.textContent = text
        status.style.opacity = '1'
        status.style.color = bad ? '#d93025' : ''
      }

      let loaded = ''

      const load = async () => {
        try {
          const res = await fetch(ROUTE, { headers: { accept: 'application/json' } })
          const data = await res.json().catch(() => ({}))
          if (!res.ok) {
            say(`读取失败：HTTP ${res.status}${data.error ? ` · ${data.error}` : ''}`, true)
            return
          }
          pathEl.textContent = data.path || ''
          if (data.missing) {
            loaded = ''
            area.value = ''
            say('文件还不存在，保存一次就会创建', false)
          } else {
            loaded = data.text || ''
            area.value = loaded
            say(`已载入 ${data.bytes ?? loaded.length} 字节`, false)
          }
          area.disabled = false
          area.style.opacity = '1'
        } catch (err) {
          say(`读取失败：${(err && err.message) || err}`, true)
        }
      }

      const save = async () => {
        btnSave.disabled = true
        say('保存中…', false)
        try {
          const res = await fetch(ROUTE, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ text: area.value }),
          })
          const data = await res.json().catch(() => ({}))
          if (!res.ok) {
            say(`保存失败：HTTP ${res.status}${data.error ? ` · ${data.error}` : ''}`, true)
            return
          }
          loaded = area.value
          say(`已保存 ${data.bytes ?? loaded.length} 字节${data.backup ? '（旧版已备份）' : ''}`, false)
        } catch (err) {
          say(`保存失败：${(err && err.message) || err}`, true)
        } finally {
          btnSave.disabled = false
        }
      }

      btnReload.addEventListener('click', load)
      btnSave.addEventListener('click', save)
      btnClose.addEventListener('click', closeModal)
      area.addEventListener('input', () => {
        if (area.value !== loaded) say('有未保存的修改', false)
      })

      document.body.appendChild(modal)
      document.addEventListener('keydown', onKeydown, true)
      void load()
    }

    // ── 往设置导航里插按钮 ───────────────────────────────────────────
    function ensureButton(panel) {
      if (panel.querySelector(`[${BTN_FLAG}]`)) return
      const nav = findNav(panel)
      if (!nav) return
      const sample = Array.from(nav.children).find((c) => c.tagName === 'BUTTON')
      const btn = document.createElement('button')
      if (sample) {
        btn.className = sample.className
        btn.type = 'button'
      }
      btn.setAttribute(BTN_FLAG, '1')
      btn.textContent = 'QQ 人格'
      btn.addEventListener('click', (ev) => {
        ev.preventDefault()
        ev.stopPropagation()
        openModal()
      })
      nav.appendChild(btn)
    }

    function apply() {
      if (typeof document === 'undefined') return undefined

      let timer = 0
      const schedule = () => {
        if (timer) return
        timer = setTimeout(() => {
          timer = 0
          const panel = document.querySelector(PANEL)
          if (!panel) return
          try {
            ensureButton(panel)
          } catch (err) {
            console.warn('[qq-persona] 注入失败：', (err && err.message) || err)
          }
        }, 200)
      }

      const observer = new MutationObserver(() => {
        if (document.querySelector(PANEL)) schedule()
      })
      observer.observe(document.body, { childList: true, subtree: true })
      schedule()

      return () => {
        if (timer) clearTimeout(timer)
        try {
          observer.disconnect()
        } catch {
          /* ignore */
        }
        closeModal()
      }
    }

    return { name: 'dsh-qq-persona-client', apply }
  },
})
