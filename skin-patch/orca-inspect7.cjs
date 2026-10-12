const fs = require('node:fs');
const P = 'C:/Users/quyuedi/.dsh/profiles/web/node_modules/@smalltailqwq/dsh-client-ui-skin-orca-link/lib/client.js';
const s = fs.readFileSync(P, 'utf8');

function show(label, needle, before, after, limit) {
  console.log(`\n########## ${label} ##########`);
  let i = s.indexOf(needle), n = 0;
  while (i !== -1 && n < limit) {
    console.log(`--- @${i} ---`);
    console.log(s.slice(Math.max(0, i - before), i + after).replace(/\r\n/g, '\n'));
    console.log('');
    i = s.indexOf(needle, i + 1); n++;
  }
}

show('createElement("style")', 'createElement("style")', 400, 450, 4);

// 找 CSS 字符串常量
console.log('\n########## CSS 字符串常量 ##########');
for (const m of s.matchAll(/const (css\$?\w*) = "/g)) {
  const at = m.index;
  console.log(`--- @${at}  变量名 ${m[1]} ---`);
  console.log('  开头:', JSON.stringify(s.slice(at, at + 120)));
}

// 找这些 css 变量的使用
console.log('\n########## css 变量被用在哪 ##########');
for (const name of ['css$1', 'css$2', 'css$3', 'css']) {
  const re = new RegExp('(?<![\\w$])' + name.replace('$', '\\$') + '(?![\\w$])', 'g');
  const hits = [...s.matchAll(re)].map((m) => m.index);
  if (hits.length) console.log(`  ${name} -> ${hits.length} 处: ${hits.slice(0, 8).join(', ')}`);
}
