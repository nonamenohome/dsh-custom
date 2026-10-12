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

(async () => {
  console.log('===== 1. dsh-plugins-catalog 是否发到 npm =====');
  for (const reg of ['https://registry.npmjs.org/dsh-plugins-catalog', 'https://registry.npmmirror.com/dsh-plugins-catalog']) {
    try {
      const r = await get(reg);
      console.log(`  ${reg} -> HTTP ${r.s}`);
      if (r.s === 200) {
        const j = JSON.parse(r.d);
        console.log('    dist-tags:', JSON.stringify(j['dist-tags']));
        console.log('    versions :', Object.keys(j.versions || {}).slice(-8).join(', '));
        console.log('    描述     :', (j.description || '').slice(0, 90));
        break;
      }
    } catch (e) { console.log('   ERR', e.message); }
  }

  console.log('\n===== 2. Sakana-yuyu/dsh-plugins 的 Releases =====');
  try {
    const r = await get('https://api.github.com/repos/Sakana-yuyu/dsh-plugins/releases?per_page=5');
    const j = JSON.parse(r.d);
    console.log('  release 数:', j.length);
    j.forEach((x) => console.log('   ', x.tag_name, x.published_at && x.published_at.slice(0, 10), 'assets:', (x.assets || []).map((a) => a.name).join(',') || '(无)'));

    // tags 作为兜底
    const t = await get('https://api.github.com/repos/Sakana-yuyu/dsh-plugins/tags?per_page=8');
    const tj = JSON.parse(t.d);
    console.log('  最近 tags:', tj.map((x) => x.name).join(', '));
  } catch (e) { console.log('   ERR', e.message); }

  console.log('\n===== 3. lolPing 的 Releases（看有没有现成安装包） =====');
  try {
    const r = await get('https://api.github.com/repos/darrenprx/lolPing/releases?per_page=5');
    const j = JSON.parse(r.d);
    console.log('  release 数:', j.length);
    j.forEach((x) => {
      console.log(`   ${x.tag_name}  ${x.published_at && x.published_at.slice(0, 10)}  ${x.name || ''}`);
      (x.assets || []).forEach((a) => console.log(`      - ${a.name}  ${(a.size / 1048576).toFixed(1)}MB  下载 ${a.download_count}`));
    });
    if (j.length === 0) console.log('   （无 release）');
  } catch (e) { console.log('   ERR', e.message); }

  console.log('\n===== 4. lolPing README 前几行（安装说明） =====');
  try {
    const r = await get('https://api.github.com/repos/darrenprx/lolPing/readme');
    if (r.s === 200) {
      const j = JSON.parse(r.d);
      const txt = Buffer.from(j.content, 'base64').toString('utf8');
      console.log(txt.split('\n').slice(0, 45).join('\n'));
    }
  } catch (e) { console.log('   ERR', e.message); }
})();
