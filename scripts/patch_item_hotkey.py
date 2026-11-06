import pathlib

m = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = m.read_text(encoding="utf-8")

if "function registerItemHotkeys" not in s:
    s = s.replace("""function broadcast() {""",
"""let itemHotkeys = new Map();   // accel -> itemId

function findAnyItemById(id) {
  for (const it of state.items) {
    if (it.id === id) return it;
    for (const k of it.children || []) if (k.id === id) return k;
  }
  return null;
}

/// 给「条目自带快捷键」注册/重注册（不动轮盘主热键）
function registerItemHotkeys() {
  for (const accel of itemHotkeys.keys()) {
    try { globalShortcut.unregister(accel); } catch (_) { /* ignore */ }
  }
  itemHotkeys.clear();

  const all = [];
  for (const it of state.items) {
    all.push(it);
    for (const k of it.children || []) all.push(k);
  }

  for (const it of all) {
    const accel = String(it.hotkey || '').trim();
    if (!accel) continue;
    if (accel === state.settings.hotkey) continue;      // 别抢轮盘主热键
    try {
      const ok = globalShortcut.register(accel, () => {
        const target = findAnyItemById(it.id);
        if (!target) return;
        openItem(target).catch((err) => console.log('[hotkey] 打开失败', err.message));
      });
      if (ok) itemHotkeys.set(accel, it.id);
      else console.log('[hotkey] 被占用，注册失败:', accel, it.name);
    } catch (err) {
      console.log('[hotkey] 异常:', accel, err.message);
    }
  }
  console.log('[hotkey] 已注册条目快捷键:', itemHotkeys.size);
}

function broadcast() {""")

    # 起点：启动时注册
    s = s.replace("""    applyAutoLaunch(state.settings.autoLaunch);""",
"""    applyAutoLaunch(state.settings.autoLaunch);
    registerItemHotkeys();""")

    # 增删改后重新注册
    s = s.replace("""  if (added.length) {
    saveState();
    broadcast();""",
"""  if (added.length) {
    saveState();
    registerItemHotkeys();
    broadcast();""")
    s = s.replace("""  saveState();
  broadcast();
  return { ok: true, item };""",
"""  saveState();
  registerItemHotkeys();
  broadcast();
  return { ok: true, item };""")
    s = s.replace("""  if (state.items.length !== before) { saveState(); broadcast(); }""",
"""  if (state.items.length !== before) { saveState(); registerItemHotkeys(); broadcast(); }""")

m.write_text(s, encoding="utf-8")
print("hotkey 注册已接入; 含函数:", "function registerItemHotkeys" in s)
