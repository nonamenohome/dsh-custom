/**
 * 扫描截图，定位对话面板边界与半透明遮罩。
 * 原图 2781x1507（预览 1764x956，比例约 1.5765）。
 */
const path = require('node:path');
const fs = require('node:fs');
const sharp = require('C:/Users/quyuedi/.dsh/profiles/node_modules/sharp');

const SRC = process.argv[2];
const OUT = 'D:/QYD/dsh-file/skin-analysis';
const local = path.join(OUT, 'shot.jpg');
fs.copyFileSync(SRC, local);

(async () => {
  const meta = await sharp(local).metadata();
  console.log('尺寸:', meta.width, 'x', meta.height);

  const { data, info } = await sharp(local)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const W = info.width;
  const C = info.channels;

  const px = (x, y) => {
    const i = (y * W + x) * C;
    return [data[i], data[i + 1], data[i + 2]];
  };
  const hex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');

  // 横向扫描：找面板左右边界
  for (const y of [200, 400, 700, 1000, 1300]) {
    const row = [];
    for (let x = 400; x < W - 100; x += 40) row.push(`${x}:${hex(px(x, y))}`);
    console.log(`\n--- 横扫 y=${y} ---`);
    console.log(row.join(' '));
  }

  // 纵向扫描：穿过左侧女仆，看是否有阶跃
  console.log('\n--- 纵扫 x=600（穿过左女仆?） ---');
  const col = [];
  for (let y = 100; y < info.height - 50; y += 50) col.push(`${y}:${hex(px(600, y))}`);
  console.log(col.join(' '));

  console.log('\n--- 纵扫 x=1000（面板内） ---');
  const col2 = [];
  for (let y = 100; y < info.height - 50; y += 50) col2.push(`${y}:${hex(px(1000, y))}`);
  console.log(col2.join(' '));
})();
