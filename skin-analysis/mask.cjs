/**
 * 定位：遮罩层变量定义、立绘定位规则、玻璃变量。
 */
const fs = require('node:fs');

const P = 'C:/Users/quyuedi/.dsh/profiles/web/node_modules/@smalltailqwq/dsh-client-ui-skin-maid-atelier/lib/client.js';
const s = fs.readFileSync(P, 'utf8');

function all(needle, before, after, limit = 20) {
  const out = [];
  let i = s.indexOf(needle);
  while (i !== -1 && out.length < limit) {
    out.push([i, s.slice(Math.max(0, i - before), i + after)]);
    i = s.indexOf(needle, i + 1);
  }
  return out;
}

console.log('########## --maid-reading-surface 的定义与使用 ##########');
for (const [at, c] of all('--maid-reading-surface', 320, 320, 12)) {
  console.log(`--- @${at} ---`);
  console.log(c.replace(/\s+/g, ' '));
  console.log('');
}

console.log('\n########## --maid-glass 的定义 ##########');
for (const [at, c] of all('--maid-glass:', 400, 260, 8)) {
  console.log(`--- @${at} ---`);
  console.log(c.replace(/\s+/g, ' '));
  console.log('');
}

console.log('\n########## data-maid-character 规则（定位/尺寸） ##########');
for (const [at, c] of all('[data-maid-character]', 60, 400, 14)) {
  if (!/(left|right|width|height|position|inset|transform|z-index)/.test(c)) continue;
  console.log(`--- @${at} ---`);
  console.log(c.replace(/\s+/g, ' '));
  console.log('');
}
