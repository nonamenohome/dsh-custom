/**
 * Fix dsh-plugins-catalog getting stuck on Windows desktop.
 *
 * Symptom: opening 插件库 from the sidebar shows a full-screen white page whose
 * header (插件库 / 已安装 / 关闭) is painted under the Windows caption strip, so
 * the native 最小化/最大化/关闭 buttons cover the panel's own 关闭 button and the
 * conversation cannot be reached again.
 *
 * Cause: the store renders `position: fixed; inset: 0; z-index: 10000` inside
 * the shell overlay seat. The Electron desktop window uses
 * `titleBarStyle: hidden` + `titleBarOverlay`, so the caption buttons live in
 * native space above the page, and the Application/Edit menu is a fixed
 * z-index 1100 element. DSH's own overlays clear that strip with
 * `padding-top: var(--dsh-windows-titlebar-height)`; this plugin does not.
 *
 * Fix (four small edits, no dependency changes):
 *  1. catalog panel reserves the Windows caption strip (padding-top token).
 *  2. fullscreen drops that clearance again (html[data-fullscreen]).
 *  3. Escape closes the panel (keyboard escape hatch when the header is hidden).
 *  4. a "← 返回会话" button is added at the left of the header, far from the
 *     caption buttons.
 *
 * The desktop profile links the catalog from D:/QYD/dsh-file/vendor, so that is
 * the copy the running window serves. The web profile copy is patched too for
 * consistency when `dsh web` is used.
 *
 * Run:  node patch.mjs            (idempotent; refuses if anchors are missing)
 * Undo: copy backup/<target>/<file> back over client-parts/<file>.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const TARGETS = [
  { key: 'vendor', parts: 'D:/QYD/dsh-file/vendor/dsh-plugins-catalog/client-parts' },
  { key: 'web', parts: 'C:/Users/quyuedi/.dsh/profiles/web/node_modules/dsh-plugins-catalog/client-parts' },
]
const BACKUP = 'D:/QYD/dsh-file/dsh-plugins-catalog-fix/backup'

/** @type {{file:string, find:string, replace:string, label:string, done:string}[]} */
const edits = [
  {
    file: '10.js',
    label: 'reserve the Windows caption strip',
    done: 'paddingTop: "var(--dsh-windows-titlebar-height, 0px)"',
    find: [
      '          position: "fixed",',
      '          inset: 0,',
      '          zIndex: 10000,',
    ].join('\n'),
    replace: [
      '          position: "fixed",',
      '          inset: 0,',
      '          // Windows desktop paints the native caption buttons (and the',
      '          // Application/Edit menu) above the page. Reserve that strip or',
      "          // this header's 关闭 button lands underneath them.",
      '          paddingTop: "var(--dsh-windows-titlebar-height, 0px)",',
      '          zIndex: 10000,',
    ].join('\n'),
  },
  {
    file: '10.js',
    label: 'Escape closes the store',
    done: 'window.addEventListener("keydown", onKey, true);',
    find: ['      }, [open]);', '      if (!open) return null;'].join('\n'),
    replace: [
      '      }, [open]);',
      '      // Escape is the way out of a full-screen surface: the store covers',
      '      // the window, so it must stay closable from the keyboard even when',
      '      // the header is clipped by window chrome.',
      '      useEffect(function () {',
      '        if (!open) return;',
      '        function onKey(e) {',
      '          if (!e || e.key !== "Escape" || e.defaultPrevented) return;',
      '          if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;',
      '          setStoreOpen(false);',
      '        }',
      '        window.addEventListener("keydown", onKey, true);',
      '        return function () { window.removeEventListener("keydown", onKey, true); };',
      '      }, [open]);',
      '      if (!open) return null;',
    ].join('\n'),
  },
  {
    file: '03.js',
    label: 'drop the clearance in fullscreen',
    done: 'html[data-windows-titlebar][data-fullscreen] [data-dsh-plugins-catalog]',
    find: '        \'[data-dsh-plugins-catalog]{width:100%;max-width:none;flex:1 1 auto;min-width:0;align-self:stretch;box-sizing:border-box}\',',
    replace: [
      '        \'[data-dsh-plugins-catalog]{width:100%;max-width:none;flex:1 1 auto;min-width:0;align-self:stretch;box-sizing:border-box}\',',
      '        // Fullscreen drops the caption strip (html[data-fullscreen] clears the',
      '        // frame chrome top), so the store must not reserve it either.',
      '        \'html[data-windows-titlebar][data-fullscreen] [data-dsh-plugins-catalog]{padding-top:0!important}\',',
    ].join('\n'),
  },
  {
    file: '09.js',
    label: 'return-to-conversation button at the left of the header',
    done: '"← 返回会话"',
    find: '              h("div", { style: { fontSize: 16, fontWeight: 600, color: FG } }, "插件库"),',
    replace: [
      '              onClose ? h("button", {',
      '                type: "button",',
      '                title: "返回会话（Esc）",',
      '                onClick: onClose,',
      '                style: {',
      '                  display: "inline-flex",',
      '                  alignItems: "center",',
      '                  gap: 4,',
      '                  padding: "3px 10px",',
      '                  borderRadius: 8,',
      '                  border: "1px solid " + LINE,',
      '                  background: BG,',
      '                  color: FG,',
      '                  cursor: "pointer",',
      '                  fontSize: 12,',
      '                  fontWeight: 650,',
      '                  lineHeight: "18px"',
      '                }',
      '              }, "← 返回会话") : null,',
      '              h("div", { style: { fontSize: 16, fontWeight: 600, color: FG } }, "插件库"),',
    ].join('\n'),
  },
]

let changed = 0
for (const target of TARGETS) {
  const parts = target.parts
  if (!existsSync(parts)) {
    console.log(`skip  ${parts} (not installed)`)
    continue
  }
  const backupDir = join(BACKUP, target.key)
  mkdirSync(backupDir, { recursive: true })
  for (const edit of edits) {
    const path = join(parts, edit.file)
    let text = readFileSync(path, 'utf8')
    if (text.includes(edit.done)) {
      console.log(`skip  ${edit.file}: ${edit.label} (already applied)`)
      continue
    }
    const backupPath = join(backupDir, edit.file)
    if (!existsSync(backupPath)) copyFileSync(path, backupPath)
    const hits = text.split(edit.find).length - 1
    if (hits !== 1) throw new Error(`${path}: anchor for "${edit.label}" matched ${hits} times, aborting`)
    writeFileSync(path, text.replace(edit.find, edit.replace), 'utf8')
    changed += 1
    console.log(`patch ${edit.file}: ${edit.label}  [${parts}]`)
  }
}
console.log(changed === 0 ? 'nothing to do (already patched)' : `done, ${changed} edit(s) applied; backup in ${BACKUP}`)
