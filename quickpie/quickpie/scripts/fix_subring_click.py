import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\wheel.js")
s = p.read_text(encoding="utf-8")

# 1) 一级扇区变薄，二级环带整体内收
s = s.replace("""  const R_IN = 112, R_OUT = 262, R_SLOT = 190;
  const SUB_IN = 274, SUB_OUT = 352;   // 二级小扇面所在的环带""",
"""  const R_IN = 140, R_OUT = 250, R_SLOT = 196;   // 一级环带（比原来薄 40px）
  const SUB_IN = 262, SUB_OUT = 344;             // 二级小扇面所在的环带""")

# 2) 二级命中：不依赖 SVG 的 pointer-events，直接算极坐标
s = s.replace("""  /* ---------------- 二级小扇面 ---------------- */""",
"""  /* ---------------- 二级小扇面 ---------------- */

  let subHover = -1;

  /// 指针在不在「当前分组」的二级环带里？返回第几个子项，-1 表示不在
  function subHitAt(clientX, clientY) {
    if (S.hot < 0) return -1;
    const item = S.pageItems[S.hot];
    if (!item || item.type !== 'group') return -1;
    const kids = item.children || [];
    if (!kids.length) return -1;

    const rect = scale.getBoundingClientRect();
    const zoom = rect.width / 760;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (clientX - cx) / zoom;
    const dy = (clientY - cy) / zoom;
    const r = Math.hypot(dx, dy);
    if (r < SUB_IN - 8 || r > SUB_OUT + 8) return -1;

    let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
    if (deg < 0) deg += 360;
    const count = S.pageItems.length || 1;
    const step = 360 / count;
    const span = step - GAP_DEG * 2;
    let rel = deg - (S.hot * step - span / 2);
    rel = ((rel % 360) + 360) % 360;
    if (rel > span) return -1;
    const idx = Math.floor(rel / (span / kids.length));
    return Math.min(kids.length - 1, Math.max(0, idx));
  }

  function setSubHover(hit) {
    if (hit === subHover) return;
    subHover = hit;
    const paths = subRing.querySelectorAll('path.sub-sector');
    paths.forEach((node, k) => node.classList.toggle('is-hover', k === hit));
    const item = S.pageItems[S.hot];
    if (!item || item.type !== 'group') return;
    const kid = (item.children || [])[hit];
    if (kid) {
      hubEyebrow.textContent = '二级';
      hubTitle.textContent = kid.name;
      hubSub.textContent = displayTarget(kid);
    } else {
      setHot(S.hot);
    }
  }
""")

# 3) mouseover：在二级环带里不要清空
s = s.replace("""    if (e.target === root || e.target === scale || e.target === ring) clearHot();""",
"""    if (e.target === root || e.target === scale || e.target === ring) {
      if (subHitAt(e.clientX, e.clientY) >= 0) return;   // 正穿过二级环带，保持
      clearHot();
    }""")

# 4) mousemove 维护二级悬停；click 用捕获阶段直接开
s = s.replace("""  root.addEventListener('click', (e) => {
    const slot = e.target.closest('.slot');""",
"""  root.addEventListener('mousemove', (e) => {
    setSubHover(subHitAt(e.clientX, e.clientY));
  });

  // 捕获阶段处理二级点击：不依赖 SVG 的 pointer-events
  root.addEventListener('click', (e) => {
    const hit = subHitAt(e.clientX, e.clientY);
    if (hit >= 0 && !e.target.closest('.slot')) {
      const item = S.pageItems[S.hot];
      const kid = item && (item.children || [])[hit];
      if (kid) {
        e.stopPropagation();
        api.openChild(item.id, kid.id);
      }
    }
  }, true);

  root.addEventListener('click', (e) => {
    const slot = e.target.closest('.slot');""")

# 5) 清理时重置
s = s.replace("""  function clearSubRing() {
    subRing.innerHTML = '';
    subRing.classList.remove('is-on');
  }""",
"""  function clearSubRing() {
    subRing.innerHTML = '';
    subRing.classList.remove('is-on');
    subHover = -1;
  }""")
p.write_text(s, encoding="utf-8")
print("ok")
