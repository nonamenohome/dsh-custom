import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\manager.js")
s = p.read_text(encoding="utf-8")

# 1) 类型标签
if "TYPE_LABEL" in s and "group:" not in s:
    s = s.replace("const TYPE_LABEL = {", "const TYPE_LABEL = {\n    group: '分组',")

# 2) 编辑器：显示子项
s = s.replace("""    $('argsField').style.display = draft.type === 'app' ? '' : 'none';""",
"""    $('argsField').style.display = draft.type === 'app' ? '' : 'none';
    const isGroup = draft.type === 'group';
    $('childField').hidden = !isGroup;
    $('childField').style.display = isGroup ? '' : 'none';
    if (isGroup) renderChildren(draft);""")

# 3) 渲染子项列表
s = s.replace("""  function startNew(type = 'folder') {""",
"""  function renderChildren(draft) {
    const box = $('childList');
    box.innerHTML = '';
    const kids = draft.children || [];
    if (!kids.length) {
      box.innerHTML = '<div class="child-empty">还没有二级条目</div>';
      return;
    }
    kids.forEach((kid) => {
      const row = document.createElement('div');
      row.className = 'child-row';
      row.innerHTML = `<span class="child-icon">${iconMarkup(kid)}</span>
        <span class="child-name" title="${esc(kid.target)}">${esc(kid.name)}</span>
        <span class="child-type">${TYPE_LABEL[kid.type] || kid.type}</span>
        <button type="button" class="btn ghost tiny" title="移出分组">移出</button>`;
      row.querySelector('button').addEventListener('click', async () => {
        await api.unnestItem(draft.id, kid.id);
        await refresh();
        const fresh = S.items.find((it) => it.id === draft.id);
        if (fresh) { S.editing = { ...fresh, isNew: false }; renderEditor(); }
      });
      box.appendChild(row);
    });
  }

  function startNew(type = 'folder') {""")

# 4) 保存：分组允许空目标
s = s.replace("""    const target = (draft.target || '').trim();
    if (!target) { toast('请填写目标路径或网址'); $('fTarget').focus(); return; }""",
"""    const target = (draft.target || '').trim();
    const isGroup = draft.type === 'group';
    if (!target && !isGroup) { toast('请填写目标路径或网址'); $('fTarget').focus(); return; }""")
s = s.replace("""      args: (draft.args || '').trim(),
      icon: draft.icon || undefined,
    };""",
"""      args: (draft.args || '').trim(),
      icon: draft.icon || undefined,
      children: isGroup ? (draft.children || []) : undefined,
    };""")

# 5) 行内显示子项数量
s = s.replace("""      row.dataset.id = item.id;
      row.draggable = true;""",
"""      row.dataset.id = item.id;
      row.draggable = true;
      if (item.type === 'group') row.dataset.group = '1';""")
p.write_text(s, encoding="utf-8")
print("manager ok")
