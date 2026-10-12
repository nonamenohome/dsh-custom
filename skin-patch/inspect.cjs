const fs = require('node:fs');
const P = 'D:/QYD/dsh-file/skin-patch/client.js.orig';
const s = fs.readFileSync(P, 'utf8');

const counts = ['#f8fafff0', '#121f43f0', 'WORKSPACE_ROW_HEIGHT_PROPERTY',
  'WORKSPACE_ROW_HEIGHT_DEFAULT', 'WORKSPACE_ROW_HEIGHT_MIN', 'WORKSPACE_ROW_HEIGHT_MAX',
  'key: "workspaceRowHeight"', 'var properties', 'const properties', 'properties.set'];
console.log('=== 计数 ===');
for (const k of counts) console.log(`  ${JSON.stringify(k)} -> ${s.split(k).length - 1}`);

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

show('WORKSPACE_ROW_HEIGHT 常量定义', 'WORKSPACE_ROW_HEIGHT_PROPERTY =', 400, 400, 3);
show('properties 对象定义', 'WORKSPACE_ROW_HEIGHT_MIN', 700, 700, 2);
show('apply 函数', 'function apply(state', 100, 2200, 1);
