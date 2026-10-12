const fs = require('node:fs');
const s = fs.readFileSync('D:/QYD/dsh-file/skin-patch/client.js.patched', 'utf8');

function show(label, needle, before, after) {
  const i = s.indexOf(needle);
  console.log(`\n===== ${label} =====`);
  console.log(i === -1 ? '!! 未找到' : s.slice(Math.max(0, i - before), i + after).replace(/\r\n/g, '\n'));
}

show('常量', 'const BUBBLE_ALPHA_DEFAULT', 40, 330);
show('辅助函数', 'function maidAlpha', 30, 240);
show('apply 接线', 'properties.set(BUBBLE_ALPHA_PROPERTY', 40, 300);
show('设置项 2 个', 'key: "bubbleOpacity"', 120, 900);
show('CSS 代码块（浅）', '--dsw-alias-markdown-code-block:rgb(249', 60, 130);
show('CSS 代码块（深）', '--dsw-alias-markdown-code-block:rgb(10', 60, 130);

console.log('\n===== 残留 / 完整性 =====');
const checks = [
  ['残留 #f8fafff0', s.split('#f8fafff0').length - 1, 0],
  ['残留 #f9fafdf7', s.split('#f9fafdf7').length - 1, 0],
  ['残留 #0a1430f7', s.split('#0a1430f7').length - 1, 0],
  ['残留 background:#121f43f0;', s.split('background:#121f43f0;').length - 1, 0],
  ['--maid-bubble-alpha 使用', s.split('var(--maid-bubble-alpha,.94)').length - 1, 4],
  ['--maid-code-alpha 使用', s.split('var(--maid-code-alpha,.97)').length - 1, 2],
  ['保留 --dsw-alias-bg-layer-1:#121f43f0;', s.split('--dsw-alias-bg-layer-1:#121f43f0;').length - 1, 1],
  ['maidAlpha 调用', s.split('maidAlpha(').length - 1, 3],
  ['CRLF 行数', (s.match(/\r\n/g) || []).length, null],
  ['裸 LF', (s.match(/(?<!\r)\n/g) || []).length, 0],
];
let ok = true;
for (const [name, got, want] of checks) {
  const pass = want === null ? true : got === want;
  if (!pass) ok = false;
  console.log(`  ${pass ? 'OK  ' : 'FAIL'} ${name}: ${got}${want === null ? '' : ' (期望 ' + want + ')'}`);
}
console.log(ok ? '\n>>> 全部检查通过' : '\n>>> 有检查未通过');
