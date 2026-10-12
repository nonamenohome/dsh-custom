/**
 * Floating page-style widget for the wallpaper backdrop: switches the whole
 * page between 白天 (light — white surfaces) and 黑夜 (dark — the current
 * translucent look), plus a 壁纸透明度 slider (higher ⇒ more wallpaper shows).
 *
 * State persists in localStorage under `dsh.wallpaper.style` and is applied
 * at module load, before the app boots. A body-attribute observer keeps the
 * chosen mode authoritative against the theme presenter's system-scheme flips
 * (the presenter re-applies `data-ds-dark-theme` from the `system`
 * preference on OS scheme changes).
 *
 * Pure DOM — no React, no plugin context; the web shell bundles it.
 */

const STORAGE_KEY = 'dsh.wallpaper.style'

type WallpaperMode = 'light' | 'dark'

interface WallpaperStyle {
  mode: WallpaperMode
  /** 0..100 — transparency percent; higher reveals more of the wallpaper. */
  transparency: number
}

/** Transparency that reproduces the original translucent look (surface alpha ≈ 0.61). */
const DEFAULT_TRANSPARENCY = 42

function readStyle(): WallpaperStyle | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return null
    const parsed = JSON.parse(raw) as Partial<WallpaperStyle>
    const mode: WallpaperMode = parsed.mode === 'dark' ? 'dark' : 'light'
    const transparency = typeof parsed.transparency === 'number' && Number.isFinite(parsed.transparency)
      ? Math.min(100, Math.max(0, Math.round(parsed.transparency)))
      : DEFAULT_TRANSPARENCY
    return { mode, transparency }
  } catch {
    return null
  }
}

function writeStyle(style: WallpaperStyle): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(style)) } catch { /* storage unavailable */ }
}

/** Surface opacity (1 = fully opaque, wallpaper hidden) from transparency percent. */
function surfaceOpacity(transparency: number): number {
  return Math.round((1 - (transparency / 100) * 0.93) * 100) / 100
}

function applyMode(mode: WallpaperMode): void {
  document.body.dataset.dsWpMode = mode
  // Native auto dark-mode envs aside, keep native chrome (scrollbars, form
  // controls) in step with the chosen day/night.
  if (mode === 'dark') document.body.setAttribute('data-ds-dark-theme', '')
  else document.body.removeAttribute('data-ds-dark-theme')
  document.documentElement.style.colorScheme = mode
}

function applyOpacity(transparency: number): void {
  document.documentElement.style.setProperty('--dsw-wallpaper-opacity', String(surfaceOpacity(transparency)))
}

function applyStyle(style: WallpaperStyle): void {
  applyMode(style.mode)
  applyOpacity(style.transparency)
}

const PALETTE_SVG = /* svg */ '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21a9 9 0 1 1 9-9c0 2-1.5 3-3 3h-1.8c-1.1 0-2 .9-2 2 0 .5.2 1 .5 1.3.4.5.3 1.7-.7 1.7Z"/><circle cx="7.5" cy="11.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="11" cy="7.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="15.5" cy="10" r="1.2" fill="currentColor" stroke="none"/></svg>'

const WIDGET_CSS = `
#dsw-wp-widget {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 99999;
  font-family: system-ui, -apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
#dsw-wp-toggle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgb(255 255 255 / 14%);
  background: rgb(22 24 30 / 82%);
  color: #e8ebf2;
  cursor: pointer;
  box-shadow: 0 6px 18px rgb(0 0 0 / 35%);
  display: grid;
  place-items: center;
  padding: 0;
  transition: background 120ms ease;
}
#dsw-wp-toggle:hover { background: rgb(42 46 56 / 92%); }
#dsw-wp-panel {
  position: absolute;
  right: 0;
  bottom: 54px;
  width: 236px;
  box-sizing: border-box;
  background: rgb(24 27 34 / 92%);
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 10px 32px rgb(0 0 0 / 45%);
  color: #e8ebf2;
  display: none;
}
#dsw-wp-widget[data-open='true'] #dsw-wp-panel { display: block; }
#dsw-wp-panel h3 { margin: 0 0 12px; font-size: 13px; font-weight: 600; color: #fff; }
.dsw-wp-row { margin-bottom: 12px; }
.dsw-wp-row:last-child { margin-bottom: 0; }
.dsw-wp-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #b9bfcc;
  margin-bottom: 6px;
}
#dsw-wp-seg { display: flex; gap: 6px; }
.dsw-wp-segbtn {
  flex: 1;
  padding: 6px 0;
  border-radius: 8px;
  border: 1px solid rgb(255 255 255 / 14%);
  background: rgb(255 255 255 / 6%);
  color: #dfe3ec;
  font-size: 12px;
  cursor: pointer;
}
.dsw-wp-segbtn:hover { background: rgb(255 255 255 / 12%); }
.dsw-wp-segbtn[data-active='true'] { background: #3b6ff5; border-color: #3b6ff5; color: #fff; }
#dsw-wp-range { width: 100%; accent-color: #3b6ff5; cursor: pointer; }
#dsw-wp-value { color: #fff; font-variant-numeric: tabular-nums; }
`

