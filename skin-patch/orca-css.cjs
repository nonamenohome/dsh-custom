const fs = require('node:fs');
const P = 'C:/Users/quyuedi/.dsh/profiles/web/node_modules/@smalltailqwq/dsh-client-ui-skin-orca-link/lib/client.js';
const s = fs.readFileSync(P, 'utf8');

/** 从 `const name = "` 起，找到未转义的收尾引号。*/
function stringEnd(text, startQuote) {
  let i = startQuote + 1;
  while (i < text.length) {
    const c = text[i];
    if (c === '\\') { i += 2; continue; }
    if (c === '"') return i;
    i++;
  }
  return -1;
}

console.log('=== 所有顶层 CSS 字符串 ===');
const re = /const (css\$?\d*) = "/g;
for (const m of s.matchAll(re)) {
  const openQuote = s.indexOf('"', m.index + m[0].length - 1);
  const end = stringEnd(s, openQuote);
  const body = s.slice(openQuote + 1, end);
  console.log(`\n--- ${m[1]}  @${m.index} ---`);
  console.log('  长度:', body.length);
  console.log('  dsw-alias 覆盖数:', (body.match(/--dsw-alias-/g) || []).length);
  console.log('  orca- 变量数   :', (body.match(/--orca-/g) || []).length);
  console.log('  末尾 120 字符  :', JSON.stringify(body.slice(-120)));
  console.log('  注入用的 tagId :', (() => {
    const after = s.slice(end, end + 400);
    const t = after.match(/const tagId[^=]*= "([^"]+)"/);
    return t ? t[1] : '(紧邻处未找到 tagId)';
  })());
}
