/**
 * 独立复核：用 sharp（libvips）解码，与生成脚本的手写编码器完全无关。
 * 输出每个文件的尺寸、通道数、最大 alpha，并生成棋盘格叠底预览。
 */
const path = require('node:path');
const sharp = require('C:/Users/quyuedi/.dsh/profiles/node_modules/sharp');

const OUT = 'D:/QYD/dsh-file/wx-avatar';
const files = [
  'wx-transparent-640.png',
  'wx-transparent-512.png',
  'wx-transparent-640-black.png',
  'wx-transparent-640-assist.png',
];

async function checkerboard(size, cell) {
  let rects = '';
  for (let y = 0; y < size / cell; y++) {
    for (let x = 0; x < size / cell; x++) {
      const c = (x + y) % 2 ? '#ffffff' : '#cfcfcf';
      rects += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="${c}"/>`;
    }
  }
  return sharp(Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">${rects}</svg>`
  )).png().toBuffer();
}

(async () => {
  const rows = [];
  for (const name of files) {
    const file = path.join(OUT, name);
    const meta = await sharp(file).metadata();

    // 解码为原始 RGBA，统计 alpha 分布
    const { data, info } = await sharp(file)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const hist = new Map();
    for (let i = 3; i < data.length; i += 4) {
      hist.set(data[i], (hist.get(data[i]) ?? 0) + 1);
    }
    const alphas = [...hist.keys()].sort((a, b) => a - b);
    let rgbSeen = new Set();
    for (let i = 0; i < data.length; i += 4) {
      rgbSeen.add(`${data[i]},${data[i + 1]},${data[i + 2]}`);
    }

    rows.push({
      file: name,
      format: meta.format,
      width: meta.width,
      height: meta.height,
      channels: meta.channels,
      hasAlpha: meta.hasAlpha,
      decodedChannels: info.channels,
      alphaValues: alphas,
      maxAlpha: Math.max(...alphas),
      totalPixels: info.width * info.height,
      distinctRgb: [...rgbSeen].join(' | '),
      bytes: require('node:fs').statSync(file).size,
    });
  }

  // 棋盘格预览：白底透明图叠在棋盘上，透明区应露出灰白格子
  const cb = await checkerboard(640, 64);
  await sharp(cb)
    .composite([{ input: path.join(OUT, 'wx-transparent-640.png') }])
    .png()
    .toFile(path.join(OUT, 'preview-checkerboard.png'));

  console.log(JSON.stringify(rows, null, 2));
  console.log('\npreview -> preview-checkerboard.png');
})().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
