import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = p.read_text(encoding="utf-8")

# 1) 解析快捷方式/Internet 快捷方式
helper = '''
/// 解析 .lnk 的真实目标；.url 则读出里面的 URL
function expandShortcut(target) {
  const lower = String(target || '').toLowerCase();
  if (lower.endsWith('.lnk')) {
    try {
      const detail = shell.readShortcutLink(target);
      if (detail && detail.target) return { exe: detail.target, args: detail.args || '' };
    } catch (_) { /* 解析失败就按原样用 */ }
  }
  if (lower.endsWith('.url')) {
    try {
      const text = fs.readFileSync(target, 'utf8');
      const m = text.match(/^URL=(.+)$/im);
      if (m && m[1].trim()) return { url: m[1].trim() };
    } catch (_) { /* ignore */ }
  }
  return null;
}

'''
s = s.replace("async function opAddItems(payload) {", helper + "async function opAddItems(payload) {")

# 2) 添加时套用解析结果
s = s.replace("""    const item = toItem({ ...raw, target });
    item.icon = raw.icon || (await resolveIcon(item.type, item.target));""",
"""    let item = toItem({ ...raw, target });
    const expanded = expandShortcut(item.target);
    if (expanded && expanded.url) {
      item = toItem({ ...raw, target: expanded.url, type: 'url' });
    } else if (expanded && expanded.exe) {
      item.exe = expanded.exe;                       // 供外环按 exe 匹配
      if (expanded.args && !item.args) item.args = expanded.args;
      if (!String(raw.name || '').trim()) item.name = autoName('app', expanded.exe);
    }
    item.icon = raw.icon || (await resolveIcon(item.type, item.exe || item.target));""")

# 3) 外环匹配优先用解析出来的 exe
s = s.replace("""function windowsForItem(item) {
  if (!item || item.type !== 'app') return [];
  const base = String(item.target || '').split(/[\\\\/]/).pop().toLowerCase();
  if (!base.endsWith('.exe')) return [];
  return winCache.get(base) || [];
}""",
"""function windowsForItem(item) {
  if (!item || item.type !== 'app') return [];
  const source = item.exe || item.target;
  const base = String(source || '').split(/[\\\\/]/).pop().toLowerCase();
  if (!base.endsWith('.exe')) return [];
  return winCache.get(base) || [];
}""")
p.write_text(s, encoding="utf-8")
print("ok")
