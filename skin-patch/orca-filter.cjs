const fs = require('node:fs');
const s = fs.readFileSync('D:/QYD/dsh-file/skin-patch/orca-client.js.orig', 'utf8');

const probes = ['saturate(.9)contrast(.98)', 'brightness(.88)saturate(.74)contrast(1.05)',
  'lightSceneLayer', 'lightSceneHero', 'lightSceneActive',
  'darkSceneLayer', 'darkSceneHero', 'darkSceneActive'];
console.log('=== 计数 ===');
for (const p of probes) console.log(`  ${JSON.stringify(p)} -> ${s.split(p).length - 1}`);

console.log('\n=== 浅色系所有滤镜声明（含上下文） ===');
let i = s.indexOf('saturate(.9)contrast(.98)');
let n = 0;
while (i !== -1) {
  n++;
  console.log(`--- #${n} @${i} ---`);
  // 往前找所属选择器
  const start = s.lastIndexOf('}', i);
  console.log(s.slice(start + 1, i + 90).replace(/\r\n/g, '\n'));
  i = s.indexOf('saturate(.9)contrast(.98)', i + 1);
}
console.log('\n浅色滤镜声明总数:', n);
