import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = p.read_text(encoding="utf-8")
start = s.index("async function openItem(item) {")
end = s.index("\n}\n", start) + 3
new = '''async function openItem(item) {
  if (!item) throw new Error('条目不存在');
  const target = String(item.target || '').trim();
  if (!target) throw new Error('条目没有目标地址');

  if (item.type === 'url') {
    await shell.openExternal(normalizeUrl(target));
    return 'openExternal';
  }
  if (!fs.existsSync(target)) throw new Error(`路径不存在：${target}`);

  // 文件夹 / 应用 / 文件：交给系统 shell。
  // 实测：spawn('explorer.exe') 在这里会以 code=1 退出、不开窗口；shell.openPath 正常。
  const err = await shell.openPath(target);
  if (err) throw new Error(err);
  return 'openPath';
}
'''
s = s[:start] + new + s[end:]
p.write_text(s, encoding="utf-8")
print("ok")
