/**
 * 在女仆皮肤的打包产物里定位 CSS：
 *  - 对话区/面板的背景规则（哪里不透明）
 *  - 立绘定位规则
 *  - 皮肤自定义的 CSS 变量清单
 */
const fs = require('node:fs');

const P = 'C:/Users/quyuedi/.dsh/profiles/web/node_modules/@smalltailqwq/dsh-client-ui-skin-maid-atelier/lib/client.js';
const s = fs.readFileSync(P, 'utf8');

function contexts(needle, before, after, limit) {
  const out = [];
  let i = s.indexOf(needle);
  while (i !== -1 && out.length < limit) {
    out.push(s.slice(Math.max(0, i - before), i + after));
    i = s.indexOf(needle, i + 1);
  }
  return out;
}

console.log('########## 1. 自定义 CSS 变量（--xxx 定义处） ##########');
const varDefs = new Set();
for (const m of s.matchAll(/(--[a-z0-9-]{3,60})\s*:/g)) varDefs.add(m[1]);
console.log([...varDefs].sort().join('\n'));

console.log('\n########## 2. backdrop-filter 上下文 ##########');
contexts('backdrop-filter', 260, 200, 6).forEach((c, n) => {
  console.log(`--- #${n} ---`);
  console.log(c.replace(/\s+/g, ' '));
  console.log('');
});

console.log('\n########## 3. conversation 附近的 background ##########');
contexts('conversation', 200, 260, 10).forEach((c, n) => {
  if (!/background|bg|rgba|opacity|filter/.test(c)) return;
  console.log(`--- #${n} ---`);
  console.log(c.replace(/\s+/g, ' '));
  console.log('');
});
