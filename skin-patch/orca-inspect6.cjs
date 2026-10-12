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

console.log('state.values 出现次数:', s.split('state.values').length - 1);
show('如何应用设置项（state.values）', 'state.values', 400, 400, 6);
show('style 元素注入', 'createElement("style")', 350, 400, 4);
show('exposeSkinCustomization 调用点', 'exposeSkinCustomization({', 200, 260, 2);
