const fs = require('node:fs');
const P = 'C:/Users/quyuedi/.dsh/profiles/web/node_modules/@smalltailqwq/dsh-client-ui-skin-orca-link/lib/client.js';
const s = fs.readFileSync(P, 'utf8');

// 1. 它覆盖了哪些 dsw 主题变量
const dswVars = new Set();
for (const m of s.matchAll(/(--dsw-[a-z0-9-]+)\s*:/g)) dswVars.add(m[1]);
console.log('===== orca-link 覆盖的 --dsw-* 变量 (' + dswVars.size + ') =====');
console.log([...dswVars].sort().join('\n'));

// 2. 它自定义的 --orca-* 变量名
const orcaVars = new Set();
for (const m of s.matchAll(/(--orca-[a-z0-9-]+)\s*:/g)) orcaVars.add(m[1]);
console.log('\n===== orca-link 定义的 --orca-* 变量 (' + orcaVars.size + ') =====');
console.log([...orcaVars].sort().join('\n'));

// 3. bubble 相关上下文
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
show('bubble 上下文', 'bubble', 200, 260, 8);
show('角色立绘容器', 'data-orca-character', 150, 350, 4);
