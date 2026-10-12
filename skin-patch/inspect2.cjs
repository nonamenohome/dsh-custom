const fs = require('node:fs');
const P = 'D:/QYD/dsh-file/skin-patch/client.js.orig';
const s = fs.readFileSync(P, 'utf8');

function show(label, needle, before, after, limit = 6) {
  console.log(`\n########## ${label} ##########`);
  let i = s.indexOf(needle);
  let n = 0;
  while (i !== -1 && n < limit) {
    console.log(`--- @${i} ---`);
    console.log(s.slice(Math.max(0, i - before), i + after));
    console.log('');
    i = s.indexOf(needle, i + 1);
    n++;
  }
}

show('settings 数组结尾 → apply 方法', 'key: "workspaceRowHeight"', 200, 2600, 1);
show('const properties', 'const properties', 300, 500, 1);
show('#121f43f0 全部', '#121f43f0', 120, 120, 5);
