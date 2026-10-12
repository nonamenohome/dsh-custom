const fs = require('node:fs');
const D = 'C:/Users/quyuedi/.dsh/profiles/web/node_modules/@smalltailqwq/dsh-client-ui-skin-orca-link/';
const s = fs.readFileSync(D + 'lib/client.js', 'utf8');
const h = fs.readFileSync(D + 'lib/index.js', 'utf8');

const probes = ['backgroundImage', 'skin-assets', 'data-skin-chrome=character-stage',
  'background-image', 'new Image', 'src =', 'setAttribute("src"', 'dark', 'theme'];
console.log('=== client.js 计数 ===');
for (const p of probes) {
  const n = s.split(p).length - 1;
  if (n > 0) console.log(`  ${JSON.stringify(p)} -> ${n}`);
}

function show(label, needle, before, after, limit) {
  console.log(`\n########## ${label} ##########`);
  let i = s.indexOf(needle), n = 0;
  while (i !== -1 && n < limit) {
    console.log(`--- @${i} ---`);
    console.log(s.slice(Math.max(0, i - before), i + after).replace(/\r\n/g, '\n'));
    console.log('');
    i = s.indexOf(needle, i + 1); n++;
  }
}

show('backgroundImage 用法', 'backgroundImage', 300, 320, 6);

console.log('\n=== index.js（宿主侧）计数 ===');
for (const p of ['skin-assets', 'webp', 'png', 'manifest']) {
  console.log(`  ${JSON.stringify(p)} -> ${h.split(p).length - 1}`);
}
