/**
 * 核查两个仓库：是不是 DSH 插件、能不能装、装什么。
 */
const https = require('node:https');

function get(u) {
  return new Promise((res, rej) => {
    const req = https.get(u, { headers: { 'User-Agent': 'node', Accept: 'application/vnd.github+json' }, timeout: 25000 }, (r) => {
      let d = '';
      r.setEncoding('utf8');
      r.on('data', (c) => (d += c));
      r.on('end', () => res({ s: r.statusCode, d }));
    });
    req.on('timeout', () => { req.destroy(new Error('timeout')); });
    req.on('error', rej);
  });
}

const REPOS = ['Sakana-yuyu/dsh-plugins', 'darrenprx/lolPing'];

(async () => {
  for (const repo of REPOS) {
    console.log('\n' + '='.repeat(70));
    console.log('仓库:', repo);
    console.log('='.repeat(70));

    let branch = 'main';
    try {
      const r = await get(`https://api.github.com/repos/${repo}`);
      if (r.s !== 200) { console.log('  API HTTP', r.s); continue; }
      const j = JSON.parse(r.d);
      branch = j.default_branch;
      console.log('  描述    :', j.description);
      console.log('  默认分支:', branch);
      console.log('  星数    :', j.stargazers_count);
      console.log('  语言    :', j.language);
      console.log('  许可    :', j.license && j.license.spdx_id);
      console.log('  归档    :', j.archived);
      console.log('  最后推送:', j.pushed_at);
      console.log('  大小    :', j.size, 'KB');
    } catch (e) { console.log('  仓库信息失败:', e.message); continue; }

    // 顶层文件清单
    try {
      const r = await get(`https://api.github.com/repos/${repo}/contents/?ref=${branch}`);
      if (r.s === 200) {
        const items = JSON.parse(r.d);
        console.log('  顶层条目:', items.map((i) => i.name + (i.type === 'dir' ? '/' : '')).join('  '));
      }
    } catch (e) { console.log('  目录失败:', e.message); }

    // package.json
    try {
      const r = await get(`https://api.github.com/repos/${repo}/contents/package.json?ref=${branch}`);
      if (r.s === 200) {
        const j = JSON.parse(r.d);
        const pkg = JSON.parse(Buffer.from(j.content, 'base64').toString('utf8'));
        console.log('\n  --- package.json ---');
        console.log('  name    :', pkg.name);
        console.log('  version :', pkg.version);
        console.log('  license :', pkg.license);
        console.log('  main    :', pkg.main);
        console.log('  dsh     :', JSON.stringify(pkg.dsh));
        console.log('  scripts :', JSON.stringify(pkg.scripts));
        console.log('  deps    :', Object.keys(pkg.dependencies || {}).join(', ') || '(none)');
      } else {
        console.log('\n  package.json: HTTP', r.s, '（可能不是 npm 包）');
      }
    } catch (e) { console.log('  package.json 失败:', e.message); }
  }
})();
