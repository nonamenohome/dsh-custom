import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = p.read_text(encoding="utf-8")

start = s.index("async function openItem(item) {")
end = s.index("\n}\n", start) + 3
new = '''async function openItem(item) {
  if (!item) throw new Error('条目不存在');
  const target = String(item.target || '').trim();
  if (!target) throw new Error('条目没有目标地址');

  // 网址：交给默认浏览器（这条在重启后已验证可用）
  if (item.type === 'url') {
    await shell.openExternal(normalizeUrl(target));
    return 'openExternal';
  }
  if (!fs.existsSync(target)) throw new Error(`路径不存在：${target}`);

  // 应用：直接起进程，不经 shell
  if (item.type === 'app') {
    const args = item.args && item.args.trim() ? item.args.trim().split(/\\s+/) : [];
    const child = spawn(target, args, { detached: true, stdio: 'ignore' });
    child.unref();
    return args.length ? 'spawn+args' : 'spawn';
  }

  // 文件夹：直接起 explorer.exe（shell.openPath 在这台机器上会弹系统错误框）
  if (item.type === 'folder') {
    const child = spawn('explorer.exe', [target], { detached: true, stdio: 'ignore' });
    child.unref();
    return 'explorer.exe';
  }

  // 其余文件：仍然交给默认程序
  const err = await shell.openPath(target);
  if (err) throw new Error(err);
  return 'openPath';
}
'''
s = s[:start] + new + s[end:]

# 日志里带上用的是哪条路径
s = s.replace("""      await openItem(item);
      fs.appendFileSync(logPath, `${new Date().toISOString()} OK   ${item?.type} ${item?.target}\\n`, 'utf8');""",
"""      const via = await openItem(item);
      fs.appendFileSync(logPath, `${new Date().toISOString()} OK   ${item?.type} ${item?.target} [${via}]\\n`, 'utf8');""")
p.write_text(s, encoding="utf-8")
print("ok")
