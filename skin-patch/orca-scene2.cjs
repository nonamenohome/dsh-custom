const fs = require('node:fs');
const s = fs.readFileSync('C:/Users/quyuedi/.dsh/profiles/web/node_modules/@smalltailqwq/dsh-client-ui-skin-orca-link/lib/client.js', 'utf8');

// 场景 CSS 区段：从 _0cMdVG_ 系列类名往前找容器
const at = s.indexOf('lightSceneHero');
console.log('=== 场景 CSS 区段（起点往前 900、往后 1800） ===');
console.log(s.slice(Math.max(0, at - 900), at + 1800).replace(/\r\n/g, '\n'));

console.log('\n=== 容器类名（scene 相关选择器） ===');
const re = /[.#][\w-]*[Ss]cene[\w-]*/g;
const set = new Set();
for (const m of s.matchAll(re)) set.add(m[0]);
console.log([...set].join('\n'));
