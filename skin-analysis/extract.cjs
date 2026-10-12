/**
 * 提取女仆皮肤的完整 settings 数组 + apply() 主体 + 对话区背景相关 CSS。
 */
const fs = require('node:fs');

const P = 'C:/Users/quyuedi/.dsh/profiles/web/node_modules/@smalltailqwq/dsh-client-ui-skin-maid-atelier/lib/client.js';
const s = fs.readFileSync(P, 'utf8');

/** 从 open 处的括号开始，找到配对的收尾括号（跳过字符串/模板串/注释）。 */
function matchBracket(text, start) {
  const open = text[start];
  const close = open === '[' ? ']' : open === '{' ? '}' : ')';
  let depth = 0;
  let i = start;
  let mode = null; // null | "'" | '"' | '`' | '//' | '/*'
  while (i < text.length) {
    const c = text[i];
    const n = text[i + 1];
    if (mode === '//') { if (c === '\n') mode = null; i++; continue; }
    if (mode === '/*') { if (c === '*' && n === '/') { mode = null; i += 2; continue; } i++; continue; }
    if (mode) {
      if (c === '\\') { i += 2; continue; }
      if (c === mode) mode = null;
      i++; continue;
    }
    if (c === '/' && n === '/') { mode = '//'; i += 2; continue; }
    if (c === '/' && n === '*') { mode = '/*'; i += 2; continue; }
    if (c === "'" || c === '"' || c === '`') { mode = c; i++; continue; }
    if (c === open) depth++;
    else if (c === close) { depth--; if (depth === 0) return i; }
    i++;
  }
  return -1;
}

// ---- 1. settings 数组 ----
const si = s.indexOf('settings: [');
if (si === -1) { console.log('settings array NOT FOUND'); process.exit(1); }
const arrStart = s.indexOf('[', si);
const arrEnd = matchBracket(s, arrStart);
const settingsSrc = s.slice(arrStart, arrEnd + 1);

console.log('=== settings 源文本长度:', settingsSrc.length, '===');
console.log(settingsSrc);
console.log('');

// ---- 2. 已有的 range 设置 ----
const ri = settingsSrc.indexOf('type: "range"');
if (ri !== -1) {
  console.log('=== 已存在的 range 设置（范例） ===');
  console.log(settingsSrc.slice(Math.max(0, ri - 250), ri + 500));
  console.log('');
}

// ---- 3. apply 主体 ----
const ai = s.indexOf('apply(state', arrEnd);
if (ai !== -1) {
  const braceStart = s.indexOf('{', ai);
  const braceEnd = matchBracket(s, braceStart);
  console.log('=== apply() 主体 ===');
  console.log(s.slice(ai, Math.min(braceEnd + 1, ai + 2600)));
  console.log('');
}
