"""图标解析加回退链：.lnk 本体 → 真实 exe → 目标路径 → PowerShell ExtractAssociatedIcon。"""

from pathlib import Path

M = Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = M.read_text(encoding="utf-8")

old_start = s.index("async function resolveIcon(type, target) {")
old_end = s.index("/** 启动时补齐系统图标")
new = '''/// 用 PowerShell 的 ExtractAssociatedIcon 兜底（有些 WindowsApps/UWP 的 exe
/// Electron 的 getFileIcon 拿不到，但 shell32 这条老路还能出图）
function iconViaPowerShell(target) {
  return new Promise((resolve) => {
    try {
      const tmp = helperTmp();
      const script = [
        'Add-Type -AssemblyName System.Drawing',
        '$p = ' + JSON.stringify(target),
        'try {',
        '  $i = [System.Drawing.Icon]::ExtractAssociatedIcon($p)',
        '  if ($i) {',
        '    $b = $i.ToBitmap()',
        '    $ms = New-Object System.IO.MemoryStream',
        '    $b.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)',
        '    [Convert]::ToBase64String($ms.ToArray())',
        '  }',
        '} catch { }',
      ].join('; ');
      const child = spawn('powershell.exe',
        ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', script],
        { env: { ...process.env, TEMP: tmp, TMP: tmp }, windowsHide: true });
      let out = '';
      const timer = setTimeout(() => { try { child.kill(); } catch (_) { /* ignore */ } resolve(null); }, 6000);
      child.stdout.on('data', (d) => { out += d.toString('utf8'); });
      child.on('error', () => { clearTimeout(timer); resolve(null); });
      child.on('close', () => {
        clearTimeout(timer);
        const b64 = out.trim().split(/\\r?\\n/).pop();
        resolve(b64 && b64.length > 200 ? `data:image/png;base64,${b64}` : null);
      });
    } catch (_) {
      resolve(null);
    }
  });
}

/// 依次尝试一串候选路径，谁先出图用谁
async function resolveIcon(type, target, extra = []) {
  const t = String(target || '').trim();
  if (!t) return null;
  if (type === 'url') return faviconFor(t);

  const candidates = [];
  for (const p of [...extra, t]) {
    const v = String(p || '').trim();
    if (v && !candidates.includes(v)) candidates.push(v);
  }

  for (const p of candidates) {
    try {
      const img = await app.getFileIcon(p, { size: 'large' });
      if (img && !img.isEmpty()) return img.toDataURL();
    } catch (_) { /* 换下一个 */ }
  }

  for (const p of candidates) {
    const icon = await iconViaPowerShell(p);
    if (icon) return icon;
  }
  return null;
}

'''
s = s[:old_start] + new + s[old_end:]

# 添加时把「原始 .lnk」也作为候选，并记住它
s = s.replace("""    } else if (expanded && expanded.exe) {
      item.exe = expanded.exe;                       // 供外环按 exe 匹配""",
"""    } else if (expanded && expanded.exe) {
      item.exe = expanded.exe;                       // 供外环按 exe 匹配
      item.shortcut = item.target;                   // 留一手：图标先从 .lnk 本体取""")

s = s.replace("""    item.icon = raw.icon || (await resolveIcon(item.type, item.exe || item.target));""",
"""    item.icon = raw.icon || (await resolveIcon(item.type, item.exe || item.target,
      item.shortcut ? [item.shortcut] : []));""")

# 启动补图标：也带上 .lnk 与 exe 两条候选
s = s.replace("""    const icon = await resolveIcon(item.type, item.target);""",
"""    const icon = await resolveIcon(item.type, item.exe || item.target,
      item.shortcut ? [item.shortcut] : []);""", 1)

M.write_text(s, encoding="utf-8")
print("resolveIcon 已替换")
