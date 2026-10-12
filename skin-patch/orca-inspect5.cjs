const fs = require('node:fs');
const P = 'C:/Users/quyuedi/.dsh/profiles/web/node_modules/@smalltailqwq/dsh-client-ui-skin-orca-link/lib/client.js';
const s = fs.readFileSync(P, 'utf8');

const probes = [
  'const css', 'css$', 'claimedStyles', 'releaseClaimedStyles', 'claimStyles',
  'createElement("style")', "'style'", 'appendChild', 'textContent',
  'style.setProperty', 'documentElement', 'ATTR_', 'const ATTR',
  'dsw-static-neutral-bluish-50', 'dsw-static-neutral-bluish-900',
  'markdown-code-block', 'design-platform',
];
console.log('=== 计数 ===');
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

show('CSS 注入机制', 'claimedStyles', 300, 500, 4);
show('style.setProperty 用法', 'style.setProperty', 200, 200, 6);
