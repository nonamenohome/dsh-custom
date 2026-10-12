const fs = require('node:fs');
const P = 'C:/Users/quyuedi/.dsh/profiles/web/node_modules/@smalltailqwq/dsh-client-ui-skin-orca-link/lib/client.js';
const s = fs.readFileSync(P, 'utf8');

// 1. 资源清单
const M = 'C:/Users/quyuedi/.dsh/profiles/web/node_modules/@smalltailqwq/dsh-client-ui-skin-orca-link/assets/runtime/manifest.json';
try {
  const files = JSON.parse(fs.readFileSync(M, 'utf8'));
  console.log('===== assets/runtime/manifest.json (' + files.length + ' 个) =====');
  console.log(files.join('\n'));
} catch (e) { console.log('manifest 读取失败:', e.message); }

// 2. 值为 url() 的自定义变量
console.log('\n===== 内含 url(...) 的 --orca-* / --dsw-* 变量定义 =====');
const re = /(--[a-z0-9-]+)\s*:\s*([^;}]*url\([^;}]*)/gi;
const seen = new Set();
for (const m of s.matchAll(re)) {
  const key = m[1] + ' = ' + m[2].slice(0, 90);
  if (seen.has(key)) continue;
  seen.add(key);
  console.log('  ' + m[1] + ' = ' + m[2].slice(0, 110));
}

// 3. 深色主题下改动的 background-image
console.log('\n===== 深色主题规则里出现 background-image / url( 的 =====');
let i = s.indexOf('data-ds-dark-theme');
let n = 0;
while (i !== -1 && n < 40) {
  const seg = s.slice(i, i + 700);
  if (/background-image|url\(/.test(seg)) {
    console.log(`--- @${i} ---`);
    console.log(seg.slice(0, 380).replace(/\r\n/g, '\n'));
    console.log('');
    n++;
  }
  i = s.indexOf('data-ds-dark-theme', i + 1);
}
if (n === 0) console.log('  （深色规则里没有 background-image/url，说明背景图不分主题）');
