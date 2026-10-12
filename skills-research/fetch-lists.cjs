const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');

const OUT = 'D:/QYD/dsh-file/skills-research';
fs.mkdirSync(OUT, { recursive: true });

function get(u) {
  return new Promise((res, rej) => {
    const req = https.get(u, { headers: { 'User-Agent': 'node', Accept: 'application/vnd.github+json' }, timeout: 30000 }, (r) => {
      if ([301, 302, 307, 308].includes(r.statusCode) && r.headers.location) {
        r.resume();
        return res(get(new URL(r.headers.location, u).toString()));
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
  const targets = [
    ['finfin/awesome-frontend-skills', 'awesome-frontend-skills.md'],
    ['ezra-y/awesome-claude-ui-armory', 'awesome-claude-ui-armory.md'],
  ];
  for (const [repo, name] of targets) {
    try {
      const r = await get(`https://api.github.com/repos/${repo}/readme`);
      if (r.s !== 200) { console.log(`${repo}: HTTP ${r.s}`); continue; }
      const j = JSON.parse(r.d);
      const txt = Buffer.from(j.content, 'base64').toString('utf8');
      const f = path.join(OUT, name);
      fs.writeFileSync(f, txt, 'utf8');
      console.log(`OK ${repo} -> ${name}  (${txt.length} 字符, ${txt.split('\n').length} 行)`);
    } catch (e) { console.log(`${repo}: ${e.message}`); }
  }

  // 统计 awesome-frontend-skills 里的技能条目
  try {
    const txt = fs.readFileSync(path.join(OUT, 'awesome-frontend-skills.md'), 'utf8');
    const repos = [...txt.matchAll(/\[([\w.-]+\/[\w.-]+)\]\(https:\/\/github\.com\/([\w.-]+\/[\w.-]+)\)/g)]
      .map((m) => m[2]);
    const uniq = [...new Set(repos)];
    console.log(`\n清单里引用的独立仓库数: ${uniq.length}`);
    const skills = [...txt.matchAll(/`([a-z0-9][a-z0-9-]{2,60})`\s*(?:—|-)/g)].map((m) => m[1]);
    console.log(`看起来是技能名的条目: ${new Set(skills).size}`);
  } catch (e) { console.log('统计失败:', e.message); }
})();
