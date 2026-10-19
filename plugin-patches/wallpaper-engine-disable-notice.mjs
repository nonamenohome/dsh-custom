/**
 * Disable the wallpaper-engine startup announcements.
 *
 * The plugin shows two one-time dialogs on boot:
 *   1. the "更新公告" card (NOTICE_VERSION gate) — the card in the user's
 *      screenshot, rendered before the intro animation;
 *   2. the "作者自用" preset prompt, which becomes eligible precisely when
 *      noticeSeen === NOTICE_VERSION (so dismissing dialog 1 queues dialog 2).
 *
 * Both are gated by a `const eligible = ...` expression in the served client
 * bundle. Setting the gate to false removes them without touching settings,
 * and without affecting any other wallpaper feature.
 *
 * Run: node disable-we-notice.mjs
 * Undo: copy wallpaper-backup/client.js over the installed file.
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'

const FILE = 'C:/Users/quyuedi/.dsh/profiles/desktop/node_modules/dsh-plugin-wallpaper-engine/lib/client.js'
const BACKUP = 'D:/QYD/dsh-file/balance-research/wallpaper-backup/client.js'

if (!existsSync(BACKUP)) copyFileSync(FILE, BACKUP)

const swaps = [
  {
    from: 'const eligible = sel.hostLoaded && sel.noticeSeen !== NOTICE_VERSION;',
    to: 'const eligible = false; /* DSH: startup update notice disabled */',
    label: 'update notice',
  },
  {
    from: 'const eligible = sel.hostLoaded && !seen && sel.noticeSeen === NOTICE_VERSION;',
    to: 'const eligible = false; /* DSH: author-preset prompt disabled */',
    label: 'author-preset prompt',
  },
]

let text = readFileSync(FILE, 'utf8')
let changed = 0
for (const swap of swaps) {
  const hits = text.split(swap.from).length - 1
  if (hits === 0) {
    console.log(`skip  ${swap.label} (already patched or bundle changed)`)
    continue
  }
  if (hits !== 1) throw new Error(`${swap.label}: expected 1 match, found ${hits}`)
  text = text.replace(swap.from, swap.to)
  changed += 1
  console.log(`patch ${swap.label}`)
}
if (changed > 0) writeFileSync(FILE, text, 'utf8')
console.log(changed === 0 ? 'nothing to do' : `done (${changed} gate(s) disabled)`)
