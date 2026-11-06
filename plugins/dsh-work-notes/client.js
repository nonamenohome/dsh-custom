/**
 * Work notes (工作便签) — Client half.
 *
 * A right-edge sticky-note board for the desktop Web UI. Notes are loaded from
 * and saved to the Host endpoint (/api/work-notes), with a browser-storage
 * mirror so a failed sync never loses what was typed.
 */
window.__ModuleLoader__.load({
  id: 'dsh-work-notes',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useEffect, useMemo, useRef, useState } = React

    const API = '/api/work-notes'
    const LS_DOC = 'dsh-work-notes:doc:v1'
    const LS_OPEN = 'dsh-work-notes:open'
    const STYLE_ID = 'dsh-work-notes:styles'
    const COLORS = ['yellow', 'green', 'blue', 'pink', 'purple', 'gray']
    const TINTS = {
      yellow: '#f0b429',
      green: '#3fa76b',
      blue: '#3f8ee0',
      pink: '#e05a8a',
      purple: '#8b6ef0',
      gray: '#8a93a3',
    }
    const MAX_TEXT = 2000
    const MAX_TOMBSTONES = 400

    // ---------------------------------------------------------------- i18n

    const DICT = {
      zh: {
        title: '工作便签',
        sidebar: '便签',
        add: '添加',
        addPlaceholder: '记一笔工作，Enter 添加…',
        addHint: 'Enter 添加 · Shift+Enter 换行',
        filterOpen: '待办',
        filterAll: '全部',
        filterDone: '完成',
        search: '搜索便签',
        searchToggle: '搜索',
        clear: '清除',
        emptyAll: '还没有便签',
        emptyAllHint: '工作想法、待跟进的事，随手贴在这里',
        emptyOpen: '待办清空了',
        emptyOpenHint: '有新任务就在这里记一条',
        emptyDone: '还没有完成的便签',
        emptyDoneHint: '勾掉一条，它会归档到这里',
        emptySearch: '没有匹配的便签',
        emptySearchHint: '换个关键词试试',
        pin: '置顶',
        unpin: '取消置顶',
        color: '换个颜色',
        edit: '编辑',
        editTitle: '双击编辑',
        delete: '删除',
        close: '关闭便签板',
        saved: '已保存',
        saving: '保存中…',
        loading: '读取中…',
        offline: '未同步 · 已存本机',
        error: '未同步',
        copyOpen: '复制待办',
        copied: '已复制',
        copyEmpty: '没有待办',
        copyFail: '复制失败',
        undoOne: '已删除 1 条便签',
        undoMany: '已删除 {n} 条便签',
        undo: '撤销',
        clearDone: '清理已完成',
        clearDoneConfirm: '确认清理？',
        doneCount: '{n} 条已完成',
        editHint: 'Enter 保存 · Esc 取消',
        doneBadge: '已完成',
        pinnedBadge: '置顶',
        countsZero: '还没有便签',
        countsOpen: '{open} 条待办 · 共 {total} 条',
        markDone: '标记完成',
        markUndone: '标记未完成',
        colorYellow: '黄色',
        colorGreen: '绿色',
        colorBlue: '蓝色',
        colorPink: '粉色',
        colorPurple: '紫色',
        colorGray: '灰色',
        shortcutHint: 'Ctrl+Alt+N 随时开关',
      },
      en: {
        title: 'Work Notes',
        sidebar: 'Notes',
        add: 'Add',
        addPlaceholder: 'Capture a work note, Enter to add…',
        addHint: 'Enter adds · Shift+Enter new line',
        filterOpen: 'Open',
        filterAll: 'All',
        filterDone: 'Done',
        search: 'Search notes',
        searchToggle: 'Search',
        clear: 'Clear',
        emptyAll: 'No notes yet',
        emptyAllHint: 'Ideas and follow-ups, one note at a time',
        emptyOpen: 'Inbox zero',
        emptyOpenHint: 'Add the next piece of work here',
        emptyDone: 'Nothing completed yet',
        emptyDoneHint: 'Tick a note and it lands here',
        emptySearch: 'No matching notes',
        emptySearchHint: 'Try a different keyword',
        pin: 'Pin',
        unpin: 'Unpin',
        color: 'Change color',
        edit: 'Edit',
        editTitle: 'Double-click to edit',
        delete: 'Delete',
        close: 'Close notes',
        saved: 'Saved',
        saving: 'Saving…',
        loading: 'Loading…',
        offline: 'Offline · kept locally',
        error: 'Not synced',
        copyOpen: 'Copy open',
        copied: 'Copied',
        copyEmpty: 'No open notes',
        copyFail: 'Copy failed',
        undoOne: 'Deleted 1 note',
        undoMany: 'Deleted {n} notes',
        undo: 'Undo',
        clearDone: 'Clear completed',
        clearDoneConfirm: 'Confirm clear?',
        doneCount: '{n} completed',
        editHint: 'Enter saves · Esc cancels',
        doneBadge: 'Done',
        pinnedBadge: 'Pinned',
        countsZero: 'No notes yet',
        countsOpen: '{open} open · {total} total',
        markDone: 'Mark done',
        markUndone: 'Mark open',
        colorYellow: 'Yellow',
        colorGreen: 'Green',
        colorBlue: 'Blue',
        colorPink: 'Pink',
        colorPurple: 'Purple',
        colorGray: 'Gray',
        shortcutHint: 'Ctrl+Alt+N toggles the board',
      },
    }

    let lang = 'zh'
    const langListeners = new Set()
    let langRevision = 0

    function langFromLocale(tag) {
      return typeof tag === 'string' && /^en/i.test(tag) ? 'en' : 'zh'
    }

    function setLang(next) {
      if (next !== 'en' && next !== 'zh') next = 'zh'
      if (next === lang) return
      lang = next
      langRevision += 1
      langListeners.forEach((fn) => {
        try {
          fn()
        } catch {
          /* a stale subscriber must not break the switch */
        }
      })
    }

    function useLang() {
      const [revision, setRevision] = useState(langRevision)
      useEffect(() => {
        const fn = () => setRevision(langRevision)
        langListeners.add(fn)
        return () => {
          langListeners.delete(fn)
        }
      }, [])
      return revision
    }

    function tr(key, vars) {
      const dict = DICT[lang] || DICT.zh
      let text = dict[key]
      if (text === undefined) text = DICT.zh[key]
      if (text === undefined) text = key
      if (vars) {
        Object.keys(vars).forEach((name) => {
          text = text.split('{' + name + '}').join(String(vars[name]))
        })
      }
      return text
    }

    function colorName(color) {
      const key = 'color' + color.charAt(0).toUpperCase() + color.slice(1)
      return tr(key)
    }

    // ------------------------------------------------------------ panel store

    let panelOpenState = readPanelOpenFromStorage()
    const panelListeners = new Set()

    function readPanelOpenFromStorage() {
      try {
        return window.localStorage.getItem(LS_OPEN) === '1'
      } catch {
        return false
      }
    }

    function isPanelOpen() {
      return panelOpenState
    }

    function setPanelOpen(next) {
      const value = next === true
      if (value === panelOpenState) return
      panelOpenState = value
      try {
        window.localStorage.setItem(LS_OPEN, value ? '1' : '0')
      } catch {
        /* private mode: the board still works for this page */
      }
      panelListeners.forEach((fn) => {
        try {
          fn()
        } catch {
          /* ignore */
        }
      })
    }

    function usePanelOpen() {
      const [open, setOpen] = useState(isPanelOpen)
      useEffect(() => {
        const fn = () => setOpen(isPanelOpen())
        panelListeners.add(fn)
        return () => {
          panelListeners.delete(fn)
        }
      }, [])
      return open
    }

    // ------------------------------------------------------------- data model

    function emptyDoc() {
      return { version: 1, rev: 0, notes: [], tombstones: [] }
    }

    function normalizeNote(raw) {
      if (!raw || typeof raw !== 'object') return undefined
      const id = typeof raw.id === 'string' ? raw.id.trim().slice(0, 64) : ''
      const text = typeof raw.text === 'string' ? raw.text.slice(0, MAX_TEXT) : ''
      if (!id || !text.trim()) return undefined
      const created = Number(raw.createdAt)
      const updated = Number(raw.updatedAt)
      const doneAt = Number(raw.doneAt)
      const note = {
        id,
        text,
        done: raw.done === true,
        pinned: raw.pinned === true,
        color: COLORS.indexOf(raw.color) >= 0 ? raw.color : 'yellow',
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
        for (let i = 0; i < raw.notes.length; i += 1) {
          const note = normalizeNote(raw.notes[i])
          if (!note || seen.has(note.id)) continue
          seen.add(note.id)
          doc.notes.push(note)
        }
      }
      if (Array.isArray(raw.tombstones)) {
        const seen = new Set()
        for (let i = 0; i < raw.tombstones.length; i += 1) {
          const item = raw.tombstones[i]
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

    function mergeDocs(first, second) {
      const notes = new Map()
      const tombs = new Map()
      const eat = (doc) => {
        if (!doc) return
        doc.notes.forEach((note) => {
          const current = notes.get(note.id)
          if (!current || note.updatedAt >= current.updatedAt) notes.set(note.id, note)
        })
        doc.tombstones.forEach((item) => {
          const current = tombs.get(item.id)
          if (current === undefined || item.at > current) tombs.set(item.id, item.at)
        })
      }
      eat(first)
      eat(second)
      const list = []
      notes.forEach((note, id) => {
        const deadAt = tombs.get(id)
        if (deadAt !== undefined && deadAt >= note.updatedAt) return
        list.push(note)
      })
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
      const tombstones = []
      tombs.forEach((at, id) => {
        if (at >= cutoff) tombstones.push({ id, at })
      })
      tombstones.sort((a, b) => a.at - b.at)
      return {
        version: 1,
        rev: Math.max(first ? first.rev : 0, second ? second.rev : 0),
        notes: list,
        tombstones: tombstones.slice(-MAX_TOMBSTONES),
      }
    }

    function docEquals(a, b) {
      if (!a || !b) return false
      if (a.notes.length !== b.notes.length) return false
      if (a.tombstones.length !== b.tombstones.length) return false
      const known = new Map()
      b.notes.forEach((note) => known.set(note.id, note.updatedAt))
      for (let i = 0; i < a.notes.length; i += 1) {
        const note = a.notes[i]
        if (known.get(note.id) !== note.updatedAt) return false
      }
      return true
    }

    function loadLocalDoc() {
      try {
        const raw = window.localStorage.getItem(LS_DOC)
        if (!raw) return null
        return normalizeDoc(JSON.parse(raw))
      } catch {
        return null
      }
    }

    function saveLocalDoc(doc) {
      try {
        window.localStorage.setItem(LS_DOC, JSON.stringify(doc))
      } catch {
        /* quota or private mode: the Host file remains authoritative */
      }
    }

    function newId() {
      return 'n_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8)
    }

    function nextColor(notes) {
      return COLORS[notes.length % COLORS.length]
    }

    async function apiGet() {
      const res = await fetch(API, { cache: 'no-store' })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const data = await res.json()
      if (!data || data.ok !== true) throw new Error((data && data.error) || 'bad response')
      return normalizeDoc(data.doc)
    }

    async function apiPut(doc) {
      const res = await fetch(API, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ doc }),
      })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const data = await res.json()
      if (!data || data.ok !== true) throw new Error((data && data.error) || 'bad response')
      return normalizeDoc(data.doc)
    }

    // --------------------------------------------------------------- helpers

    function autoGrow(el) {
      if (!el) return
      el.style.height = 'auto'
      const limit = 120
      const next = Math.min(el.scrollHeight, limit)
      el.style.height = next + 'px'
      el.style.overflowY = el.scrollHeight > limit ? 'auto' : 'hidden'
    }

    function whenText(ts) {
      if (!Number.isFinite(ts)) return ''
      const now = Date.now()
      const diff = now - ts
      if (diff < 45 * 1000) return lang === 'zh' ? '刚刚' : 'just now'
      if (diff < 60 * 60 * 1000) {
        const minutes = Math.max(1, Math.round(diff / 60000))
        return lang === 'zh' ? minutes + ' 分钟前' : minutes + ' min ago'
      }
      if (diff < 24 * 60 * 60 * 1000) {
        const hours = Math.max(1, Math.round(diff / 3600000))
        return lang === 'zh' ? hours + ' 小时前' : hours + ' hr ago'
      }
      const date = new Date(ts)
      const sameYear = date.getFullYear() === new Date(now).getFullYear()
      if (lang === 'zh') {
        return sameYear
          ? date.getMonth() + 1 + '月' + date.getDate() + '日'
          : date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日'
      }
      const stamp = date.getMonth() + 1 + '/' + date.getDate()
      return sameYear ? stamp : date.getFullYear() + '/' + stamp
    }

    // ---------------------------------------------------------------- glyphs

    function NoteGlyph(props) {
      const size = props.size || 18
      return h('svg', {
        viewBox: '0 0 24 24', width: size, height: size, fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': 'true',
      },
        h('path', { d: 'M6.5 3.75h9L21 9.25V19.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 5 19.5V5.25a1.5 1.5 0 0 1 1.5-1.5Z' }),
        h('path', { d: 'M15.25 3.9v5.6h5.5' }),
        h('path', { d: 'M8.5 13h7M8.5 16.5h4.5' })
      )
    }

    function CloseGlyph(props) {
      const size = props.size || 16
      return h('svg', {
        viewBox: '0 0 24 24', width: size, height: size, fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', 'aria-hidden': 'true',
      }, h('path', { d: 'M6 6l12 12M18 6 6 18' }))
    }

    function PlusGlyph(props) {
      const size = props.size || 14
      return h('svg', {
        viewBox: '0 0 24 24', width: size, height: size, fill: 'none',
        stroke: 'currentColor', strokeWidth: 2.1, strokeLinecap: 'round', 'aria-hidden': 'true',
      }, h('path', { d: 'M12 5v14M5 12h14' }))
    }

    function CheckGlyph(props) {
      const size = props.size || 11
      return h('svg', {
        viewBox: '0 0 24 24', width: size, height: size, fill: 'none',
        stroke: 'currentColor', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': 'true',
      }, h('path', { d: 'M5 12.5 10 17.5 19.5 7' }))
    }

    function PinGlyph(props) {
      const size = props.size || 14
      return h('svg', {
        viewBox: '0 0 24 24', width: size, height: size, fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': 'true',
      },
        h('path', { d: 'M9 4h6' }),
        h('path', { d: 'M12 4v5' }),
        h('path', { d: 'M6.5 9h11l-1.6 4.5h-7.8L6.5 9Z' }),
        h('path', { d: 'M12 13.5V20' })
      )
    }

    function PencilGlyph(props) {
      const size = props.size || 14
      return h('svg', {
        viewBox: '0 0 24 24', width: size, height: size, fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': 'true',
      },
        h('path', { d: 'M4.5 19.5 5.6 15 15.7 4.9a2 2 0 0 1 2.8 0l.6.6a2 2 0 0 1 0 2.8L9 18.4Z' }),
        h('path', { d: 'M14.4 6.2l3.4 3.4' })
      )
    }

    function TrashGlyph(props) {
      const size = props.size || 14
      return h('svg', {
        viewBox: '0 0 24 24', width: size, height: size, fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': 'true',
      },
        h('path', { d: 'M5 7h14' }),
        h('path', { d: 'M10 7V5.2h4V7' }),
        h('path', { d: 'M6.8 7l.9 12.1a1.5 1.5 0 0 0 1.5 1.4h5.6a1.5 1.5 0 0 0 1.5-1.4L17.2 7' }),
        h('path', { d: 'M10.4 11v6M13.6 11v6' })
      )
    }

    function SearchGlyph(props) {
      const size = props.size || 15
      return h('svg', {
        viewBox: '0 0 24 24', width: size, height: size, fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', 'aria-hidden': 'true',
      },
        h('circle', { cx: 11, cy: 11, r: 6.2 }),
        h('path', { d: 'M15.6 15.6 20 20' })
      )
    }

    function CopyGlyph(props) {
      const size = props.size || 12
      return h('svg', {
        viewBox: '0 0 24 24', width: size, height: size, fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': 'true',
      },
        h('rect', { x: 9, y: 9, width: 11, height: 11, rx: 2.2 }),
        h('path', { d: 'M15 5.5A2.5 2.5 0 0 0 12.5 3H6.5A2.5 2.5 0 0 0 4 5.5v6A2.5 2.5 0 0 0 6.5 14' })
      )
    }

    // ---------------------------------------------------------------- styles

    const CSS = `
.dshwn-panel{position:fixed;right:0;bottom:0;z-index:9000;display:flex;flex-direction:column;
  box-sizing:border-box;pointer-events:auto;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);
  border-left:1px solid var(--dsw-alias-border-l1);border-top-left-radius:14px;
  box-shadow:-20px 0 48px -28px rgba(0,0,0,.5);font-family:inherit;font-size:14px;line-height:1.45;
  animation:dshwn-slide .18s ease-out both}
@keyframes dshwn-slide{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.dshwn-panel{animation:none}}
.dshwn-panel *{box-sizing:border-box}
.dshwn-head{display:flex;align-items:flex-start;gap:10px;padding:14px 10px 10px 16px}
.dshwn-glyph{flex:0 0 auto;display:flex;width:32px;height:32px;align-items:center;justify-content:center;
  border-radius:9px;background:color-mix(in srgb, #f0b429 16%, var(--dsw-alias-bg-layer-2));color:#d99a12}
.dshwn-headtext{flex:1 1 auto;min-width:0}
.dshwn-title{font-size:15px;font-weight:650;letter-spacing:.01em;line-height:20px}
.dshwn-sub{margin-top:1px;font-size:11.5px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
.dshwn-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;padding:0;
  border:none;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;
  transition:background .12s,color .12s;flex:0 0 auto}
.dshwn-icon-btn:hover{background:color-mix(in srgb, var(--dsw-alias-label-primary) 8%, transparent);color:var(--dsw-alias-label-primary)}
.dshwn-icon-btn[data-active="true"]{background:color-mix(in srgb, var(--dsw-alias-brand-primary) 14%, transparent);color:var(--dsw-alias-brand-primary)}
.dshwn-icon-btn[data-danger="true"]:hover{background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 14%, transparent);color:var(--dsw-alias-state-error-primary)}
.dshwn-icon-btn:focus-visible,.dshwn-chip:focus-visible,.dshwn-add:focus-visible,.dshwn-foot-btn:focus-visible,
.dshwn-text-btn:focus-visible,.dshwn-check:focus-visible,.dshwn-swatch:focus-visible,.dshwn-side:focus-visible{
  outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.dshwn-close{margin-top:2px}
.dshwn-composer{display:flex;align-items:flex-end;gap:8px;margin:0 14px 10px;padding:7px 7px 7px 10px;
  border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-layer-2);
  transition:border-color .12s,box-shadow .12s}
.dshwn-composer:focus-within{border-color:color-mix(in srgb, var(--dsw-alias-brand-primary) 55%, var(--dsw-alias-border-l1));
  box-shadow:0 0 0 3px color-mix(in srgb, var(--dsw-alias-brand-primary) 13%, transparent)}
.dshwn-input{flex:1 1 auto;min-width:0;border:none;background:transparent;color:inherit;font:inherit;font-size:13.5px;
  line-height:19px;resize:none;outline:none;padding:3px 0;max-height:112px;overflow:hidden}
.dshwn-input::placeholder{color:var(--dsw-alias-label-secondary);opacity:.85}
.dshwn-add{display:inline-flex;align-items:center;gap:4px;height:27px;padding:0 9px;border:none;border-radius:8px;
  background:var(--dsw-alias-brand-primary);color:#fff;font:inherit;font-size:12.5px;font-weight:600;cursor:pointer;
  transition:opacity .12s;flex:0 0 auto}
.dshwn-add:disabled{opacity:.35;cursor:default}
.dshwn-toolbar{display:flex;align-items:center;gap:8px;padding:0 12px 8px 14px}
.dshwn-chips{display:flex;align-items:center;gap:2px;padding:2px;border-radius:9px;
  background:color-mix(in srgb, var(--dsw-alias-label-primary) 6%, transparent)}
.dshwn-chip{display:inline-flex;align-items:center;gap:5px;height:23px;padding:0 8px;border:none;border-radius:7px;
  background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12.5px;cursor:pointer;
  transition:background .12s,color .12s}
.dshwn-chip:hover{color:var(--dsw-alias-label-primary)}
.dshwn-chip[data-active="true"]{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);
  font-weight:600;box-shadow:0 1px 2px rgba(0,0,0,.10)}
.dshwn-chip-count{font-size:10.5px;font-variant-numeric:tabular-nums;opacity:.85}
.dshwn-search{display:flex;align-items:center;gap:6px;margin:0 14px 8px;padding:0 6px 0 9px;height:31px;
  border:1px solid var(--dsw-alias-border-l1);border-radius:9px;background:var(--dsw-alias-bg-layer-2);
  color:var(--dsw-alias-label-secondary)}
.dshwn-search:focus-within{border-color:color-mix(in srgb, var(--dsw-alias-brand-primary) 50%, var(--dsw-alias-border-l1))}
.dshwn-search input{flex:1 1 auto;min-width:0;border:none;background:transparent;color:var(--dsw-alias-label-primary);
  font:inherit;font-size:13px;outline:none;padding:0}
.dshwn-search-clear{width:22px;height:22px}
.dshwn-listbar{display:flex;align-items:center;gap:8px;margin:0 14px 6px;font-size:11.5px;
  color:var(--dsw-alias-label-secondary)}
.dshwn-text-btn{margin-left:auto;padding:0 2px;border:none;background:transparent;color:var(--dsw-alias-label-secondary);
  font:inherit;font-size:11.5px;cursor:pointer}
.dshwn-text-btn:hover{color:var(--dsw-alias-label-primary)}
.dshwn-text-btn[data-danger="true"]{color:var(--dsw-alias-state-error-primary);font-weight:600}
.dshwn-list{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;
  padding:2px 12px 14px 14px;display:flex;flex-direction:column;gap:8px;scrollbar-width:thin;
  scrollbar-color:color-mix(in srgb, var(--dsw-alias-label-primary) 22%, transparent) transparent}
.dshwn-list::-webkit-scrollbar{width:8px}
.dshwn-list::-webkit-scrollbar-thumb{border-radius:4px;background:color-mix(in srgb, var(--dsw-alias-label-primary) 18%, transparent)}
.dshwn-list::-webkit-scrollbar-thumb:hover{background:color-mix(in srgb, var(--dsw-alias-label-primary) 30%, transparent)}
.dshwn-card{position:relative;padding:9px 10px 7px;border-radius:11px;
  border:1px solid color-mix(in srgb, var(--dshwn-tint) 36%, var(--dsw-alias-border-l1));
  border-left:3px solid color-mix(in srgb, var(--dshwn-tint) 70%, var(--dsw-alias-border-l1));
  background:color-mix(in srgb, var(--dshwn-tint) 11%, var(--dsw-alias-bg-layer-2));
  transition:box-shadow .14s,border-color .14s}
.dshwn-card:hover{box-shadow:0 3px 14px -6px rgba(0,0,0,.38)}
.dshwn-card.is-done{background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 92%, var(--dshwn-tint) 8%)}
.dshwn-row{display:flex;align-items:flex-start;gap:8px}
.dshwn-check{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;width:17px;height:17px;
  margin-top:2px;padding:0;border-radius:50%;cursor:pointer;color:#fff;
  border:1.5px solid color-mix(in srgb, var(--dshwn-tint) 65%, var(--dsw-alias-border-l2));
  background:transparent;transition:background .12s,border-color .12s}
.dshwn-check:hover{border-color:var(--dshwn-tint)}
.dshwn-check[aria-checked="true"]{background:var(--dsw-alias-state-success-primary);
  border-color:var(--dsw-alias-state-success-primary)}
.dshwn-body{flex:1 1 auto;min-width:0}
.dshwn-text{font-size:13.5px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere;cursor:text}
.dshwn-card.is-done .dshwn-text{text-decoration:line-through;color:var(--dsw-alias-label-secondary)}
.dshwn-edit{display:block;width:100%;min-height:42px;max-height:160px;padding:4px 6px;border-radius:7px;
  border:1px solid color-mix(in srgb, var(--dshwn-tint) 55%, var(--dsw-alias-border-l2));
  background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:13.5px;
  line-height:1.5;resize:none;outline:none}
.dshwn-meta{display:flex;align-items:center;gap:5px;margin-top:5px;min-height:22px;
  font-size:10.5px;color:var(--dsw-alias-label-secondary)}
.dshwn-when{font-variant-numeric:tabular-nums}
.dshwn-badge{padding:0 5px;border-radius:5px;line-height:15px;
  background:color-mix(in srgb, var(--dsw-alias-label-primary) 9%, transparent)}
.dshwn-grow{flex:1 1 auto}
.dshwn-hint{font-size:10px;opacity:.9}
.dshwn-actions{display:flex;align-items:center;gap:1px;margin-left:auto}
.dshwn-actions .dshwn-icon-btn{width:23px;height:23px;border-radius:6px;opacity:.72}
.dshwn-card:hover .dshwn-actions .dshwn-icon-btn,.dshwn-card:focus-within .dshwn-actions .dshwn-icon-btn{opacity:1}
.dshwn-swatches{display:flex;align-items:center;gap:6px;margin:6px 0 2px;padding:6px 4px 2px;
  border-top:1px dashed color-mix(in srgb, var(--dshwn-tint) 45%, var(--dsw-alias-border-l1))}
.dshwn-swatch{width:18px;height:18px;padding:0;border-radius:50%;border:1px solid transparent;
  background:transparent;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
.dshwn-swatch-dot{width:13px;height:13px;border-radius:50%;display:block;
  box-shadow:inset 0 0 0 1px rgba(0,0,0,.12)}
.dshwn-swatch[data-active="true"]{border-color:color-mix(in srgb, var(--dsw-alias-label-primary) 55%, transparent)}
.dshwn-swatch:hover{border-color:color-mix(in srgb, var(--dsw-alias-label-primary) 35%, transparent)}
.dshwn-foot{display:flex;align-items:center;gap:7px;padding:8px 12px 9px 14px;
  border-top:1px solid var(--dsw-alias-border-l1);font-size:11px;color:var(--dsw-alias-label-secondary);min-height:38px}
.dshwn-dot{width:6px;height:6px;border-radius:50%;flex:0 0 auto;background:var(--dsw-alias-state-success-primary)}
.dshwn-dot[data-state="saving"],.dshwn-dot[data-state="loading"]{background:var(--dsw-alias-brand-primary);
  animation:dshwn-pulse 1.1s ease-in-out infinite}
.dshwn-dot[data-state="offline"],.dshwn-dot[data-state="error"]{background:var(--dsw-alias-state-warn-primary)}
.dshwn-dot[data-state="idle"]{background:var(--dsw-alias-state-idle-primary)}
@keyframes dshwn-pulse{50%{opacity:.3}}
.dshwn-foot-btn{margin-left:auto;display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 8px;
  border:1px solid var(--dsw-alias-border-l1);border-radius:7px;background:transparent;
  color:var(--dsw-alias-label-secondary);font:inherit;font-size:11px;cursor:pointer;transition:background .12s,color .12s}
.dshwn-foot-btn:hover{background:color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent);color:var(--dsw-alias-label-primary)}
.dshwn-undo{display:flex;align-items:center;gap:8px;width:100%}
.dshwn-undo button{margin-left:auto;border:none;background:transparent;color:var(--dsw-alias-brand-primary);
  font:inherit;font-size:11.5px;font-weight:650;cursor:pointer;padding:0 2px}
.dshwn-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;
  text-align:center;padding:34px 16px;color:var(--dsw-alias-label-secondary)}
.dshwn-empty-glyph{display:flex;align-items:center;justify-content:center;width:44px;height:44px;
  margin-bottom:4px;border-radius:13px;color:#d99a12;
  background:color-mix(in srgb, #f0b429 13%, var(--dsw-alias-bg-layer-2))}
.dshwn-empty-title{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary)}
.dshwn-empty-hint{font-size:11.5px;max-width:230px}
.dshwn-kbd{display:inline-block;padding:0 5px;border:1px solid var(--dsw-alias-border-l1);border-bottom-width:2px;
  border-radius:5px;background:var(--dsw-alias-bg-layer-2);font-size:10px;color:var(--dsw-alias-label-secondary);
  font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
.dshwn-side{order:999;flex:0 0 100%;max-width:100%;width:100%;display:flex;align-items:center;gap:8px;
  height:49px;min-width:0;padding:0 8px 0 6px;border:none;border-radius:12px;background:transparent;
  color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;text-align:left;cursor:pointer;
  overflow:hidden;transition:background .12s}
.dshwn-side:hover{background:color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent)}
.dshwn-side:active{background:color-mix(in srgb, var(--dsw-alias-label-primary) 11%, transparent)}
.dshwn-side[data-open="true"]{background:color-mix(in srgb, var(--dsw-alias-brand-primary) 11%, transparent)}
.dshwn-side-icon{display:flex;align-items:center;justify-content:center;width:20px;height:20px;flex:0 0 auto;color:#d99a12}
.dshwn-side[data-compact="true"]{justify-content:center;padding:0;gap:0}
.dshwn-side-label{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
div:has(> [data-slot="sidebar.footer.action"]){flex-wrap:wrap}
`

    function installStyles() {
      if (typeof document === 'undefined') return function () {}
      if (document.getElementById(STYLE_ID)) return function () {}
      const el = document.createElement('style')
      el.id = STYLE_ID
      el.textContent = CSS
      document.head.appendChild(el)
      return function () {
        if (el.parentNode) el.parentNode.removeChild(el)
      }
    }

    // ------------------------------------------------------------- components

    function iconButton(props) {
      return h('button', {
        type: 'button',
        className: 'dshwn-icon-btn',
        title: props.title,
        'aria-label': props.title,
        'data-danger': props.danger ? 'true' : undefined,
        'data-active': props.active ? 'true' : undefined,
        onClick: props.onClick,
      }, props.children)
    }

    function NoteCard(props) {
      const note = props.note
      const tint = TINTS[note.color] || TINTS.yellow
      const [editing, setEditing] = useState(false)
      const [draft, setDraft] = useState(note.text)
      const [palette, setPalette] = useState(false)
      const editRef = useRef(null)
      const skipBlurRef = useRef(false)

      useEffect(() => {
        if (!editing) return
        const el = editRef.current
        if (!el) return
        el.focus()
        const end = el.value.length
        try {
          el.setSelectionRange(end, end)
        } catch {
          /* non-text selection is harmless */
        }
        autoGrow(el)
      }, [editing])

      function startEdit() {
        skipBlurRef.current = false
        setDraft(note.text)
        setPalette(false)
        setEditing(true)
      }

      function saveEdit() {
        skipBlurRef.current = true
        setEditing(false)
        props.onSaveText(note.id, draft)
      }

      function cancelEdit() {
        skipBlurRef.current = true
        setEditing(false)
        setDraft(note.text)
      }

      function onEditKey(event) {
        if (event.key === 'Escape') {
          event.preventDefault()
          cancelEdit()
          return
        }
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
          event.preventDefault()
          saveEdit()
        }
      }

      function onEditBlur() {
        if (skipBlurRef.current) {
          skipBlurRef.current = false
          return
        }
        saveEdit()
      }

      const actions = editing
        ? h('span', { className: 'dshwn-hint' }, tr('editHint'))
        : h('span', { className: 'dshwn-actions' },
            iconButton({
              title: note.pinned ? tr('unpin') : tr('pin'),
              active: note.pinned,
              onClick: () => props.onPin(note),
              children: h(PinGlyph, { size: 14 }),
            }),
            h('button', {
              type: 'button',
              className: 'dshwn-icon-btn',
              title: tr('color'),
              'aria-label': tr('color'),
              'aria-expanded': palette ? 'true' : 'false',
              onClick: () => setPalette((value) => !value),
            }, h('span', {
              style: {
                width: 11,
                height: 11,
                borderRadius: '50%',
                background: tint,
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.15)',
                display: 'block',
              },
            })),
            iconButton({
              title: tr('edit'),
              onClick: startEdit,
              children: h(PencilGlyph, { size: 14 }),
            }),
            iconButton({
              title: tr('delete'),
              danger: true,
              onClick: () => props.onDelete(note),
              children: h(TrashGlyph, { size: 14 }),
            })
          )

      return h('article', {
        className: 'dshwn-card' + (note.done ? ' is-done' : ''),
        style: { '--dshwn-tint': tint },
        'data-note': note.id,
      },
        h('div', { className: 'dshwn-row' },
          h('button', {
            type: 'button',
            className: 'dshwn-check',
            role: 'checkbox',
            'aria-checked': note.done ? 'true' : 'false',
            'aria-label': note.done ? tr('markUndone') : tr('markDone'),
            onClick: () => props.onToggle(note),
          }, note.done ? h(CheckGlyph, { size: 10 }) : null),
          h('div', { className: 'dshwn-body' },
            editing
              ? h('textarea', {
                  ref: editRef,
                  className: 'dshwn-edit',
                  value: draft,
                  rows: 2,
                  'aria-label': tr('edit'),
                  onChange: (event) => {
                    setDraft(event.target.value)
                    autoGrow(event.target)
                  },
                  onKeyDown: onEditKey,
                  onBlur: onEditBlur,
                })
              : h('div', {
                  className: 'dshwn-text',
                  title: tr('editTitle'),
                  onDoubleClick: startEdit,
                }, note.text)
          )
        ),
        h('div', { className: 'dshwn-meta' },
          h('span', { className: 'dshwn-when' }, whenText(note.updatedAt)),
          note.pinned ? h('span', { className: 'dshwn-badge' }, tr('pinnedBadge')) : null,
          note.done ? h('span', { className: 'dshwn-badge' }, tr('doneBadge')) : null,
          h('span', { className: 'dshwn-grow' }),
          actions
        ),
        palette
          ? h('div', { className: 'dshwn-swatches' }, COLORS.map((color) => h('button', {
              key: color,
              type: 'button',
              className: 'dshwn-swatch',
              'data-active': note.color === color ? 'true' : 'false',
              title: colorName(color),
              'aria-label': colorName(color),
              onClick: () => {
                props.onColor(note.id, color)
                setPalette(false)
              },
            }, h('span', { className: 'dshwn-swatch-dot', style: { background: TINTS[color] } }))))
          : null
      )
    }

    function EmptyState(props) {
      return h('div', { className: 'dshwn-empty' },
        h('div', { className: 'dshwn-empty-glyph' }, h(NoteGlyph, { size: 24 })),
        h('div', { className: 'dshwn-empty-title' }, props.title),
        h('div', { className: 'dshwn-empty-hint' }, props.hint),
        props.shortcut
          ? h('div', { className: 'dshwn-empty-hint', style: { marginTop: 4 } },
              h('kbd', { className: 'dshwn-kbd' }, 'Ctrl+Alt+N'),
              h('span', null, ' ' + tr('shortcutHint').replace('Ctrl+Alt+N', '').trim()))
          : null
      )
    }

    function NotesDrawer() {
      useLang()
      const open = usePanelOpen()
      const [doc, setDocState] = useState(emptyDoc)
      const docRef = useRef(doc)
      const [status, setStatus] = useState('idle')
      const [draft, setDraft] = useState('')
      const [filter, setFilter] = useState('open')
      const [query, setQuery] = useState('')
      const [searchOpen, setSearchOpen] = useState(false)
      const [undo, setUndo] = useState(null)
      const [confirmClear, setConfirmClear] = useState(false)
      const [copyState, setCopyState] = useState('idle')
      const [, setClock] = useState(0)

      const openRef = useRef(false)
      const hydratedRef = useRef(false)
      const inflightRef = useRef(false)
      const dirtyRef = useRef(false)
      const saveTimerRef = useRef(null)
      const retryTimerRef = useRef(null)
      const undoTimerRef = useRef(null)
      const clearTimerRef = useRef(null)
      const copyTimerRef = useRef(null)
      const composerRef = useRef(null)
      const searchRef = useRef(null)
      const listRef = useRef(null)

      function setDoc(next) {
        docRef.current = next
        setDocState(next)
      }

      function flush() {
        if (!hydratedRef.current) return
        const payload = docRef.current
        saveLocalDoc(payload)
        if (inflightRef.current) {
          dirtyRef.current = true
          return
        }
        inflightRef.current = true
        setStatus('saving')
        apiPut(payload).then((saved) => {
          inflightRef.current = false
          docRef.current = { ...docRef.current, rev: saved.rev }
          setStatus('saved')
          if (dirtyRef.current) {
            dirtyRef.current = false
            flush()
          }
        }).catch(() => {
          inflightRef.current = false
          setStatus('offline')
          if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
          retryTimerRef.current = setTimeout(() => {
            if (openRef.current) flush()
          }, 6000)
        })
      }

      function scheduleSave() {
        saveLocalDoc(docRef.current)
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
        saveTimerRef.current = setTimeout(flush, 180)
      }

      function commit(updater) {
        const next = updater(docRef.current)
        setDoc(next)
        setStatus('saving')
        scheduleSave()
      }

      useEffect(() => {
        openRef.current = open
      }, [open])

      // Load the board whenever the drawer opens: local mirror first (instant),
      // then the Host file, merged by per-note updatedAt.
      useEffect(() => {
        if (!open) return undefined
        let cancelled = false
        hydratedRef.current = false
        const local = loadLocalDoc()
        if (local) {
          setDoc(local)
        } else {
          setStatus('loading')
        }
        apiGet().then((server) => {
          if (cancelled) return
          hydratedRef.current = true
          const merged = mergeDocs(server, docRef.current)
          const needsPush = !docEquals(merged, server)
          setDoc(merged)
          saveLocalDoc(merged)
          if (needsPush) {
            setStatus('saving')
            flush()
          } else {
            setStatus('saved')
          }
        }).catch(() => {
          if (cancelled) return
          hydratedRef.current = true
          const hasNotes = docRef.current.notes.length > 0
          setStatus(hasNotes ? 'offline' : 'error')
          if (hasNotes) {
            // The read failed; still try to push what the user typed so a
            // transient read error does not leave the Host file behind.
            flush()
          }
        })
        return () => {
          cancelled = true
        }
      }, [open])

      // Pick up edits made by another window (or a Host-side rewrite).
      useEffect(() => {
        if (!open) return undefined
        let last = 0
        function onFocus() {
          const now = Date.now()
          if (now - last < 15000) return
          last = now
          apiGet().then((server) => {
            const merged = mergeDocs(server, docRef.current)
            if (docEquals(merged, docRef.current)) return
            setDoc(merged)
            saveLocalDoc(merged)
            setStatus('saving')
            flush()
          }).catch(() => {})
        }
        window.addEventListener('focus', onFocus)
        return () => window.removeEventListener('focus', onFocus)
      }, [open])

      useEffect(() => {
        if (!open) return undefined
        const id = setInterval(() => setClock((value) => value + 1), 60000)
        return () => clearInterval(id)
      }, [open])

      useEffect(() => {
        if (!open) return undefined
        function onKey(event) {
          if (event.key !== 'Escape' || event.defaultPrevented) return
          const target = event.target
          const tag = target && target.tagName
          if (tag === 'INPUT' || tag === 'TEXTAREA') return
          setPanelOpen(false)
        }
        window.addEventListener('keydown', onKey, true)
        return () => window.removeEventListener('keydown', onKey, true)
      }, [open])

      useEffect(() => {
        if (searchOpen && searchRef.current) searchRef.current.focus()
      }, [searchOpen])

      useEffect(() => () => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
        if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
        if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
        if (clearTimerRef.current) clearTimeout(clearTimerRef.current)
        if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      }, [])

      const counts = useMemo(() => {
        let openCount = 0
        doc.notes.forEach((note) => {
          if (!note.done) openCount += 1
        })
        return { open: openCount, done: doc.notes.length - openCount, total: doc.notes.length }
      }, [doc.notes])

      const visible = useMemo(() => {
        const needle = query.trim().toLowerCase()
        const list = doc.notes.filter((note) => {
          if (filter === 'open' && note.done) return false
          if (filter === 'done' && !note.done) return false
          if (needle && note.text.toLowerCase().indexOf(needle) < 0) return false
          return true
        })
        list.sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
          if (a.done !== b.done) return a.done ? 1 : -1
          return b.updatedAt - a.updatedAt
        })
        return list
      }, [doc.notes, filter, query])

      function addNote() {
        const value = draft.trim()
        if (!value) return
        const now = Date.now()
        const note = {
          id: newId(),
          text: value.slice(0, MAX_TEXT),
          done: false,
          pinned: false,
          color: nextColor(docRef.current.notes),
          createdAt: now,
          updatedAt: now,
        }
        commit((prev) => ({ ...prev, notes: [note, ...prev.notes] }))
        setDraft('')
        if (filter === 'done') setFilter('open')
        if (query) setQuery('')
        if (listRef.current) listRef.current.scrollTop = 0
        requestAnimationFrame(() => {
          if (!composerRef.current) return
          autoGrow(composerRef.current)
          composerRef.current.focus()
        })
      }

      function updateNote(id, patch) {
        commit((prev) => ({
          ...prev,
          notes: prev.notes.map((note) => (note.id === id
            ? { ...note, ...patch, updatedAt: Date.now() }
            : note)),
        }))
      }

      function saveText(id, text) {
        const value = String(text || '').trim()
        if (!value) return false
        const current = docRef.current.notes.find((note) => note.id === id)
        if (!current) return false
        if (current.text === value) return true
        updateNote(id, { text: value.slice(0, MAX_TEXT) })
        return true
      }

      function removeNotes(notes) {
        if (!notes.length) return
        const at = Date.now()
        const ids = new Set(notes.map((note) => note.id))
        const tombstones = notes.map((note) => ({ id: note.id, at }))
        commit((prev) => ({
          ...prev,
          notes: prev.notes.filter((note) => !ids.has(note.id)),
          tombstones: tombstones.concat(prev.tombstones).slice(-MAX_TOMBSTONES),
        }))
        setUndo({ notes, at })
        if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
        undoTimerRef.current = setTimeout(() => setUndo(null), 8000)
      }

      function undoRemove() {
        if (!undo) return
        const ids = new Set(undo.notes.map((note) => note.id))
        const restored = undo.notes.map((note) => ({ ...note, updatedAt: Date.now() }))
        commit((prev) => ({
          ...prev,
          notes: restored.concat(prev.notes),
          tombstones: prev.tombstones.filter((item) => !ids.has(item.id)),
        }))
        setUndo(null)
        if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
      }

      function clearDone() {
        if (!confirmClear) {
          setConfirmClear(true)
          if (clearTimerRef.current) clearTimeout(clearTimerRef.current)
          clearTimerRef.current = setTimeout(() => setConfirmClear(false), 4000)
          return
        }
        setConfirmClear(false)
        if (clearTimerRef.current) clearTimeout(clearTimerRef.current)
        removeNotes(docRef.current.notes.filter((note) => note.done))
      }

      function copyPending() {
        const lines = docRef.current.notes
          .filter((note) => !note.done)
          .sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
            return b.updatedAt - a.updatedAt
          })
          .map((note) => '• ' + note.text)
          .join('\n')
        function settle(state) {
          setCopyState(state)
          if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
          copyTimerRef.current = setTimeout(() => setCopyState('idle'), 1800)
        }
        if (!lines) {
          settle('empty')
          return
        }
        if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
          settle('fail')
          return
        }
        navigator.clipboard.writeText(lines).then(() => settle('ok')).catch(() => settle('fail'))
      }

      function onComposerKey(event) {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
          event.preventDefault()
          addNote()
          return
        }
        if (event.key === 'Escape') {
          setDraft('')
          autoGrow(composerRef.current)
        }
      }

      if (!open) return null

      const filters = [
        { id: 'open', label: tr('filterOpen'), count: counts.open },
        { id: 'all', label: tr('filterAll'), count: counts.total },
        { id: 'done', label: tr('filterDone'), count: counts.done },
      ]

      let emptyTitle = tr('emptyOpen')
      let emptyHint = tr('emptyOpenHint')
      if (query.trim()) {
        emptyTitle = tr('emptySearch')
        emptyHint = tr('emptySearchHint')
      } else if (filter === 'all') {
        emptyTitle = tr('emptyAll')
        emptyHint = tr('emptyAllHint')
      } else if (filter === 'done') {
        emptyTitle = tr('emptyDone')
        emptyHint = tr('emptyDoneHint')
      }

      let statusText = tr('saved')
      if (status === 'loading' || status === 'idle') statusText = tr('loading')
      else if (status === 'saving') statusText = tr('saving')
      else if (status === 'offline') statusText = tr('offline')
      else if (status === 'error') statusText = tr('error')

      const copyLabel = copyState === 'ok'
        ? tr('copied')
        : copyState === 'empty'
          ? tr('copyEmpty')
          : copyState === 'fail'
            ? tr('copyFail')
            : tr('copyOpen')

      return h('aside', {
        className: 'dshwn-panel',
        role: 'complementary',
        'aria-label': tr('title'),
        style: { top: 'var(--dsh-windows-titlebar-height, 0px)', width: 'min(384px, 92vw)' },
      },
        h('header', { className: 'dshwn-head' },
          h('div', { className: 'dshwn-glyph', 'aria-hidden': 'true' }, h(NoteGlyph, { size: 18 })),
          h('div', { className: 'dshwn-headtext' },
            h('div', { className: 'dshwn-title' }, tr('title')),
            h('div', { className: 'dshwn-sub' },
              counts.total === 0
                ? tr('countsZero')
                : tr('countsOpen', { open: counts.open, total: counts.total }))
          ),
          h('button', {
            type: 'button',
            className: 'dshwn-icon-btn dshwn-close',
            title: tr('close'),
            'aria-label': tr('close'),
            onClick: () => setPanelOpen(false),
          }, h(CloseGlyph, { size: 16 }))
        ),
        h('form', {
          className: 'dshwn-composer',
          onSubmit: (event) => {
            event.preventDefault()
            addNote()
          },
        },
          h('textarea', {
            ref: composerRef,
            className: 'dshwn-input',
            rows: 1,
            value: draft,
            placeholder: tr('addPlaceholder'),
            title: tr('addHint'),
            'aria-label': tr('addPlaceholder'),
            onChange: (event) => {
              setDraft(event.target.value)
              autoGrow(event.target)
            },
            onKeyDown: onComposerKey,
          }),
          h('button', {
            type: 'submit',
            className: 'dshwn-add',
            disabled: !draft.trim(),
            title: tr('add'),
            'aria-label': tr('add'),
          }, h(PlusGlyph, { size: 13 }), h('span', null, tr('add')))
        ),
        h('div', { className: 'dshwn-toolbar' },
          h('div', { className: 'dshwn-chips' }, filters.map((item) => h('button', {
            key: item.id,
            type: 'button',
            className: 'dshwn-chip',
            'data-active': filter === item.id ? 'true' : 'false',
            'aria-pressed': filter === item.id ? 'true' : 'false',
            onClick: () => {
              setFilter(item.id)
              setQuery('')
              setSearchOpen(false)
            },
          },
            h('span', null, item.label),
            h('span', { className: 'dshwn-chip-count' }, String(item.count))
          ))),
          h('button', {
            type: 'button',
            className: 'dshwn-icon-btn',
            title: tr('searchToggle'),
            'aria-label': tr('searchToggle'),
            'aria-pressed': searchOpen ? 'true' : 'false',
            'data-active': searchOpen ? 'true' : 'false',
            onClick: () => {
              setSearchOpen((value) => !value)
              setQuery('')
            },
          }, h(SearchGlyph, { size: 15 }))
        ),
        searchOpen
          ? h('div', { className: 'dshwn-search' },
              h(SearchGlyph, { size: 14 }),
              h('input', {
                ref: searchRef,
                value: query,
                placeholder: tr('search'),
                'aria-label': tr('search'),
                onChange: (event) => setQuery(event.target.value),
                onKeyDown: (event) => {
                  if (event.key === 'Escape') {
                    event.preventDefault()
                    setQuery('')
                    setSearchOpen(false)
                  }
                },
              }),
              query
                ? h('button', {
                    type: 'button',
                    className: 'dshwn-icon-btn dshwn-search-clear',
                    title: tr('clear'),
                    'aria-label': tr('clear'),
                    onClick: () => setQuery(''),
                  }, h(CloseGlyph, { size: 12 }))
                : null
            )
          : null,
        filter === 'done' && counts.done > 0
          ? h('div', { className: 'dshwn-listbar' },
              h('span', null, tr('doneCount', { n: counts.done })),
              h('button', {
                type: 'button',
                className: 'dshwn-text-btn',
                'data-danger': confirmClear ? 'true' : 'false',
                onClick: clearDone,
              }, confirmClear ? tr('clearDoneConfirm') : tr('clearDone'))
            )
          : null,
        h('div', { className: 'dshwn-list', ref: listRef },
          visible.length === 0
            ? h(EmptyState, {
                title: emptyTitle,
                hint: emptyHint,
                shortcut: !query.trim() && filter === 'all' && counts.total === 0,
              })
            : visible.map((note) => h(NoteCard, {
                key: note.id,
                note,
                onToggle: (item) => updateNote(item.id, {
                  done: !item.done,
                  doneAt: item.done ? undefined : Date.now(),
                }),
                onPin: (item) => updateNote(item.id, { pinned: !item.pinned }),
                onColor: (id, color) => updateNote(id, { color }),
                onSaveText: saveText,
                onDelete: (item) => removeNotes([item]),
              }))
        ),
        h('footer', { className: 'dshwn-foot' },
          undo
            ? h('div', { className: 'dshwn-undo' },
                h('span', null, undo.notes.length === 1
                  ? tr('undoOne')
                  : tr('undoMany', { n: undo.notes.length })),
                h('button', { type: 'button', onClick: undoRemove }, tr('undo'))
              )
            : h(React.Fragment, null,
                h('span', { className: 'dshwn-dot', 'data-state': status }),
                h('span', { 'aria-live': 'polite' }, statusText),
                h('button', {
                  type: 'button',
                  className: 'dshwn-foot-btn',
                  title: tr('copyOpen'),
                  onClick: copyPending,
                }, h(CopyGlyph, { size: 12 }), h('span', null, copyLabel))
              )
        )
      )
    }

    function SidebarButton(props) {
      useLang()
      const open = usePanelOpen()
      // The owner shares whether the sidebar renders wide content; a collapsed
      // 56px rail keeps only the icon so the label cannot be clipped mid-word.
      const compact = !!(props && props.wide === false)
      return h('button', {
        type: 'button',
        className: 'dshwn-side',
        'data-open': open ? 'true' : 'false',
        'data-compact': compact ? 'true' : 'false',
        title: tr('title') + ' · Ctrl+Alt+N',
        'aria-label': tr('title'),
        'aria-expanded': open ? 'true' : 'false',
        onClick: (event) => {
          if (event && event.preventDefault) event.preventDefault()
          if (event && event.stopPropagation) event.stopPropagation()
          setPanelOpen(!isPanelOpen())
        },
      },
        h('span', { className: 'dshwn-side-icon', 'aria-hidden': 'true' }, h(NoteGlyph, { size: 17 })),
        compact ? null : h('span', { className: 'dshwn-side-label' }, tr('sidebar'))
      )
    }

    // ----------------------------------------------------------------- apply

    function readHostLang(ctx) {
      try {
        const locale = typeof ctx.get === 'function' ? ctx.get('locale') : ctx.locale
        if (!locale || typeof locale.getLocale !== 'function') return null
        const snapshot = locale.getLocale()
        return langFromLocale(snapshot && snapshot.active)
      } catch {
        return null
      }
    }

    function apply(ctx) {
      if (typeof ctx.effect === 'function') {
        ctx.effect(installStyles)
      } else {
        installStyles()
      }

      const hostLang = readHostLang(ctx)
      if (hostLang) setLang(hostLang)

      let locale
      try {
        locale = typeof ctx.get === 'function' ? ctx.get('locale') : ctx.locale
      } catch {
        locale = undefined
      }
      if (locale && typeof locale.subscribe === 'function') {
        const sync = () => {
          const next = readHostLang(ctx)
          if (next) setLang(next)
        }
        if (typeof ctx.effect === 'function') ctx.effect(() => locale.subscribe(sync))
        else locale.subscribe(sync)
      }

      ctx.slots.inject('shell.overlay', () => ctx.slots.register({
        name: 'shell.overlay',
        id: 'work-notes-panel',
        order: 80,
        label: () => tr('title'),
      }, NotesDrawer))

      ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
        name: 'sidebar.footer.action',
        id: 'work-notes-button',
        order: 60,
        label: () => tr('sidebar'),
      }, SidebarButton))

      const onShortcut = (event) => {
        if (!event || event.defaultPrevented) return
        if (!(event.ctrlKey || event.metaKey) || !event.altKey || event.shiftKey) return
        if (String(event.key || '').toLowerCase() !== 'n') return
        event.preventDefault()
        setPanelOpen(!isPanelOpen())
      }

      if (typeof ctx.effect === 'function') {
        ctx.effect(() => {
          window.addEventListener('keydown', onShortcut, true)
          return () => window.removeEventListener('keydown', onShortcut, true)
        })
      } else {
        window.addEventListener('keydown', onShortcut, true)
      }
    }

    return {
      name: 'dsh-work-notes-client',
      inject: ['slots'],
      apply,
    }
  },
})
