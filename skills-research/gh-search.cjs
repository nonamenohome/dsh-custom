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

const QUERIES = [
  ['topic:agent-skills', 'topic:agent-skills'],
  ['topic:claude-skills', 'topic:claude-skills'],
  ['topic:claude-code-skills', 'topic:claude-code-skills'],
  ['topic:dsh-skill', 'topic:dsh-skill'],
  ['frontend + SKILL.md (名称/描述)', 'frontend+skill+in:name,description'],
  ['frontend-skills', 'frontend-skills+in:name'],
];

(async () => {
  for (const [label, q] of QUERIES) {
    try {
      const r = await get(`https://api.github.com/search/repositories?q=${q}&per_page=5&sort=stars&order=desc`);
      if (r.s === 200) {
        const j = JSON.parse(r.d);
        console.log(`\n【${label}】 命中 ${j.total_count} 个仓库`);
        j.items.forEach((it) => console.log(`   ${it.stargazers_count}★  ${it.full_name}  —  ${(it.description || '').slice(0, 78)}`));
      } else if (r.s === 403) {
        console.log(`\n【${label}】 触发限流（403），稍后再试`);
      } else {
        console.log(`\n【${label}】 HTTP ${r.s}`);
      }
    } catch (e) { console.log(`\n【${label}】 ${e.message}`); }
    await new Promise((r) => setTimeout(r, 2500));
  }
})();
