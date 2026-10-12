const https = require('node:https');
function get(u) {
  return new Promise((res, rej) => {
    const req = https.get(u, { headers: { 'User-Agent': 'node', Accept: 'application/vnd.github+json' }, timeout: 25000 }, (r) => {
      if ([301, 302, 307, 308].includes(r.statusCode) && r.headers.location) {
        r.resume(); return res(get(new URL(r.headers.location, u).toString()));
      }
      let d = ''; r.setEncoding('utf8');
      r.on('data', (c) => (d += c));
      r.on('end', () => res({ s: r.statusCode, d }));
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', rej);
  });
}

(async () => {
  const repo = 'vercel-labs/skills';
  console.log('=== 仓库信息 ===');
  try {
    const r = await get(`https://api.github.com/repos/${repo}`);
    if (r.s === 200) {
      const j = JSON.parse(r.d);
      console.log('  描述:', j.description);
      console.log('  星数:', j.stargazers_count, '| 分支:', j.default_branch, '| 许可:', j.license && j.license.spdx_id);
      console.log('  推送:', j.pushed_at);
    } else console.log('  HTTP', r.s);
  } catch (e) { console.log('  ERR', e.message); }

  console.log('\n=== 顶层目录 ===');
  try {
    const r = await get(`https://api.github.com/repos/${repo}/contents/`);
    if (r.s === 200) {
      const items = JSON.parse(r.d);
      console.log('  ' + items.map((i) => i.name + (i.type === 'dir' ? '/' : '')).join('  '));
    } else console.log('  HTTP', r.s);
  } catch (e) { console.log('  ERR', e.message); }

  console.log('\n=== 找 find-skills ===');
  for (const path of ['skills/find-skills', 'find-skills', 'skills']) {
    try {
      const r = await get(`https://api.github.com/repos/${repo}/contents/${path}`);
      if (r.s === 200) {
        const items = JSON.parse(r.d);
        console.log(`  [${path}]`);
        items.forEach((i) => console.log(`     ${i.type === 'dir' ? 'DIR ' : 'FILE'} ${i.name}  ${i.size || ''}`));
      } else console.log(`  [${path}] HTTP ${r.s}`);
    } catch (e) { console.log(`  [${path}] ERR ${e.message}`); }
  }
})();