function mount(): void {
  const stored = readStyle()
  const state: WallpaperStyle = {
    mode: stored?.mode ?? (document.body.hasAttribute('data-ds-dark-theme') ? 'dark' : 'light'),
    transparency: stored?.transparency ?? DEFAULT_TRANSPARENCY,
  }
  // Apply stored state at load (before the app boots). Without storage the
  // stylesheet default --dsw-wallpaper-opacity already matches the slider and
  // the mode is inferred below. The visual day/night is driven purely by
  // body[data-ds-wp-mode] + wallpaper.css and does not depend on the theme
  // presenter or the liang skin, so there is no MutationObserver to re-assert
  // it — nothing else touches data-ds-wp-mode, and re-applying an unchanged
  // attribute value would be a no-op anyway (a MutationObserver retrigger loop
  // between this widget and liang-skin's own presenter is what we are
  // deliberately avoiding).
  applyStyle(state)

  const styleEl = document.createElement('style')
  styleEl.textContent = WIDGET_CSS
  document.head.append(styleEl)

  const host = document.createElement('div')
  host.id = 'dsw-wp-widget'
  host.dataset.open = 'false'

  const toggle = document.createElement('button')
  toggle.id = 'dsw-wp-toggle'
  toggle.type = 'button'
  toggle.title = '页面风格设置'
  toggle.setAttribute('aria-label', '页面风格设置')
  toggle.innerHTML = PALETTE_SVG
  toggle.addEventListener('click', () => {
    host.dataset.open = host.dataset.open === 'true' ? 'false' : 'true'
  })

  const panel = document.createElement('div')
  panel.id = 'dsw-wp-panel'

  const title = document.createElement('h3')
  title.textContent = '页面风格'
  panel.append(title)

  // ---- 主题: 白天 / 黑夜 ----
  const modeRow = document.createElement('div')
  modeRow.className = 'dsw-wp-row'
  const modeLabel = document.createElement('div')
  modeLabel.className = 'dsw-wp-label'
  modeLabel.textContent = '主题'
  modeRow.append(modeLabel)
  const seg = document.createElement('div')
  seg.id = 'dsw-wp-seg'
  const segButtons: HTMLButtonElement[] = []
  const addSegButton = (label: string, mode: WallpaperMode): void => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'dsw-wp-segbtn'
    button.textContent = label
    button.dataset.mode = mode
    button.addEventListener('click', () => {
      state.mode = mode
      applyStyle(state)
      writeStyle(state)
      sync()
    })
    seg.append(button)
    segButtons.push(button)
  }
  addSegButton('白天', 'light')
  addSegButton('黑夜', 'dark')
  modeRow.append(seg)
  panel.append(modeRow)

  // ---- 壁纸透明度 slider ----
  const rangeRow = document.createElement('div')
  rangeRow.className = 'dsw-wp-row'
  const rangeLabel = document.createElement('div')
  rangeLabel.className = 'dsw-wp-label'
  const rangeText = document.createElement('span')
  rangeText.textContent = '壁纸透明度'
  const rangeValue = document.createElement('span')
  rangeValue.id = 'dsw-wp-value'
  rangeLabel.append(rangeText, rangeValue)
  rangeRow.append(rangeLabel)
  const range = document.createElement('input')
  range.id = 'dsw-wp-range'
  range.type = 'range'
  range.min = '0'
  range.max = '100'
  range.step = '1'
  range.setAttribute('aria-label', '壁纸透明度')
  range.addEventListener('input', () => {
    state.transparency = Number(range.value)
    applyOpacity(state.transparency)
    writeStyle(state)
    sync()
  })
  rangeRow.append(range)
  panel.append(rangeRow)

  const sync = (): void => {
    for (const button of segButtons) {
      button.dataset.active = String(button.dataset.mode === state.mode)
    }
    range.value = String(state.transparency)
    rangeValue.textContent = `${state.transparency}%`
  }

  // Close on outside click / Escape.
  document.addEventListener('pointerdown', (event) => {
    if (!host.contains(event.target as Node)) host.dataset.open = 'false'
  })
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') host.dataset.open = 'false'
  })

  host.append(toggle, panel)
  document.body.append(host)
  sync()
}

mount()
