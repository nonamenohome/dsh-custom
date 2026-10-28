import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = p.read_text(encoding="utf-8")
s = s.replace("""async function hydrateIcons() {
  let changed = false;
  for (const item of state.items.filter((it) => !it.icon && it.type !== 'url')) {
    const icon = await resolveIcon(item.type, item.exe || item.target,
      item.shortcut ? [item.shortcut] : []);
    if (icon) { item.icon = icon; changed = true; }
  }
  if (changed) { saveState(); broadcast(); }""",
"""async function hydrateIcons() {
  // 每补一个就落库：中途退出也不会白跑
  const pending = [];
  const walk = (list) => {
    for (const it of list) {
      if (!it.icon && it.type !== 'url') pending.push(it);
      if (it.children && it.children.length) walk(it.children);
    }
  };
  walk(state.items);

  for (const item of pending) {
    const icon = await resolveIcon(item.type, item.exe || item.target,
      item.shortcut ? [item.shortcut] : []);
    if (icon) {
      item.icon = icon;
      saveState();
      broadcast();
    }
  }""")
p.write_text(s, encoding="utf-8")
print("ok")
