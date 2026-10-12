const fs = require('node:fs');
const P = 'C:/Users/quyuedi/.dsh/profiles/web/node_modules/@smalltailqwq/dsh-client-ui-skin-orca-link/lib/client.js';
const s = fs.readFileSync(P, 'utf8');

function matchBracket(text, start) {
  const open = text[start], close = open === '[' ? ']' : open === '{' ? '}' : ')';
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

// 1. installOrcaCustomization 全文
const fnStart = s.indexOf('function installOrcaCustomization');
const braceStart = s.indexOf('{', fnStart);
const braceEnd = matchBracket(s, braceStart);
console.log('===== installOrcaCustomization 全文（' + (braceEnd - fnStart) + ' 字符）=====');
console.log(s.slice(fnStart, braceEnd + 1).replace(/\r\n/g, '\n'));

// 2. 深色主题选择器
console.log('\n===== data-ds-dark-theme 用法 =====');
let i = s.indexOf('data-ds-dark-theme'), n = 0;
while (i !== -1 && n < 3) {
  console.log('--- @' + i + ' ---');
  console.log(s.slice(Math.max(0, i - 90), i + 90).replace(/\r\n/g, '\n'));
  i = s.indexOf('data-ds-dark-theme', i + 1); n++;
}
console.log('总出现次数:', s.split('data-ds-dark-theme').length - 1);

// 3. css 主串结尾唯一性
const tail = '[class$=_cardId]{color:var(--orca-muted)}';
console.log('\n主 CSS 串结尾锚点出现次数:', s.split(tail).length - 1);
