/**
 * 分析女仆皮肤的 client.js：找出设置声明、可用的 CSS 变量、以及对话区背景所在。
 */
const fs = require('node:fs');

const P = 'C:/Users/quyuedi/.dsh/profiles/web/node_modules/@smalltailqwq/dsh-client-ui-skin-maid-atelier/lib/client.js';
const s = fs.readFileSync(P, 'utf8');

console.log('length =', s.length, ' lines =', s.split('\n').length);
console.log('');

const probes = [
  'exposeSkinCustomization',
  'skin-customization',
  'opacity',
  '不透明度',
  'type:"range"',
  'type: "range"',
  'type:"color"',
  'type:"boolean"',
  'type:"select"',
  'defaultValue',
  'visibleWhen',
  'data-dsh-maid-atelier',
  'conversation',
  'Conversation',
  'rgba(',
  'backdrop-filter',
];

for (const p of probes) {
  const n = s.split(p).length - 1;
  if (n > 0) console.log(`  ${JSON.stringify(p)} -> ${n}`);
}

console.log('');
console.log('=== 上下文：exposeSkinCustomization ===');
let i = s.indexOf('exposeSkinCustomization');
let shown = 0;
while (i !== -1 && shown < 3) {
  console.log('--- at', i, '---');
  console.log(s.slice(Math.max(0, i - 300), i + 900).replace(/\s+/g, ' '));
  console.log('');
  i = s.indexOf('exposeSkinCustomization', i + 1);
  shown++;
}

console.log('=== 上下文：defaultValue（前 4 处） ===');
i = s.indexOf('defaultValue');
shown = 0;
while (i !== -1 && shown < 4) {
  console.log('--- at', i, '---');
  console.log(s.slice(Math.max(0, i - 400), i + 400).replace(/\s+/g, ' '));
  console.log('');
  i = s.indexOf('defaultValue', i + 1);
  shown++;
}
