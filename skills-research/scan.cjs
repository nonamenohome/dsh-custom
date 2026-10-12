const https = require('node:https');
function get(u) {
  return new Promise((res, rej) => {
    const req = https.get(u, { headers: { 'User-Agent': 'node', Accept: 'application/vnd.github+json' }, timeout: 25000 }, (r) => {
      let d = ''; r.setEncoding('utf8');
      r.on('data', (c) => (d += c));
      r.on('end', () => res({ s: r.statusCode, d }));
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', rej);
  });
}

const REPOS = [
  'finfin/awesome-frontend-skills',
  'ctxr-dev/skill-frontend-excellence',
  'FeatherHunter/dsh-mattpocock-skills-deck',
  'LayneChai/superpowers-dsh',
  'ezra-y/awesome-claude-ui-armory',
];

(async () => {
  for (const repo of REPOS) {
    console.log('\n' + '='.repeat(72));
    console.log(repo);
    console.log('='.repeat(72));
    try {
      const r = await get(`https://api.github.com/repos/${repo}`);
      if (r.s !== 200) { console.log('  API HTTP', r.s); continue; }
      const j = JSON.parse(r.d);
      console.log('  描述:', j.description);
      console.log('  星数:', j.stargazers_count, '| 分支:', j.default_branch, '| 许可:', j.license && j.license.spdx_id, '| 推送:', j.pushed_at && j.pushed_at.slice(0, 10));
    } catch (e) { console.log('  仓库信息失败:', e.message); continue; }

    try {
      const r = await get(`https://api.github.com/repos/${repo}/contents/`);
      if (r.s === 200) {
        const items = JSON.parse(r.d);
        console.log('  顶层:', items.map((i) => i.name + (i.type === 'dir' ? '/' : '')).join('  '));
      }
    } catch (e) { console.log('  目录失败:', e.message); }

    try {
      const r = await get(`https://api.github.com/repos/${repo}/readme`);
      if (r.s === 200) {
        const j = JSON.parse(r.d);
        const txt = Buffer.from(j.content, 'base64').toString('utf8');
        console.log('\n  --- README 前 1600 字 ---');
        console.log(txt.slice(0, 1600).split('\n').map((l) => '  ' + l).join('\n'));
      }
    } catch (e) { console.log('  README 失败:', e.message); }
  }
})();
