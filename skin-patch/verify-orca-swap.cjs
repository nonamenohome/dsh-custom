const fs = require('node:fs');
const s = fs.readFileSync('D:/QYD/dsh-file/skin-patch/orca-client.js.swapped', 'utf8');
const orig = fs.readFileSync('D:/QYD/dsh-file/skin-patch/orca-client.js.orig', 'utf8');

const HAS = {
  LIGHT_HERO: 'd5fdfd91306d2f3aaa766674d5994be4a014c4dd083d6afd7f90b4947bba6802.webp',
  LIGHT_ACTIVE: '3605bdd7ccfcc75ca78558f2c958bb3bb35e544cc705f5c15c3653ca21a274d5.webp',
  DARK_HERO: '5affe6ca90a22227bc020914e4b9d4dc8913a336ffc4a76e17f5b715fa2e0086.webp',
  DARK_ACTIVE: '905f86159587cb4f168fdc78dac8ac8b53e3271d829f78878ddb0c81d0e33747.webp',
};

function urlOf(text, constName) {
  const m = text.match(new RegExp('const ' + constName + ' = skinAssetUrl\\("([^"]+)"\\)'));
  return m ? m[1] : null;
}

console.log('=== 对调前后对比 ===');
let ok = true;
const expect = {
  ORCA_LINK_LIGHT_HERO_ART: HAS.DARK_HERO,
  ORCA_LINK_LIGHT_ACTIVE_ART: HAS.DARK_ACTIVE,
  ORCA_LINK_DARK_HERO_ART: HAS.LIGHT_HERO,
  ORCA_LINK_DARK_ACTIVE_ART: HAS.LIGHT_ACTIVE,
};
for (const [name, want] of Object.entries(expect)) {
  const before = urlOf(orig, name);
  const after = urlOf(s, name);
  const pass = after === want;
  if (!pass) ok = false;
  console.log(`  ${pass ? 'OK  ' : 'FAIL'} ${name}`);
  console.log(`        对调前: ${before ? before.slice(0, 16) + '…' : '(无)'}`);
  console.log(`        对调后: ${after ? after.slice(0, 16) + '…' : '(无)'}`);
}

console.log('\n=== 其它完整性 ===');
const checks = [
  ['占位符残留 @@', (s.match(/@@[ABCD]@@/g) || []).length, 0],
  ['状态图集未被动', urlOf(s, 'ORCA_LINK_STATUS_ATLAS') === urlOf(orig, 'ORCA_LINK_STATUS_ATLAS'), true],
  ['codeOpacity 设置项仍在', s.split('key: "codeOpacity"').length - 1, 1],
  ['代码块 CSS 规则仍在', s.split('var(--orca-code-alpha,100%)').length - 1, 1],
  ['四个资源常量总数', (s.match(/const ORCA_LINK_\w+ = skinAssetUrl\(/g) || []).length, 5],
  ['CRLF / 裸 LF', (s.match(/(?<!\r)\n/g) || []).length, 0],
];
for (const [name, got, want] of checks) {
  const pass = got === want;
  if (!pass) ok = false;
  console.log(`  ${pass ? 'OK  ' : 'FAIL'} ${name}: ${got} (期望 ${want})`);
}
console.log(ok ? '\n>>> 全部通过' : '\n>>> 有未通过项');
