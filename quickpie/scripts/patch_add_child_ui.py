import pathlib

# ---------- manager：分组编辑里「新增二级条目」 ----------
q = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\manager.js")
s = q.read_text(encoding="utf-8")

s = s.replace("""    kids.forEach((kid) => {""",
"""    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn ghost small child-add';
    addBtn.textContent = '＋ 新增二级条目';
    addBtn.addEventListener('click', () => {
      const form = document.createElement('div');
      form.className = 'child-add-form';
      form.innerHTML = `
        <input class="child-name-input" placeholder="名称（可留空）" spellcheck="false" />
        <input class="child-target-input" placeholder="路径 / 网址 / 程序" spellcheck="false" />
        <button type="button" class="btn small">确定</button>
        <button type="button" class="btn ghost small">取消</button>`;
      const [nameEl, targetEl] = form.querySelectorAll('input');
      const [okBtn, cancelBtn] = form.querySelectorAll('button');
      const submit = async () => {
        const target = (targetEl.value || '').trim();
        if (!target) { targetEl.focus(); return; }
        const res = await api.addChild(draft.id, {
          target,
          name: (nameEl.value || '').trim() || undefined,
        });
        if (res && res.ok) {
          form.remove();
          await refresh();
          const fresh = S.items.find((it) => it.id === draft.id);
          if (fresh) { S.editing = { ...fresh, isNew: false }; renderEditor(); }
          toast('已添加二级条目');
        } else {
          toast((res && res.error) || '添加失败');
        }
      };
      okBtn.addEventListener('click', submit);
      cancelBtn.addEventListener('click', () => form.remove());
      targetEl.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') submit(); });
      box.appendChild(form);
      targetEl.focus();
    });
    box.appendChild(addBtn);

    kids.forEach((kid) => {""")
q.write_text(s, encoding="utf-8")

# ---------- wheel：Ctrl+V / 拖拽落在分组上 → 加进该分组 ----------
w = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\wheel.js")
ws = w.read_text(encoding="utf-8")

# 当前悬停的分组（有则快速添加进它）
ws = ws.replace("""  function openQuickInput(initial = '') {""",
"""  /// 当前悬停的分组（没有则 null）——快速添加时优先加进它
  function hotGroup() {
    if (S.hot < 0) return null;
    const item = S.pageItems[S.hot];
    return item && item.type === 'group' ? item : null;
  }

  function openQuickInput(initial = '') {""")

ws = ws.replace("""    wrap.innerHTML = `
      <input type="text" spellcheck="false" placeholder="粘贴或输入网址 / 路径，回车添加" />
      <kbd>Enter</kbd>`;""",
"""    const grp = hotGroup();
    wrap.innerHTML = `
      <input type="text" spellcheck="false" placeholder="${grp ? `添加到「${grp.name}」：粘贴网址 / 路径，回车` : '粘贴或输入网址 / 路径，回车添加'}" />
      <kbd>Enter</kbd>`;""")

ws = ws.replace("""      closeQuickInput();
      const added = await api.addItems(list.map((target) => ({ target })));
      if (added && added.length) {""",
"""      closeQuickInput();
      const group = hotGroup();
      if (group) {
        // 加进当前分组，成为二级条目
        let okCount = 0;
        for (const target of list) {
          const res = await api.addChild(group.id, { target });
          if (res && res.ok) okCount += 1;
        }
        if (okCount) {
          await reload();
          setHot(S.hot);
          showToast(`已加入「${group.name}」${okCount} 条`);
        } else {
          showToast('添加失败');
        }
        return;
      }
      const added = await api.addItems(list.map((target) => ({ target })));
      if (added && added.length) {""")

# 拖拽落在分组上：加进分组
ws = ws.replace("""    const insertAt = dropIndex >= 0 ? S.page * 12 + dropIndex : -1;""",
"""    const dropGroup = dropIndex >= 0 ? S.pageItems[dropIndex] : null;
    if (dropGroup && dropGroup.type === 'group') {
      // 拖到分组扇区上 = 直接成为它的二级条目
      let okCount = 0;
      for (const target of targets) {
        const res = await api.addChild(dropGroup.id, { target });
        if (res && res.ok) okCount += 1;
      }
      if (okCount) {
        await reload();
        setHot(dropIndex);
        showToast(`已加入「${dropGroup.name}」${okCount} 条`);
      }
      return;
    }

    const insertAt = dropIndex >= 0 ? S.page * 12 + dropIndex : -1;""")
w.write_text(ws, encoding="utf-8")
print("manager/wheel ok")
