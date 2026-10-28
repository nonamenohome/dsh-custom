import pathlib

# CSS：落点高亮
c = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\styles.css")
cs = c.read_text(encoding="utf-8")
cs += """
/* 拖拽落点 */
.wheel-ring path.is-drop {
  fill: var(--accent-soft);
  stroke: color-mix(in srgb, var(--accent) 45%, transparent);
  stroke-width: 1.5;
}
.row.drop-before { box-shadow: inset 0 2px 0 var(--accent); }
.row.drop-after  { box-shadow: inset 0 -2px 0 var(--accent); }
.itemlist.is-dragging .row-actions { opacity: 0; }
"""
c.write_text(cs, encoding="utf-8")

# manager：行内拖动排序
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\manager.js")
s = p.read_text(encoding="utf-8")

s = s.replace("""      row.dataset.id = item.id;""",
"""      row.dataset.id = item.id;
      row.draggable = true;""")

# 在 renderList 之后插入拖拽逻辑（挂在 listEl 上，事件委托）
anchor = "  /* ---------------- 编辑器 ---------------- */"
drag_code = '''  /* ---------------- 列表拖动排序 ---------------- */

  let dragId = null;
  const DRAG_TYPE = 'application/x-quickpie-id';

  function clearDropMarks() {
    listEl.querySelectorAll('.row').forEach((r) => r.classList.remove('drop-before', 'drop-after'));
    listEl.classList.remove('is-dragging');
  }

  listEl.addEventListener('dragstart', (e) => {
    const row = e.target.closest('.row');
    if (!row) return;
    dragId = row.dataset.id;
    listEl.classList.add('is-dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(DRAG_TYPE, dragId);
    e.dataTransfer.setData('text/plain', '');   // 避免被当成文件拖拽
  });

  listEl.addEventListener('dragover', (e) => {
    dragId = dragId || e.dataTransfer.types.includes(DRAG_TYPE) ? dragId : dragId;
    if (!e.dataTransfer.types.includes(DRAG_TYPE)) return;   // 外部文件交给 document 的 drop
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const row = e.target.closest('.row');
    clearDropMarks();
    if (!row) return;
    const rect = row.getBoundingClientRect();
    const after = e.clientY > rect.top + rect.height / 2;
    row.classList.add(after ? 'drop-after' : 'drop-before');
  });

  listEl.addEventListener('dragleave', (e) => {
    if (e.target === listEl) clearDropMarks();
  });

  listEl.addEventListener('drop', async (e) => {
    if (!e.dataTransfer.types.includes(DRAG_TYPE)) return;
    e.preventDefault();
    e.stopPropagation();
    const id = e.dataTransfer.getData(DRAG_TYPE) || dragId;
    const row = e.target.closest('.row');
    clearDropMarks();
    if (!id || !row) { dragId = null; return; }
    const targetId = row.dataset.id;
    if (targetId === id) { dragId = null; return; }

    const rect = row.getBoundingClientRect();
    const after = e.clientY > rect.top + rect.height / 2;
    const ids = S.items.map((it) => it.id).filter((x) => x !== id);
    let pos = ids.indexOf(targetId);
    if (pos < 0) pos = ids.length;
    if (after) pos += 1;
    ids.splice(pos, 0, id);
    dragId = null;
    await api.reorder(ids);
    S.items = ids.map((x) => S.items.find((it) => it.id === x)).filter(Boolean);
    renderList();
  });

  listEl.addEventListener('dragend', () => { dragId = null; clearDropMarks(); });

'''
s = s.replace(anchor, drag_code + anchor)

# 文件拖入后：选中新条目并滚到可见
s = s.replace("""    const added = await api.addItems(targets.map((target) => ({ target })));
    await refresh();
    toast(`已加入 ${added.length} 项`);""",
"""    const added = await api.addItems(targets.map((target) => ({ target })));
    await refresh();
    if (added && added.length) {
      selectItem(added[0].id);
      const el = listEl.querySelector(`.row[data-id="${added[0].id}"]`);
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
    toast(`已加入 ${added.length} 项`);""")
p.write_text(s, encoding="utf-8")
print("manager patched")
