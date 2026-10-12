const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');

const OUT = 'D:/QYD/dsh-file/skills-research/find-skills';
fs.mkdirSync(OUT, { recursive: true });

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
  const r = await get('https://api.github.com/repos/vercel-labs/skills/contents/skills/find-skills/SKILL.md');
  if (r.s !== 200) { console.log('HTTP', r.s); process.exit(1); }
  const j = JSON.parse(r.d);
  const txt = Buffer.from(j.content, 'base64').toString('utf8');
  const f = path.join(OUT, 'SKILL.md');
  fs.writeFileSync(f, txt, 'utf8');
  console.log('已保存:', f, `(${txt.length} 字符, ${txt.split('\n').length} 行)`);

  // 解析 frontmatter
  const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  console.log('\n=== frontmatter ===');
  console.log(m ? m[1] : '!! 没有 frontmatter');

  console.log('\n=== 正文里出现的「可能要我执行动作」的信号 ===');
  const signals = [
    [/npx\s+\S+/g, 'npx 命令'],
    [/git\s+clone/g, 'git clone'],
    [/https?:\/\/\S+/g, 'URL'],
    [/curl|wget|Invoke-WebRequest/gi, '网络下载'],
    [/\brm\s+-|Remove-Item|del\s/gi, '删除操作'],
    [/eval|exec\(|child_process/gi, '执行代码'],
  ];
  for (const [re, label] of signals) {
    const hits = [...txt.matchAll(re)].map((x) => x[0]);
    if (hits.length) console.log(`  ${label}: ${hits.length} 处  e.g. ${[...new Set(hits)].slice(0, 4).join(' | ')}`);
  }
})();
