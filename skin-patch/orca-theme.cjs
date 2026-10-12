const fs = require('node:fs');
const s = fs.readFileSync('C:/Users/quyuedi/.dsh/profiles/web/node_modules/@smalltailqwq/dsh-client-ui-skin-orca-link/lib/client.js', 'utf8');

const names = ['ORCA_LINK_LIGHT_HERO_ART', 'ORCA_LINK_LIGHT_ACTIVE_ART',
  'ORCA_LINK_DARK_HERO_ART', 'ORCA_LINK_DARK_ACTIVE_ART',
  'ORCA_LINK_STATUS_ATLAS'];

console.log('=== 各资源常量的引用次数 ===');
for (const n of names) console.log(`  ${n} -> ${s.split(n).length - 1}`);

console.log('\n=== 主题选择逻辑（DARK_HERO / LIGHT_HERO 使用处） ===');
for (const n of ['ORCA_LINK_DARK_HERO_ART', 'ORCA_LINK_LIGHT_HERO_ART']) {
  let i = s.indexOf(n);
  let c = 0;
  while (i !== -1 && c < 3) {
    // 跳过定义处
    const seg = s.slice(Math.max(0, i - 900), i + 400);
    if (!/const ORCA_LINK_DARK_HERO_ART =|const ORCA_LINK_LIGHT_HERO_ART =/.test(seg.slice(-120))) {
      console.log(`\n--- ${n} @${i} ---`);
      console.log(seg.replace(/\r\n/g, '\n'));
      c++;
    }
    i = s.indexOf(n, i + 1);
  }
}

console.log('\n=== 主题/阶段相关属性 ===');
for (const p of ['data-phase', 'orca-art', 'hero', 'active']) {
  console.log(`  ${JSON.stringify(p)} -> ${s.split(p).length - 1}`);
}
