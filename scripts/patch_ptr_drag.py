"""1) 列表拖动改为指针事件（不再用 HTML5 DnD）
2) 二级条目可编辑「目标」和「类型」
"""

from pathlib import Path

M = Path(r"D:\QYD\dsh-file\apps\quickpie\app\manager.js")
s = M.read_text(encoding="utf-8")

# ---------- 1) 去掉 draggable，避免和指针拖拽冲突 ----------
s = s.replace("""      row.dataset.id = item.id;
      row.draggable = true;""",
"""      row.dataset.id = item.id;""")

# ---------- 2) 用指针事件替换整段 HTML5 拖拽 ----------
start = s.index("  /* ---------------- 列表拖动排序 ---------------- */")
end = s.index("  /* ---------------- 编辑器 ---------------- */")
new_block = '''  /* ---------------- 列表拖动（指针事件，不依赖 HTML5 DnD） ---------------- */

  let dragState = null;          // { id, startY, row, moved }
  let dropTarget = null;         // { kind: 'into'|'before'|'after', row }

  function clearDropMarks() {
    listEl.querySelectorAll('.row').forEach((r) => r.classList.remove('drop-before', 'drop-after', 'drop-into'));
    document.body.classList.remove('row-dragging');
    dropTarget = null;
  }

  function markDrop(row, kind) {
    clearDropMarks();
    if (!row) return;
    row.classList.add(`drop-${kind}`);
    dropTarget = { kind, row };
  }

  listEl.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('button, input, select, a')) return;   // 按钮/输入框不触发拖动
    const row = e.target.closest('.row');
    if (!row) return;
    dragState = { id: row.dataset.id, startY: e.clientY, row, moved: false };
  });

  window.addEventListener('mousemove', (e) => {
    if (!dragState) return;
    if (!dragState.moved && Math.abs(e.clientY - dragState.startY) < 5) return;
    dragState.moved = true;
    document.body.classList.add('row-dragging');

    const under = document.elementFromPoint(e.clientX, e.clientY);
    const row = under && under.closest ? under.closest('.row') : null;
    if (!row || row.dataset.id === dragState.id) { clearDropMarks(); return; }

    const rect = row.getBoundingClientRect();
    const ratio = (e.clientY - rect.top) / rect.height;
    // 分组行：中间 44% 是「放进去」，上下是排序
    if (row.dataset.group === '1' && ratio > 0.28 && ratio < 0.72) markDrop(row, 'into');
    else markDrop(row, ratio > 0.5 ? 'after' : 'before');
  });

  window.addEventListener('mouseup', async () => {
    if (!dragState) return;
    const st = dragState;
    dragState = null;
    document.body.classList.remove('row-dragging');
    const target = dropTarget;
    clearDropMarks();
    if (!st.moved || !target) return;

    const targetId = target.row.dataset.id;
    if (!targetId || targetId === st.id) return;

    if (target.kind === 'into') {
      const res = await api.nestItems([st.id], targetId);
      if (res && res.ok) toast(`已放入分组（${res.moved} 项）`);
      else toast((res && res.error) || '放入失败');
      await refresh();
      return;
    }

    const ids = S.items.map((it) => it.id).filter((x) => x !== st.id);
    let pos = ids.indexOf(targetId);
    if (pos < 0) pos = ids.length - 1;
    if (target.kind === 'after') pos += 1;
    ids.splice(pos, 0, st.id);
    await api.reorder(ids);
    S.items = ids.map((x) => S.items.find((it) => it.id === x)).filter(Boolean);
    renderList();
  });

'''
s = s[:start] + new_block + s[end:]

# ---------- 3) 二级条目：可编辑目标 + 类型 ----------
s = s.replace("""      row.innerHTML = `<span class="child-icon">${iconMarkup(kid)}</span>
        <input class="child-name-input" value="${esc(kid.name)}" title="${esc(kid.target)}" spellcheck="false" />
        <span class="child-type">${TYPE_LABEL[kid.type] || kid.type}</span>
        <button type="button" class="btn ghost tiny" title="移出分组">移出</button>`;""",
"""      row.innerHTML = `
        <div class="child-line">
          <span class="child-icon">${iconMarkup(kid)}</span>
          <input class="child-name-input" value="${esc(kid.name)}" spellcheck="false" />
          <span class="child-type">${TYPE_LABEL[kid.type] || kid.type}</span>
          <button type="button" class="btn ghost tiny" title="移出分组">移出</button>
        </div>
        <div class="child-line child-line-2">
          <input class="child-target-input" value="${esc(kid.target)}" spellcheck="false" placeholder="路径 / 网址 / 程序" />
          <button type="button" class="btn ghost tiny btn-browse" title="浏览">浏览</button>
        </div>`;

      const targetEl = row.querySelector('.child-target-input');
      const commitTarget = async () => {
        const value = (targetEl.value || '').trim();
        if (!value || value === kid.target) { targetEl.value = kid.target; return; }
        await api.updateChild(draft.id, kid.id, { target: value });
        kid.target = value;
        await refresh();
        const fresh = S.items.find((it) => it.id === draft.id);
        if (fresh) { S.editing = { ...fresh, isNew: false }; renderEditor(); }
        toast('已更新目标');
      };
      targetEl.addEventListener('blur', commitTarget);
      targetEl.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') { ev.preventDefault(); targetEl.blur(); }
        if (ev.key === 'Escape') { targetEl.value = kid.target; targetEl.blur(); }
      });
      row.querySelector('.btn-browse').addEventListener('click', async () => {
        const picked = await api.pick(kid.type === 'folder' ? 'folder' : 'file');
        if (!picked) return;
        targetEl.value = picked;
        commitTarget();
      });""")

M.write_text(s, encoding="utf-8")
print("manager patched")
