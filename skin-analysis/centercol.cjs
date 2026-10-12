const fs = require('node:fs');
const P = 'C:/Users/quyuedi/.dsh/profiles/web/node_modules/@smalltailqwq/dsh-client-ui-skin-maid-atelier/lib/client.js';
const s = fs.readFileSync(P, 'utf8');

function all(needle, before, after, limit = 30) {
  const out = [];
  let i = s.indexOf(needle);
  while (i !== -1 && out.length < limit) {
    out.push([i, s.slice(Math.max(0, i - before), i + after)]);
    i = s.indexOf(needle, i + 1);
  }
  return out;
}

for (const needle of ['centerCol', 'data-maid-panel-page', 'data-slot=main', 'reading-surface']) {
  const hits = all(needle, 300, 300, 30);
  console.log(`\n########## ${needle}  (${hits.length} 处) ##########`);
  for (const [at, c] of hits) {
    console.log(`--- @${at} ---`);
    console.log(c.replace(/\s+/g, ' '));
  }
}
