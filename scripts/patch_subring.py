import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\wheel.js")
s = p.read_text(encoding="utf-8")

# 1) 常量 + 子环容器
s = s.replace("""  const R_IN = 112, R_OUT = 262, R_SLOT = 190;""",
"""  const R_IN = 112, R_OUT = 262, R_SLOT = 190;
  const SUB_IN = 274, SUB_OUT = 352;   // 二级小扇面所在的环带""")

s = s.replace("""  /* ---------------- 渲染 ---------------- */""",
"""  /* ---------------- 二级小扇面 ---------------- */

  const subRing = document.createElementNS(NS, 'g');
  subRing.setAttribute('class', 'sub-ring');
  document.getElementById('wheelRing').appendChild(subRing);

  function clearSubRing() {
    subRing.innerHTML = '';
    subRing.classList.remove('is-on');
  }

  /// 把父扇区外沿切成 N 个小扇面
  function drawSubRing(item, index) {
    clearSubRing();
    const kids = (item && item.children) || [];
    if (!kids.length) return;

    const count = S.pageItems.length || 1;
    const step = 360 / count;
    const base = index * step;
    const span = step - GAP_DEG * 2;
    const gap = Math.min(0.9, span / (kids.length * 6));   // 小扇面之间的缝
    const cell = span / kids.length;

    kids.forEach((kid, k) => {
      const a1 = base - span / 2 + k * cell + gap / 2;
      const a2 = a1 + cell - gap;

      const path = document.createElementNS(NS, 'path');
      path.setAttribute('d', sectorPath(a1, a2, SUB_IN, SUB_OUT));
      path.setAttribute('class', 'sub-sector');
      path.addEventListener('click', (e) => {
        e.stopPropagation();
        api.openChild(item.id, kid.id);
      });
      path.addEventListener('mouseenter', () => {
        hubEyebrow.textContent = '二级';
        hubTitle.textContent = kid.name;
        hubSub.textContent = displayTarget(kid);
      });
      path.addEventListener('mouseleave', () => setHot(index));
      subRing.appendChild(path);

      const mid = (a1 + a2) / 2;
      const midR = (SUB_IN + SUB_OUT) / 2;
      const arc = ((a2 - a1) * Math.PI / 180) * midR;      // 这个格子有多宽（像素）

      if (kid.icon) {
        const [ix, iy] = polar(midR + (arc > 62 ? 6 : 0), mid);
        const img = document.createElementNS(NS, 'image');
        img.setAttribute('href', kid.icon);
        img.setAttribute('x', (ix - 10).toFixed(2));
        img.setAttribute('y', (iy - 10).toFixed(2));
        img.setAttribute('width', '20');
        img.setAttribute('height', '20');
        img.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        subRing.appendChild(img);
        path.dataset.hasIcon = '1';
      }

      if (arc > 58) {
        const [tx, ty] = polar(midR - 14, mid);
        const text = document.createElementNS(NS, 'text');
        text.setAttribute('x', tx.toFixed(2));
        text.setAttribute('y', ty.toFixed(2));
        text.setAttribute('class', 'sub-label');
        text.textContent = kid.name.length > 6 ? `${kid.name.slice(0, 5)}…` : kid.name;
        subRing.appendChild(text);
      }
    });

    subRing.classList.add('is-on');
  }

  /* ---------------- 渲染 ---------------- */""")

# 2) setHot 里挂上；清空时清
s = s.replace("""    showChips(index);
  }""",
"""    if (item.type === 'group') drawSubRing(item, index);
    else clearSubRing();
    showChips(index);
  }""", 1)
s = s.replace("""    if (!item) {
      updateHubDefault();
      clearChips();
      return;
    }""",
"""    if (!item) {
      updateHubDefault();
      clearChips();
      clearSubRing();
      return;
    }""")
s = s.replace("""    clearChips();
    updateHubDefault();
  }""",
"""    clearChips();
    clearSubRing();
    updateHubDefault();
  }""")
s = s.replace("""  function render() {
    clearChips();""",
"""  function render() {
    clearChips();
    clearSubRing();""")

# 3) 分组不再画胶囊（改由小扇面承担）
s = s.replace("""    // 分组：悬停展开二级条目
    if (item.type === 'group') {
      const kids = item.children || [];
      if (!kids.length) return;
      layoutChips(
        kids.slice(0, 8).map((kid) => ({
          label: kid.name,
          title: `${kid.name}\\n${kid.target}`,
          icon: kid.icon || null,
          kid,
        })),
        angle,
        (entry) => api.openChild(item.id, entry.kid.id),
      );
      return;
    }
""", """    // 分组：二级用外侧小扇面表现，这里不画胶囊
    if (item.type === 'group') return;
""")
p.write_text(s, encoding="utf-8")
print("wheel ok")
