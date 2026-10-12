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

console.log('########## f8fafff0 的全部出现 ##########');
for (const [at, c] of all('f8fafff0', 700, 500, 10)) {
  console.log(`--- @${at} ---`);
  console.log(c.replace(/\s+/g, ' '));
  console.log('');
}

console.log('\n########## 皮肤 CSS 里 markdown 相关规则 ##########');
for (const [at, c] of all('markdown', 260, 420, 20)) {
  console.log(`--- @${at} ---`);
  console.log(c.replace(/\s+/g, ' '));
  console.log('');
}
