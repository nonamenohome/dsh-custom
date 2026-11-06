/**
 * dsh-settings-tidy — 客户端半侧
 *
 * 设置面板左侧导航是官方壳按 `{id, order, label}` 拍的扁平列表（壳在 app.asar 里，
 * 改不了），所以这里不去碰任何插件源码，只在面板挂载后整理 DOM：
 *
 *   1. HIDE  里的分区直接隐藏 —— 这些功能在别处（侧边栏 / 通用设置里的小项）已有入口；
 *   2. ORDER 里的分区按这个顺序重排 —— 同类的排在一起；
 *   3. 没列到的分区保持原相对顺序，补在最后。
 *
 * 想改隐藏项或顺序，直接改下面两个数组，刷新页面即可。
 */
window.__ModuleLoader__.load({
  id: 'dsh-settings-tidy',
  factory() {
    // 在别处已有入口 → 从设置栏里去掉：
    // 插件市场 / 皮肤 / 侧面卡片 / 快照 都有侧边栏入口；费用在「通用设置」里有一项
    const HIDE = ['插件市场', '皮肤', '侧面卡片', '快照', '费用']

    // 期望的先后顺序（没列到的排最后，保持原本相对顺序）
    const ORDER = [
      '账号与余额',
      '通用设置',
      '模型',
      'Agent 预设',
      '内置插件',
      '桌宠配置',
      '桌宠开关',
      '开机动画',
      '鲸忆',
    ]

    const PANEL = '[data-shortcut-modal="settings"]'
    const labelOf = (el) => (el.textContent || '').replace(/\s+/g, ' ').trim()

    function findNav(panel) {
      const wanted = new Set([...ORDER, ...HIDE])
      for (const btn of panel.querySelectorAll('button')) {
        if (wanted.has(labelOf(btn))) return btn.parentElement
      }
      return null
    }

    function tidyOnce(panel) {
      const nav = findNav(panel)
      if (!nav) return
      const buttons = Array.from(nav.children).filter((el) => el.tagName === 'BUTTON')
      if (buttons.length < 3) return

      for (const btn of buttons) {
        const hide = HIDE.includes(labelOf(btn))
        if (btn.style.display !== (hide ? 'none' : '')) btn.style.display = hide ? 'none' : ''
        btn.dataset.settingsTidy = hide ? 'hidden' : 'kept'
      }

      const rank = (btn) => {
        const i = ORDER.indexOf(labelOf(btn))
        return i < 0 ? ORDER.length + 100 : i
      }
      const sorted = buttons
        .map((btn, i) => ({ btn, i }))
        .sort((a, b) => rank(a.btn) - rank(b.btn) || a.i - b.i)
        .map((x) => x.btn)

      if (sorted.every((btn, i) => btn === buttons[i])) return
      for (const btn of sorted) nav.appendChild(btn)
    }

    function apply() {
      if (typeof document === 'undefined') return undefined

      let timer = 0
      let observer = null

      const run = () => {
        const panel = document.querySelector(PANEL)
        if (!panel) return
        // 自己的挪动会再次触发 observer，先断开再说
        if (observer) observer.disconnect()
        try {
          tidyOnce(panel)
        } catch (e) {
          console.warn('[settings-tidy] 整理失败：', (e && e.message) || e)
        } finally {
          if (observer) observer.observe(document.body, { childList: true, subtree: true })
        }
      }

      const schedule = () => {
        if (timer) return
        timer = setTimeout(() => {
          timer = 0
          run()
        }, 150)
      }

      observer = new MutationObserver(() => {
        // 面板没开时几乎零成本：只在有面板时排一次整理
        if (document.querySelector(PANEL)) schedule()
      })
      observer.observe(document.body, { childList: true, subtree: true })

      // 打开页面时面板可能已经挂着
      schedule()

      return () => {
        if (timer) clearTimeout(timer)
        try { observer.disconnect() } catch (e) {}
      }
    }

    return {
      name: 'dsh-settings-tidy-client',
      apply,
    }
  },
})
