/**
 * 生成微信头像用的「全透明 PNG」。
 *
 * 设计要点：
 * - 颜色类型 6（RGBA），位深 8，无隔行，filter=0，直接用 zlib 压缩。
 * - 全透明图的 RGB 值其实被 alpha 掩盖，但「不遵守 alpha」的粗糙渲染器
 *   会把 RGB 当不透明色显示。所以这里提供两种底：
 *     · 白底透明 RGBA(255,255,255,0) —— 推荐，兜底时显示白色（贴近聊天背景）
 *     · 黑底透明 RGBA(0,0,0,0)      —— 纯正变体
 * - 另出一个「定位辅助版」alpha=16，方便在裁剪框里看清图块位置，
 *   它不是最终成品（有极淡可见度）。
 */
import { deflateSync, inflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync, statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'D:/QYD/dsh-file/wx-avatar';
mkdirSync(OUT, { recursive: true });

const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const crcTable = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}

function makePng(size, [r, g, b], alpha) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: truecolour + alpha
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // adaptive filtering, row filter 0
  ihdr[12] = 0; // no interlace

  const stride = 1 + size * 4;
  const row = Buffer.alloc(stride);
  row[0] = 0; // filter type "None"
  for (let x = 0; x < size; x++) {
    const o = 1 + x * 4;
    row[o] = r;
    row[o + 1] = g;
    row[o + 2] = b;
    row[o + 3] = alpha;
  }
  const raw = Buffer.alloc(stride * size);
  for (let y = 0; y < size; y++) row.copy(raw, y * stride);

  return Buffer.concat([
    PNG_SIG,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** 独立复核：重新解析字节流，确认尺寸/色彩类型，并统计 alpha 分布。 */
function audit(file) {
  const buf = readFileSync(file);
  if (!buf.subarray(0, 8).equals(PNG_SIG)) throw new Error(`${file}: 不是 PNG`);

  let off = 8;
  let width = 0, height = 0, depth = 0, colour = 0, interlace = -1;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    const want = buf.readUInt32BE(off + 8 + len);
    const got = crc32(buf.subarray(off + 4, off + 8 + len));
    if (want !== got) throw new Error(`${file}: ${type} CRC 校验失败`);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      depth = data[8];
      colour = data[9];
      interlace = data[12];
    }
    if (type === 'IDAT') idat.push(data);
    off += 12 + len;
  }

  const raw = inflateSync(Buffer.concat(idat));
  const stride = 1 + width * 4;
  const hist = new Map();
  for (let y = 0; y < height; y++) {
    if (raw[y * stride] !== 0) throw new Error(`${file}: 意外的行 filter`);
    for (let x = 0; x < width; x++) {
      const a = raw[y * stride + 1 + x * 4 + 3];
      hist.set(a, (hist.get(a) ?? 0) + 1);
    }
  }
  return {
    file, width, height, depth, colour, interlace,
    alphaValues: [...hist.keys()].sort((p, q) => p - q),
    opaquePixels: (hist.get(255) ?? 0),
    bytes: buf.length,
    sizeOnDisk: statSync(file).size,
  };
}

const jobs = [
  ['wx-transparent-640.png', 640, [255, 255, 255], 0, '白底全透明（推荐）'],
  ['wx-transparent-512.png', 512, [255, 255, 255], 0, '白底全透明，512 备选'],
  ['wx-transparent-640-black.png', 640, [0, 0, 0], 0, '黑底全透明'],
  ['wx-transparent-640-assist.png', 640, [0, 0, 0], 16, '定位辅助版 alpha=16（非成品）'],
];

const report = [];
for (const [name, size, rgb, alpha, note] of jobs) {
  const file = join(OUT, name);
  writeFileSync(file, makePng(size, rgb, alpha));
  report.push({ ...audit(file), rgba: `rgb(${rgb.join(',')}) a=${alpha}`, note });
}

console.log(JSON.stringify(report, null, 2));
