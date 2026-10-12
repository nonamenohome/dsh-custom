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
    i = s.indexOf(needle, i + 1);
    n++;
  }
}

// 使用处（第 2 次出现）
const first = s.indexOf('WORKSPACE_ROW_HEIGHT_PROPERTY');
const second = s.indexOf('WORKSPACE_ROW_HEIGHT_PROPERTY', first + 1);
console.log('=== WORKSPACE_ROW_HEIGHT_PROPERTY 使用处 @' + second + ' ===');
console.log(s.slice(second - 900, second + 500));

show('apply 函数定义（function apply）', 'function apply', 120, 1500, 3);
show('apply 的其它形态', 'apply(state)', 150, 1200, 3);
