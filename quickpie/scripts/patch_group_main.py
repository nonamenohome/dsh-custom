import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = p.read_text(encoding="utf-8")

# 1) toItem 支持 children（递归）与 group 类型
s = s.replace("""    exe: raw.exe || null,
    icon: raw.icon || null,
    createdAt: raw.createdAt || Date.now(),
  };
}""",
"""    exe: raw.exe || null,
    icon: raw.icon || null,
    children: Array.isArray(raw.children) ? raw.children.map((c) => toItem(c)) : [],
    createdAt: raw.createdAt || Date.now(),
  };
}""")

# 2) openItem 处理分组
s = s.replace("""async function openItem(item) {
  if (!item) throw new Error('条目不存在');""",
"""async function openItem(item) {
  if (!item) throw new Error('条目不存在');
  if (item.type === 'group') {
    const target = String(item.target || '').trim();
    if (!target) throw new Error('这个分组没有设置默认目标（悬停可以选子项）');
    const err = await shell.openPath(target);
    if (err) throw new Error(err);
    return 'group->openPath';
  }""")

# 3) 新增 IPC：打开子项 / 移入移出分组
s = s.replace("""  ipcMain.handle('items:probe', () => opProbeMissing());""",
"""  ipcMain.handle('items:probe', () => opProbeMissing());
  ipcMain.handle('child:open', async (_e, { groupId, childId }) => {
    const group = state.items.find((it) => it.id === groupId);
    const child = group && (group.children || []).find((c) => c.id === childId);
    if (!child) return { ok: false, error: '子项不存在' };
    try {
      const via = await openItem(child);
      fs.appendFileSync(path.join(app.getPath('userData'), 'open.log'),
        `${new Date().toISOString()} OK   child ${child.type} ${child.target} [${via}]\\n`, 'utf8');
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  /// 把若干顶层条目移进分组
  ipcMain.handle('items:nest', (_e, { ids = [], groupId }) => {
    const group = state.items.find((it) => it.id === groupId);
    if (!group || group.type !== 'group') return { ok: false, error: '目标不是分组' };
    const moving = state.items.filter((it) => ids.includes(it.id) && it.id !== groupId);
    if (!moving.length) return { ok: false, error: '没有可移动的条目' };
    group.children = [...(group.children || []), ...moving];
    state.items = state.items.filter((it) => !moving.includes(it));
    persist();
    broadcastItems();
    return { ok: true, moved: moving.length };
  });

  /// 把子项移回顶层
  ipcMain.handle('items:unnest', (_e, { groupId, childId }) => {
    const group = state.items.find((it) => it.id === groupId);
    if (!group) return { ok: false, error: '分组不存在' };
    const child = (group.children || []).find((c) => c.id === childId);
    if (!child) return { ok: false, error: '子项不存在' };
    group.children = group.children.filter((c) => c.id !== childId);
    state.items.push(child);
    persist();
    broadcastItems();
    return { ok: true };
  });""")
p.write_text(s, encoding="utf-8")
print("main ok")
