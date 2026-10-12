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

show('--orca-surface 作为背景使用', 'background:var(--orca-surface)', 160, 200, 10);
show('--orca-surface-strong 使用', 'var(--orca-surface-strong)', 160, 160, 8);
show('立绘 / stage', '--orca-stage', 200, 300, 6);
show('character 相关选择器', 'orca-character', 120, 200, 8);
