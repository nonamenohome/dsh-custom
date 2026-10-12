/**
 * 女仆皮肤透明度增强补丁（两个设置项）
 *
 * 设置 1 — 对话气泡不透明度：
 *   body[data-dsh-maid-atelier] [data-chat-flow-kind=assistant-step] ... div[class*=markdown]
 *     { background:#f8fafff0 }              ← 94% 不透明白，挡住立绘的元凶
 *   [data-dsh-better-display] article[data-reader-answer] 同色
 *   深色模式 { background:#121f43f0 }
 *
 * 设置 2 — 代码块不透明度：
 *   :is([data-read],[data-diff],[class~=md-code-block]), [data-terminal]
 *     { --dsw-alias-markdown-code-block:#f9fafdf7 }   ← 97% 不透明
 *   深色 { --dsw-alias-markdown-code-block:#0a1430f7 }
 *   该变量经 --dsl-code-block-background 供 CodeBlock.module.css 使用，
 *   因此同时影响 md 代码块、read/diff 工具结果块、终端块。
 *
 * 注意：原文件是 CRLF 换行，插入文本必须用 \r\n。
 * 用法: node patch.cjs <输出路径>
 */
const fs = require('node:fs');

const SRC = 'D:/QYD/dsh-file/skin-patch/client.js.orig';
const DST = process.argv[2];
if (!DST) {
  console.error('用法: node patch.cjs <输出路径>');
  process.exit(1);
}

const NL = '\r\n';
let s = fs.readFileSync(SRC, 'utf8');
const log = [];

function rep(from, to, expect) {
  const n = s.split(from).length - 1;
  if (n !== expect) throw new Error(`断言失败：期望 ${expect} 处 ${JSON.stringify(from.slice(0, 60))}，实际 ${n} 处`);
  s = s.split(from).join(to);
  log.push(`替换 ${n} 处: ${JSON.stringify(from.slice(0, 52))}`);
}

// ── 1. 常量 ───────────────────────────────────────────────────────────────
rep(
  'const WORKSPACE_ROW_HEIGHT_PROPERTY = "--maid-workspace-row-height";',
  'const WORKSPACE_ROW_HEIGHT_PROPERTY = "--maid-workspace-row-height";' + NL +
  '\t\tconst BUBBLE_ALPHA_DEFAULT = 94;' + NL +
  '\t\tconst BUBBLE_ALPHA_MIN = 0;' + NL +
  '\t\tconst BUBBLE_ALPHA_MAX = 100;' + NL +
  '\t\tconst BUBBLE_ALPHA_PROPERTY = "--maid-bubble-alpha";' + NL +
  '\t\tconst CODE_ALPHA_DEFAULT = 97;' + NL +
  '\t\tconst CODE_ALPHA_MIN = 0;' + NL +
  '\t\tconst CODE_ALPHA_MAX = 100;' + NL +
  '\t\tconst CODE_ALPHA_PROPERTY = "--maid-code-alpha";',
  1
);

// ── 2. 夹取辅助函数（仿 workspaceRowHeight） ──────────────────────────────
const anchorFn = 'Math.min(WORKSPACE_ROW_HEIGHT_MAX, Math.max(WORKSPACE_ROW_HEIGHT_MIN, Math.round(value)));' + NL + '\t\t}';
rep(
  anchorFn,
  anchorFn + NL +
  '\t\t/** Clamp a 0-100 percentage; the CSS consumes it as a 0-1 alpha. */' + NL +
  '\t\tfunction maidAlpha(value, fallback) {' + NL +
  '\t\t\tif (typeof value !== "number" || !Number.isFinite(value)) return fallback;' + NL +
  '\t\t\treturn Math.min(100, Math.max(0, Math.round(value))) / 100;' + NL +
  '\t\t}',
  1
);

// ── 3. apply() 接线：写入两个 CSS 变量 ────────────────────────────────────
rep(
  'properties.set(WORKSPACE_ROW_HEIGHT_PROPERTY,',
  'properties.set(BUBBLE_ALPHA_PROPERTY, String(maidAlpha(state.values.bubbleOpacity, BUBBLE_ALPHA_DEFAULT / 100)));' + NL +
  '\t\t\t\tproperties.set(CODE_ALPHA_PROPERTY, String(maidAlpha(state.values.codeOpacity, CODE_ALPHA_DEFAULT / 100)));' + NL +
  '\t\t\t\tproperties.set(WORKSPACE_ROW_HEIGHT_PROPERTY,',
  1
);

