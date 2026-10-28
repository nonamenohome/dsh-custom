import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = p.read_text(encoding="utf-8")
s = s.replace("""  if (added.length) { saveState(); broadcast(); }
  return added;""",
"""  if (added.length) {
    saveState();
    broadcast();
    // 缺图标的立刻后台补，补到一张广播一张（轮盘实时刷，不用重启）
    if (added.some((it) => !it.icon)) hydrateIcons().catch(() => {});
  }
  return added;""")
s = s.replace("""    group.children = [...(group.children || []), child];
    saveState();
    broadcast();
    return { ok: true, child };""",
"""    group.children = [...(group.children || []), child];
    saveState();
    broadcast();
    if (!child.icon) hydrateIcons().catch(() => {});
    return { ok: true, child };""")
p.write_text(s, encoding="utf-8")
print("ok")
