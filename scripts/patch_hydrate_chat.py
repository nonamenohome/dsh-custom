import pathlib
m = pathlib.Path("main.js")
s = m.read_text(encoding="utf-8")
s = s.replace("""  for (const item of pending) {
    const icon = await resolveIcon(item.type, item.exe || item.target,
      item.shortcut ? [item.shortcut] : []);""",
"""  for (const item of pending) {
    const isChat = item.type === 'chat' || item.type === 'wechat';
    const iconTarget = isChat
      ? (item.target && fs.existsSync(item.target) ? item.target : defaultWeChatExe())
      : (item.exe || item.target);
    const icon = await resolveIcon(item.type, iconTarget,
      item.shortcut ? [item.shortcut] : []);""")
m.write_text(s, encoding="utf-8")
print("hydrate 补图标已修")
