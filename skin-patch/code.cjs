const fs = require('node:fs');
const s = fs.readFileSync('D:/QYD/dsh-file/skin-patch/client.js.orig', 'utf8');

const probes = [
  '--dsw-alias-markdown-code-block',
  '--dsl-code-block-background',
  '#f9fafdf7',
  '#0a1430f7',
  'md-code-block',
  'data-read',
  'data-diff',
  'data-terminal',
];
console.log('=== 计数（原版） ===');
for (const p of probes) console.log(`  ${JSON.stringify(p)} -> ${s.split(p).length - 1}`);

function show(label, needle, before, after, limit = 8) {
  console.log(`\n########## ${label} ##########`);
  let i = s.indexOf(needle);
  let n = 0;
  while (i !== -1 && n < limit) {
    console.log(`--- @${i} ---`);
    console.log(s.slice(Math.max(0, i - before), i + after).replace(/\r\n/g, '\n'));
    console.log('');
    i = s.indexOf(needle, i + 1);
    n++;
  }
}

show('代码块变量：定义与使用', '--dsw-alias-markdown-code-block', 300, 420, 8);
