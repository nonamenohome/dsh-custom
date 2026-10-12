const fs = require('node:fs');
const s = fs.readFileSync('D:/QYD/dsh-file/skin-patch/orca-client.js.patched', 'utf8');

function show(label, needle, before, after) {
  const i = s.indexOf(needle);
  console.log(`\n===== ${label} =====`);
  console.log(i === -1 ? '!! 未找到' : s.slice(Math.max(0, i - before), i + after).replace(/\r\n/g, '\n'));
}

show('1. 常量 + 辅助函数', 'const ORCA_CODE_ALPHA_PROPERTY', 40, 430);
show('2. apply 全文（接线 + 清理）', 'const apply = (state) => {', 10, 1250);
show('3. 设置项', 'key: "codeOpacity"', 120, 620);
show('4. CSS 规则（追加在主 CSS 串末尾）', '--orca-code-base', 120, 560);

console.log('\n===== 完整性检查 =====');
const checks = [
  ['ORCA_CODE_ALPHA_PROPERTY 定义+使用', s.split('ORCA_CODE_ALPHA_PROPERTY').length - 1, 3],
  ['orcaCodeAlpha 定义+调用', s.split('orcaCodeAlpha').length - 1, 2],
  ['--orca-code-alpha 引用', s.split('var(--orca-code-alpha,100%)').length - 1, 1],
  ['setProperty 写入', s.split('root.style.setProperty(ORCA_CODE_ALPHA_PROPERTY').length - 1, 1],
  ['removeProperty 清理', s.split('root.style.removeProperty(ORCA_CODE_ALPHA_PROPERTY)').length - 1, 1],
  ['原有 9 个 projector.set 仍在', (s.match(/projector\.set\(/g) || []).length, 9],
  ['data-ds-dark-theme 深色规则', s.split('body[data-dsh-orca-link][data-ds-dark-theme]{--orca-code-base').length - 1, 1],
  ['CRLF 行数', (s.match(/\r\n/g) || []).length, null],
  ['裸 LF', (s.match(/(?<!\r)\n/g) || []).length, 0],
];
let ok = true;
for (const [name, got, want] of checks) {
  const pass = want === null ? true : got === want;
  if (!pass) ok = false;
  console.log(`  ${pass ? 'OK  ' : 'FAIL'} ${name}: ${got}${want === null ? '' : ' (期望 ' + want + ')'}`);
}
console.log(ok ? '\n>>> 全部通过' : '\n>>> 有未通过项');