// ── 4. 两个设置项：插到 workspaceRowHeight 那个对象之前 ───────────────────
const keyAnchor = 'key: "workspaceRowHeight",';
const keyAt = s.indexOf(keyAnchor);
if (keyAt === -1) throw new Error('找不到 workspaceRowHeight 设置项');
const objStart = s.lastIndexOf('{', keyAt);
if (objStart === -1) throw new Error('找不到设置项起始花括号');

const entry = [
  '{',
  '\t\t\t\t\t\tkey: "bubbleOpacity",',
  '\t\t\t\t\t\ttype: "range",',
  '\t\t\t\t\t\tcontrol: "slider",',
  '\t\t\t\t\t\tlabel: "对话气泡不透明度",',
  '\t\t\t\t\t\tlabelEn: "Conversation bubble opacity",',
  '\t\t\t\t\t\tdescription: "降低后立绘会从消息气泡后透出；100% 为皮肤原样。",',
  '\t\t\t\t\t\tdescriptionEn: "Lower it to let the artwork show through the message bubbles; 100% is the skin default.",',
  '\t\t\t\t\t\tdefaultValue: BUBBLE_ALPHA_DEFAULT,',
  '\t\t\t\t\t\tmin: BUBBLE_ALPHA_MIN,',
  '\t\t\t\t\t\tmax: BUBBLE_ALPHA_MAX,',
  '\t\t\t\t\t\tstep: 1,',
  '\t\t\t\t\t\tunit: "%"',
  '\t\t\t\t\t},',
  '\t\t\t\t\t{',
  '\t\t\t\t\t\tkey: "codeOpacity",',
  '\t\t\t\t\t\ttype: "range",',
  '\t\t\t\t\t\tcontrol: "slider",',
  '\t\t\t\t\t\tlabel: "代码块不透明度",',
  '\t\t\t\t\t\tlabelEn: "Code block opacity",',
  '\t\t\t\t\t\tdescription: "同时影响 md 代码块、read/diff 工具结果块与终端块；100% 为皮肤原样。",',
  '\t\t\t\t\t\tdescriptionEn: "Also affects read/diff tool-result blocks and terminal blocks; 100% is the skin default.",',
  '\t\t\t\t\t\tdefaultValue: CODE_ALPHA_DEFAULT,',
  '\t\t\t\t\t\tmin: CODE_ALPHA_MIN,',
  '\t\t\t\t\t\tmax: CODE_ALPHA_MAX,',
  '\t\t\t\t\t\tstep: 1,',
  '\t\t\t\t\t\tunit: "%"',
  '\t\t\t\t\t},',
  '\t\t\t\t\t',
].join(NL);
s = s.slice(0, objStart) + entry + s.slice(objStart);
log.push('插入设置项 bubbleOpacity + codeOpacity（插在 workspaceRowHeight 之前）');

// ── 5. CSS：气泡 ─────────────────────────────────────────────────────────
rep('background:#f8fafff0;', 'background:rgb(248 250 255/var(--maid-bubble-alpha,.94));', 2);
rep('background:#121f43f0;', 'background:rgb(18 31 67/var(--maid-bubble-alpha,.94));', 2);

// ── 6. CSS：代码块 ───────────────────────────────────────────────────────
rep('--dsw-alias-markdown-code-block:#f9fafdf7;', '--dsw-alias-markdown-code-block:rgb(249 250 253/var(--maid-code-alpha,.97));', 1);
rep('--dsw-alias-markdown-code-block:#0a1430f7;', '--dsw-alias-markdown-code-block:rgb(10 20 48/var(--maid-code-alpha,.97));', 1);

fs.writeFileSync(DST, s, 'utf8');
console.log(log.join('\n'));
console.log(`\n原始 ${fs.statSync(SRC).size} bytes → 输出 ${fs.statSync(DST).size} bytes`);
console.log('输出:', DST);
