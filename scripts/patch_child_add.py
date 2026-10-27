import pathlib

# ---------- main.js：child:add ----------
m = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = m.read_text(encoding="utf-8")
s = s.replace("""  ipcMain.handle('child:update',""",
"""  ipcMain.handle('child:add', async (_e, { groupId, payload = {} }) => {
    const group = state.items.find((it) => it.id === groupId);
    if (!group || group.type !== 'group') return { ok: false, error: '分组不存在' };
    const target = String(payload.target || '').trim();
    if (!target) return { ok: false, error: '目标为空' };
    const child = toItem({ ...payload, target });
    if (!payload.icon) child.icon = await resolveIcon(child.type, child.exe || child.target).catch(() => null);
    group.children = [...(group.children || []), child];
    saveState();
    broadcast();
    return { ok: true, child };
  });

  ipcMain.handle('child:update',""")
m.write_text(s, encoding="utf-8")

# ---------- preload ----------
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\preload.js")
ps = p.read_text(encoding="utf-8")
ps = ps.replace("""  updateChild: (groupId, childId, patch) => invoke('child:update', { groupId, childId, patch }),""",
"""  updateChild: (groupId, childId, patch) => invoke('child:update', { groupId, childId, patch }),
  addChild: (groupId, payload) => invoke('child:add', { groupId, payload }),""")
p.write_text(ps, encoding="utf-8")
print("main/preload ok")
