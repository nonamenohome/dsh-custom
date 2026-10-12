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
  const r = await get('https://api.github.com/repos/vercel-labs/skills/readme');
  if (r.s !== 200) { console.log('HTTP', r.s); return; }
  const txt = Buffer.from(JSON.parse(r.d).content, 'base64').toString('utf8');

  console.log('=== README 里提到 agent / 目录 的行 ===');
  const lines = txt.split('\n');
  lines.forEach((l, i) => {
    if (/\.agents|agents\.md|--agent|-a\s|claude-code|cursor|codex|windsurf|global|\.claude|skill dir|install/i.test(l) && l.trim().length > 12) {
      console.log(`  ${i + 1}: ${l.trim().slice(0, 150)}`);
    }
  });

  console.log('\n=== 搜索是否提到 dsh / deepseek ===');
  const hit = lines.filter((l) => /dsh|deepseek/i.test(l));
  console.log(hit.length ? hit.join('\n') : '  （README 里没有提到 DSH / DeepSeek）');
})();
