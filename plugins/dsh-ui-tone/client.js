/**
 * dsh-ui-tone — 客户端半侧
 *
 * dsh-context 的「上下文」仪表盘用了 Tailwind 调色板 + 发光 + 入场动画，信息量一大就花。
 * 这里不改它一行代码：找到仪表盘根节点，打一个 `dsh-tone-context` 作用域 class，
 * 再用 CSS 覆盖把配色压成灰调、去发光、去重边框、停动画。
 *
 * 想调强弱，改下面 CONFIG 就行；不想要这个效果，把 bundles 里的 dsh-ui-tone 去掉。
 */
window.__ModuleLoader__.load({
  id: 'dsh-ui-tone',
  factory() {
    const CONFIG = {
      killShadows: true, // 去 box-shadow / text-shadow / backdrop-filter（发光的主要来源）
      killAnimations: true, // 停入场动画与循环动画
      dimBorders: true, // 边框统一压到很淡
      mutedPalette: true, // 把 12 个 Tailwind 调色板变量换成低饱和
    }

    const ROOT_CLASS = 'dsh-tone-context'
    const STYLE_ID = 'dsh-ui-tone-style'
    // dsh-context 自己加的 data-* 标记，用来找它的仪表盘
    const ANCHORS = '[data-lc-bars],[data-lc-trend],[data-cat],[data-lc-key]'

    const MUTED = `
      --color-red-500:#b1584f; --color-orange-500:#a97a4c; --color-amber-500:#a89150;
      --color-green-500:#4e8a67; --color-teal-500:#4a8783; --color-blue-500:#4b7aa6;
      --color-indigo-500:#56689f; --color-violet-500:#6a5f9c; --color-purple-500:#755c92;
      --color-pink-500:#9c5f78; --color-slate-400:#79838f; --color-neutral-500:#6a7280;
    `

    function css() {
      const parts = []
      parts.push(`.${ROOT_CLASS}{color-scheme:dark;}`)
      if (CONFIG.mutedPalette) parts.push(`.${ROOT_CLASS}{${MUTED}}`)
      if (CONFIG.killShadows) {
        parts.push(
          `.${ROOT_CLASS} *, .${ROOT_CLASS} *::before, .${ROOT_CLASS} *::after{box-shadow:none!important;text-shadow:none!important;backdrop-filter:none!important}`,
        )
      }
      if (CONFIG.dimBorders) {
        parts.push(`.${ROOT_CLASS} [class*="border"]{border-color:rgba(148,163,184,.14)!important}`)
      }
      if (CONFIG.killAnimations) {
        parts.push(`.${ROOT_CLASS} *, .${ROOT_CLASS} *::before, .${ROOT_CLASS} *::after{animation:none!important}`)
      }
      // 数字/标题别那么亮，压一点对比
      parts.push(`.${ROOT_CLASS}{--tw-shadow:0 0 #0000}`)
      return parts.join('\n')
    }

    function ensureStyle() {
      if (document.getElementById(STYLE_ID)) return
      const el = document.createElement('style')
      el.id = STYLE_ID
      el.textContent = css()
      document.head.appendChild(el)
    }

    // 从 dsh-context 的某个标记往上找仪表盘根：取「最大的、但仍小于整个视口」的祖先，
    // 避免把 class 落到整个应用外壳上（那会把全站阴影都干掉）。
    function acceptable(el) {
      const r = el.getBoundingClientRect()
      if (r.width < 300 || r.height < 160) return false
      const area = r.width * r.height
      const view = window.innerWidth * window.innerHeight
      return area < view * 0.95
    }

    function findRoot() {
      const anchor = document.querySelector(ANCHORS)
      if (!anchor) return null
      let node = anchor
      let best = null
      for (let i = 0; i < 10 && node; i += 1) {
        if (acceptable(node)) best = node
        node = node.parentElement
      }
      return best || anchor.parentElement
    }

    function mark() {
      ensureStyle()
      const root = findRoot()
      if (!root) return
      if (!root.classList.contains(ROOT_CLASS)) root.classList.add(ROOT_CLASS)
    }

    function apply() {
      if (typeof document === 'undefined') return undefined
      let timer = 0
      let observer = null
      const schedule = () => {
        if (timer) return
        timer = setTimeout(() => {
          timer = 0
          try {
            mark()
          } catch (e) {
            console.warn('[ui-tone] 标记失败：', (e && e.message) || e)
          }
        }, 200)
      }
      observer = new MutationObserver(() => {
        if (document.querySelector(ANCHORS)) schedule()
      })
      observer.observe(document.body, { childList: true, subtree: true })
      schedule()
      return () => {
        if (timer) clearTimeout(timer)
        try { observer.disconnect() } catch (e) {}
      }
    }

    return { name: 'dsh-ui-tone-client', apply }
  },
})
