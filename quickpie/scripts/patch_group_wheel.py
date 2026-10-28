import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\wheel.js")
s = p.read_text(encoding="utf-8")

start = s.index("  let chipToken = 0;")
end = s.index("  function clearHot() {")
new = '''  let chipToken = 0;

  /// 把一组胶囊沿弧线排开（切向扇形），避免径向往外排到窗外
  function layoutChips(items, angle, onClick, fallback) {
    const n = items.length;
    const span = Math.min(15, 96 / Math.max(n, 1));   // 相邻胶囊角度间隔
    const start = angle - (span * (n - 1)) / 2;
    items.forEach((entry, k) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.style.setProperty('--a', `${start + k * span}deg`);
      chip.style.setProperty('--r', '300px');

      if (entry.icon) {
        const img = document.createElement('img');
        img.src = entry.icon;
        img.alt = '';
        chip.appendChild(img);
      }
      const label = document.createElement('span');
      label.textContent = entry.label;
      chip.appendChild(label);
      chip.title = entry.title || entry.label;
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        onClick(entry);
      });
      chipsEl.appendChild(chip);
    });
  }

  async function showChips(index) {
    clearChips();
    const item = S.pageItems[index];
    if (!item) return;
    const count = S.pageItems.length || 1;
    const angle = index * (360 / count);

    // 分组：悬停展开二级条目
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

    if (item.type !== 'app') return;
    const token = ++chipToken;
    let list = [];
    try {
      list = await api.windowsFor(item.id) || [];
    } catch (_) {
      return;
    }
    if (token !== chipToken || S.hot !== index) return;
    if (!list.length) return;
    layoutChips(
      list.slice(0, 6).map((win) => ({ label: win.t, title: win.t, win })),
      angle,
      (entry) => api.focusWindow(entry.win.p),
    );
  }

'''
s = s[:start] + new + s[end:]
p.write_text(s, encoding="utf-8")
print("wheel chips ok")
