const fs = require('node:fs');
const P = 'C:/Users/quyuedi/.dsh/profiles/web/node_modules/@smalltailqwq/dsh-client-ui-skin-orca-link/lib/client.js';
const s = fs.readFileSync(P, 'utf8');

const probes = [
  'exposeSkinCustomization',
  'settings: [',
  'key: "workspaceRowHeight"',
  'WORKSPACE_ROW_HEIGHT_PROPERTY',
  'WORKSPACE_ROW_HEIGHT_DEFAULT',
  'properties.set(',
  'SkinPropertyProjector',
  'data-maid-character',
  'data-orca-character',
  'assistant-step',
  'div[class*=markdown]',
  '--dsw-alias-markdown-code-block',
  '--dsl-code-block-background',
  '#f8fafff0',
  '#121f43f0',
  '#f9fafdf7',
  '#0a1430f7',
  'data-dsh-orca-link',
];
console.log('=== 计数 ===');
for (const p of probes) console.log(`  ${JSON.stringify(p)} -> ${s.split(p).length - 1}`);

function show(label, needle, before, after, limit = 4) {
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

show('assistant-step markdown 规则', 'assistant-step', 200, 400, 6);
show('代码块变量', '--dsw-alias-markdown-code-block', 260, 260, 4);
show('settings 数组起点', 'settings: [', 60, 300, 1);
show('properties.set 使用', 'properties.set(', 200, 200, 3);
