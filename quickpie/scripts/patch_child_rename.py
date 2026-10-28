import pathlib

# ---- main.js：子项更新 IPC ----
m = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = m.read_text(encoding="utf-8")
s = s.replace("""  ipcMain.handle('items:unnest',""",
"""  ipcMain.handle('child:update', (_e, { groupId, childId, patch = {} }) => {
    const group = state.items.find((it) => it.id === groupId);
    const child = group && (group.children || []).find((c) => c.id === childId);
    if (!child) return { ok: false, error: '子项不存在' };
    if (patch.name !== undefined) child.name = String(patch.name).slice(0, 60);
    if (patch.target !== undefined) child.target = String(patch.target).trim();
    if (patch.type !== undefined) child.type = patch.type;
    if (patch.args !== undefined) child.args = String(patch.args);
    if (patch.target !== undefined) {
      resolveIcon(child.type, child.target).then((icon) => {
        child.icon = icon;
        saveState();
        broadcast();
      }).catch(() => {});
    }
    saveState();
    broadcast();
    return { ok: true, child };
  });

  ipcMain.handle('items:unnest',""")
m.write_text(s, encoding="utf-8")

# ---- preload ----
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\preload.js")
ps = p.read_text(encoding="utf-8")
ps = ps.replace("""  unnestItem: (groupId, childId) => invoke('items:unnest', { groupId, childId }),""",
"""  unnestItem: (groupId, childId) => invoke('items:unnest', { groupId, childId }),
  updateChild: (groupId, childId, patch) => invoke('child:update', { groupId, childId, patch }),""")
p.write_text(ps, encoding="utf-8")

# ---- manager.js ----
q = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\manager.js")
ms = q.read_text(encoding="utf-8")

# 1) 保存时直接读输入框
ms = ms.replace("""    const target = (draft.target || '').trim();
    const isGroup = draft.type === 'group';""",
"""    // 直接从输入框取值：不依赖草稿是否同步
    const nameInput = ($('fName').value || '').trim();
    const target = ($('fTarget').value || '').trim();
    const argsInput = ($('fArgs').value || '').trim();
    const isGroup = draft.type === 'group';""")
ms = ms.replace("""      name: (draft.name || '').trim(),
      target,
      args: (draft.args || '').trim(),""",
"""      name: nameInput,
      target,
      args: argsInput,""")

# 2) 二级条目就地改名
ms = ms.replace("""      row.innerHTML = `<span class="child-icon">${iconMarkup(kid)}</span>
        <span class="child-name" title="${esc(kid.target)}">${esc(kid.name)}</span>
        <span class="child-type">${TYPE_LABEL[kid.type] || kid.type}</span>
        <button type="button" class="btn ghost tiny" title="移出分组">移出</button>`;""",
"""      row.innerHTML = `<span class="child-icon">${iconMarkup(kid)}</span>
        <input class="child-name-input" value="${esc(kid.name)}" title="${esc(kid.target)}" spellcheck="false" />
        <span class="child-type">${TYPE_LABEL[kid.type] || kid.type}</span>
        <button type="button" class="btn ghost tiny" title="移出分组">移出</button>`;

      const nameEl = row.querySelector('.child-name-input');
      const commit = async () => {
        const value = (nameEl.value || '').trim();
        if (!value || value === kid.name) { nameEl.value = kid.name; return; }
        await api.updateChild(draft.id, kid.id, { name: value });
        kid.name = value;
        await refresh();
        toast('已改名');
      };
      nameEl.addEventListener('blur', commit);
      nameEl.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') { ev.preventDefault(); nameEl.blur(); }
        if (ev.key === 'Escape') { nameEl.value = kid.name; nameEl.blur(); }
      });""")
q.write_text(ms, encoding="utf-8")
print("ok")
