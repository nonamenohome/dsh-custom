const fs = require('node:fs');
const s = fs.readFileSync('D:/QYD/dsh-file/skin-patch/orca-client.js.v2', 'utf8');
const orig = fs.readFileSync('D:/QYD/dsh-file/skin-patch/orca-client.js.orig', 'utf8');

function show(label, needle, before, after) {
  const i = s.indexOf(needle);
  console.log(`\n===== ${label} =====`);
  console.log(i === -1 ? '!! 未找到' : s.slice(Math.max(0, i - before), i + after).replace(/\r\n/g, '\n'));
}

show('常量 + 辅助函数', 'const ORCA_CODE_ALPHA_PROPERTY', 30, 620);
show('apply 接线', 'root.style.setProperty(ORCA_CODE_ALPHA_PROPERTY', 120, 400);
show('设置项 ×2', 'key: "codeOpacity"', 100, 1150);
show('滤镜（浅色，带亮度变量）', 'filter:brightness(var(--orca-light-brightness,100%))', 150, 160);

console.log('\n===== 完整性检查 =====');
const checks = [
  ['浅色滤镜含亮度变量', s.split('filter:brightness(var(--orca-light-brightness,100%))saturate(.9)contrast(.98)').length - 1, 5],
  ['深色滤镜未被污染', s.split('brightness(.88)saturate(.74)contrast(1.05)').length - 1,
    orig.split('brightness(.88)saturate(.74)contrast(1.05)').length - 1],
  ['残留裸浅色滤镜', s.split('filter:saturate(.9)contrast(.98)').length - 1, 0],
  ['orcaPercent 定义+调用', s.split('orcaPercent').length - 1, 3],
  ['代码块 CSS 规则', s.split('var(--orca-code-alpha,100%)').length - 1, 1],
  ['lightBrightness 设置项', s.split('key: "lightBrightness"').length - 1, 1],
  ['两个属性都在 null 分支清理', (s.match(/root\.style\.removeProperty\(/g) || []).length, 2],
  ['两个属性都被写入', (s.match(/root\.style\.setProperty\(/g) || []).length, 2],
  ['资源常量总数仍为 5', (s.match(/const ORCA_LINK_\w+ = skinAssetUrl\(/g) || []).length, 5],
  ['占位符残留', (s.match(/@@[ABCD]@@/g) || []).length, 0],
  ['CRLF / 裸 LF', (s.match(/(?<!\r)\n/g) || []).length, 0],
];
let ok = true;
for (const [name, got, want] of checks) {
  const pass = got === want;
  if (!pass) ok = false;
  console.log(`  ${pass ? 'OK  ' : 'FAIL'} ${name}: ${got} (期望 ${want})`);
}

// 对调仍然正确
const want = {
  ORCA_LINK_LIGHT_HERO_ART: '5affe6ca90a22227bc020914e4b9d4dc8913a336ffc4a76e17f5b715fa2e0086.webp',
  ORCA_LINK_DARK_HERO_ART: 'd5fdfd91306d2f3aaa766674d5994be4a014c4dd083d6afd7f90b4947bba6802.webp',
};
for (const [n, w] of Object.entries(want)) {
  const m = s.match(new RegExp('const ' + n + ' = skinAssetUrl\\("([^"]+)"\\)'));
  const pass = m && m[1] === w;
  if (!pass) ok = false;
  console.log(`  ${pass ? 'OK  ' : 'FAIL'} 对调仍生效 ${n}`);
}
console.log(ok ? '\n>>> 全部通过' : '\n>>> 有未通过项');
