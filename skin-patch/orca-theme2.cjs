const fs = require('node:fs');
const s = fs.readFileSync('C:/Users/quyuedi/.dsh/profiles/web/node_modules/@smalltailqwq/dsh-client-ui-skin-orca-link/lib/client.js', 'utf8');

console.log('=== 四个属性名定义 ===');
const propNames = {};
for (const n of ['LIGHT_HERO_ART_PROPERTY', 'LIGHT_ACTIVE_ART_PROPERTY', 'DARK_HERO_ART_PROPERTY', 'DARK_ACTIVE_ART_PROPERTY']) {
  const m = s.match(new RegExp('const ' + n + ' = "([^"]+)"'));
  propNames[n] = m ? m[1] : null;
  console.log('  ' + n + ' = ' + (m ? m[1] : '(未找到)'));
}

console.log('\n=== CSS 里如何消费（看主题/阶段条件） ===');
for (const v of Object.values(propNames)) {
  if (!v) continue;
  let i = s.indexOf('var(' + v + ')');
  let c = 0;
  while (i !== -1 && c < 2) {
    console.log('--- ' + v + ' @' + i + ' ---');
    console.log(s.slice(Math.max(0, i - 460), i + 90).replace(/\r\n/g, '\n'));
    console.log('');
    i = s.indexOf('var(' + v + ')', i + 1);
    c++;
  }
}
