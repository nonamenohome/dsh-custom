const fs = require('node:fs');
const P = 'C:/Users/quyuedi/.dsh/profiles/web/node_modules/@smalltailqwq/dsh-client-ui-skin-orca-link/lib/client.js';
const s = fs.readFileSync(P, 'utf8');

// 1. settings 数组全文
const si = s.indexOf('settings: [');
const arrStart = s.indexOf('[', si);
function matchBracket(text, start) {
  const open = text[start];
  const close = open === '[' ? ']' : open === '{' ? '}' : ')';
  let depth = 0, i = start, mode = null;
  while (i < text.length) {
    const c = text[i], n = text[i + 1];
    if (mode === '//') { if (c === '\n') mode = null; i++; continue; }
    if (mode === '/*') { if (c === '*' && n === '/') { mode = null; i += 2; continue; } i++; continue; }
    if (mode) { if (c === '\\') { i += 2; continue; } if (c === mode) mode = null; i++; continue; }
    if (c === '/' && n === '/') { mode = '//'; i += 2; continue; }
    if (c === '/' && n === '*') { mode = '/*'; i += 2; continue; }
    if (c === "'" || c === '"' || c === '`') { mode = c; i++; continue; }
    if (c === open) depth++;
    else if (c === close) { depth--; if (depth === 0) return i; }
    i++;
  }
  return -1;
}
const arrEnd = matchBracket(s, arrStart);
console.log('===== settings 数组（共 ' + (arrEnd - arrStart) + ' 字符）=====');
console.log(s.slice(arrStart, arrEnd + 1).replace(/\r\n/g, '\n'));

// 2. apply 方法（settings 之后）
const after = s.slice(arrEnd, arrEnd + 700).replace(/\r\n/g, '\n');
console.log('\n===== settings 之后 =====');
console.log(after);

// 3. 关键变量与机制
console.log('\n===== 机制线索 =====');
for (const p of ['setProperty(', 'style.setProperty', 'documentElement.style', 'data-orca-', 'ATTR_',
  'bubble', 'Bubble', 'markdown', 'Markdown', '--orca-']) {
  const n = s.split(p).length - 1;
  if (n > 0) console.log(`  ${JSON.stringify(p)} -> ${n}`);
}
