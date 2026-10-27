import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\wheel.js")
s = p.read_text(encoding="utf-8")

# 1) 落点换算：屏幕坐标 -> 扇区索引
helper = '''
  /* ---------------- 拖拽落点 ---------------- */

  /// 把鼠标位置换算成「当前页的第几个扇区」；不在环上返回 -1
  function slotAtPoint(clientX, clientY) {
    const count = S.pageItems.length;
    if (!count) return -1;
    const rect = scale.getBoundingClientRect();
    const zoom = rect.width / 760;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const r = Math.hypot(dx, dy) / zoom;
    if (r < 112 * 0.85 || r > 262 * 1.05) return -1;
    let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
    if (deg < 0) deg += 360;
    const step = 360 / count;
    return Math.floor((deg + step / 2) / step) % count;
  }

  let dropIndex = -1;
  function paintDropTarget(index) {
    ring.querySelectorAll('path').forEach((node) => {
      node.classList.toggle('is-drop', Number(node.dataset.index) === index);
    });
  }
'''
s = s.replace("  /* 拖拽添加 */", helper + "\n  /* 拖拽添加 */")

# 2) dragover 里高亮落点
s = s.replace("""  window.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  });""",
"""  window.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    dropIndex = slotAtPoint(e.clientX, e.clientY);
    paintDropTarget(dropIndex);
  });""")

s = s.replace("""  window.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragDepth = Math.max(0, dragDepth - 1);
    if (!dragDepth) dropVeil.classList.remove('is-on');
  });""",
"""  window.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragDepth = Math.max(0, dragDepth - 1);
    if (!dragDepth) {
      dropVeil.classList.remove('is-on');
      dropIndex = -1;
      paintDropTarget(-1);
    }
  });""")

# 3) drop：按落点插入，并跳到新条目所在页
s = s.replace("""    const added = await api.addItems(targets.map((target) => ({ target })));
    if (added && added.length) {
      await reload();
      showToast(`已加入 ${added.length} 个条目`);
    }""",
"""    const insertAt = dropIndex >= 0 ? S.page * 12 + dropIndex : -1;
    dropIndex = -1;

    const added = await api.addItems(targets.map((target) => ({ target })));
    if (!added || !added.length) return;

    await reload();

    if (insertAt >= 0) {
      // 拖到某个扇区 = 插到那个位置，而不是扔到末尾
      const addedIds = added.map((a) => a.id);
      const rest = S.items.filter((it) => !addedIds.includes(it.id)).map((it) => it.id);
      const pos = Math.min(insertAt, rest.length);
      rest.splice(pos, 0, ...addedIds);
      await api.reorder(rest);
      await reload();
    }

    const first = S.items.findIndex((it) => it.id === added[0].id);
    if (first >= 0) {
      S.page = Math.floor(first / PAGE);
      render();
      setHot(first % PAGE);
    }
    showToast(insertAt >= 0
      ? `已插入 ${added.length} 个条目`
      : `已加入 ${added.length} 个条目`);""")
p.write_text(s, encoding="utf-8")
print("wheel patched")
