const fs = require('node:fs');
const s = fs.readFileSync('C:/Users/quyuedi/.dsh/profiles/web/node_modules/@smalltailqwq/dsh-client-ui-skin-orca-link/lib/client.js', 'utf8');

console.log('=== installOrcaScene / 场景挂载点 ===');
const i = s.indexOf('function installOrcaScene');
if (i !== -1) console.log(s.slice(i, i + 2100).replace(/\r\n/g, '\n'));
else console.log('未找到 installOrcaScene');

console.log('\n=== 场景类名出现处 ===');
for (const n of ['lightSceneHero', 'darkSceneHero', 'SceneHero', 'scene']) {
  console.log(`  ${JSON.stringify(n)} -> ${s.split(n).length - 1}`);
}
