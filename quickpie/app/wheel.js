/* QuickPie —— 轮盘渲染与交互 */
(() => {
  'use strict';

  const params = new URLSearchParams(location.search);
  const VIEW = params.get('view') || 'manager';
  const SHOT = params.get('shot') === '1';
  const api = window.api;

  /* 主题（两个视图共用） */
  function applyTheme(theme) {
    const dark = theme === 'dark' ||
      (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.documentElement.dataset.themePref = theme;
  }
  window.__qpApplyTheme = applyTheme;
  if (SHOT) document.body.classList.add('is-shot');

  if (VIEW !== 'wheel') return;

  const root = document.getElementById('wheelRoot');
  const zoom = document.getElementById('wheelZoom');
  const scale = document.getElementById('wheelScale');
  const ring = document.getElementById('wheelRing');
  const slotsEl = document.getElementById('wheelSlots');
  const chipsEl = document.getElementById('wheelChips');
  const hub = document.getElementById('wheelHub');
  const hubEyebrow = document.getElementById('hubEyebrow');
  const hubTitle = document.getElementById('hubTitle');
  const hubSub = document.getElementById('hubSub');
  const hubDots = document.getElementById('hubDots');
  const dropVeil = document.getElementById('dropVeil');
  const toastEl = document.getElementById('toast');

  const CX = 380, CY = 380;
  const R_IN = 140, R_OUT = 250, R_SLOT = 196;   // 一级环带（比原来薄 40px）
  const SUB_IN = 262, SUB_OUT = 344;             // 二级小扇面所在的环带
  const PAGE = 12;
  const GAP_DEG = 0.6;
  const DESIGN = 760;
  const NS = 'http://www.w3.org/2000/svg';

  const TYPE_LABEL = { folder: '目录', url: '网址', app: '应用', file: '文件' };

  const S = {
    items: [],
    settings: {},
    page: 0,
    hot: -1,
    missing: new Set(),
    pages: 1,
    pageItems: [],
    viewCache: new Map(),
  };

  /* ---------------- 工具 ---------------- */

  const el = (tag, cls, html) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html !== undefined) node.innerHTML = html;
    return node;
  };

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  function middleEllipsis(text, head = 14, tail = 18) {
    const t = String(text || '');
    if (t.length <= head + tail + 1) return t;
    return `${t.slice(0, head)}…${t.slice(-tail)}`;
  }

  function displayTarget(item) {
    if (item.type === 'url') {
      return String(item.target).replace(/^https?:\/\//i, '').replace(/\/$/, '');
    }
    return middleEllipsis(item.target, 16, 20);
  }

  function glyphLetter(item) {
    if (item.type === 'url') {
      try {
        const host = new URL(/^[a-z]+:\/\//i.test(item.target) ? item.target : `https://${item.target}`).hostname;
        return host.replace(/^www\./, '').charAt(0).toUpperCase() || 'W';
      } catch (_) { return 'W'; }
    }
    return (item.name || '?').trim().charAt(0).toUpperCase() || '?';
  }

  function iconMarkup(item) {
    if (item.icon) {
      return `<img src="${esc(item.icon)}" alt="" draggable="false" />`;
    }
    return `<span class="glyph-tile" data-type="${esc(item.type)}">${esc(glyphLetter(item))}</span>`;
  }

  /* ---------------- 几何 ---------------- */

  function polar(r, deg) {
    const a = ((deg - 90) * Math.PI) / 180;
    return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
  }

  function sectorPath(a1, a2, r1 = R_IN, r2 = R_OUT) {
    const span = a2 - a1;
    if (span >= 359.9) a2 = a1 + 359.9;
    const large = a2 - a1 > 180 ? 1 : 0;
    const [x1, y1] = polar(r2, a1);
    const [x2, y2] = polar(r2, a2);
    const [x3, y3] = polar(r1, a2);
    const [x4, y4] = polar(r1, a1);
    const f = (n) => n.toFixed(2);
    return [
      `M${f(x1)} ${f(y1)}`,
      `A${r2} ${r2} 0 ${large} 1 ${f(x2)} ${f(y2)}`,
      `L${f(x3)} ${f(y3)}`,
      `A${r1} ${r1} 0 ${large} 0 ${f(x4)} ${f(y4)}`,
      'Z',
    ].join(' ');
  }

  /* ---------------- 二级小扇面 ---------------- */

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


  const subRing = document.createElementNS(NS, 'g');
  subRing.setAttribute('class', 'sub-ring');
  document.getElementById('wheelRing').appendChild(subRing);

  function clearSubRing() {
    subRing.innerHTML = '';
    subRing.classList.remove('is-on');
    subHover = -1;
  }

  /// 把父扇区外沿切成 N 个小扇面
  function drawSubRing(item, index) {
    try {
    return drawSubRingInner(item, index);
    } catch (err) {
      hubSub.textContent = `二级渲染失败: ${err.message}`;
      return undefined;
    }
  }

  function drawSubRingInner(item, index) {
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
      const arc = ((a2 - a1) * Math.PI / 180) * midR;   // 这个格子有多宽（像素）

      // 图标 + 文字整体沿半径方向旋转，避免横向文字溢出扇面
      const flip = mid > 90 && mid < 270;   // 下半圈把文字翻 180°，避免倒着读
      const rot = flip ? mid + 180 : mid;
      const dir = flip ? 1 : -1;
      const group = document.createElementNS(NS, 'g');
      group.setAttribute('transform', `rotate(${rot.toFixed(2)} ${CX} ${CY})`);

      if (kid.icon) {
        const img = document.createElementNS(NS, 'image');
        img.setAttribute('href', kid.icon);
        img.setAttribute('x', (CX - 10).toFixed(2));
        img.setAttribute('y', (CY + dir * (midR + (arc > 62 ? 16 : 8))).toFixed(2));
        img.setAttribute('width', '20');
        img.setAttribute('height', '20');
        img.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        group.appendChild(img);
      }

      if (arc > 52) {
        const text = document.createElementNS(NS, 'text');
        text.setAttribute('x', CX.toFixed(2));
        text.setAttribute('y', (CY + dir * (midR - (kid.icon ? 14 : 0))).toFixed(2));
        text.setAttribute('class', 'sub-label');
        text.textContent = kid.name.length > 7 ? `${kid.name.slice(0, 6)}…` : kid.name;
        group.appendChild(text);
      }

      subRing.appendChild(group);
    });

    subRing.classList.add('is-on');
  }

  /* ---------------- 渲染 ---------------- */

  /** 轮盘底衬：让扇区之间的缝隙透出浅色而不是桌面 */
  function makePlate() {
    const plate = document.createElementNS(NS, 'circle');
    plate.setAttribute('cx', CX);
    plate.setAttribute('cy', CY);
    plate.setAttribute('r', R_OUT);
    plate.setAttribute('class', 'plate');
    return plate;
  }

  function render() {
    clearChips();
    clearSubRing();
    const total = S.items.length;
    S.pages = Math.max(1, Math.ceil(total / PAGE));
    S.page = Math.min(S.page, S.pages - 1);
    const start = S.page * PAGE;
    S.pageItems = S.items.slice(start, start + PAGE);

    ring.innerHTML = '';
    ring.appendChild(subRing);   // render 会清空整个 SVG，子环要挂回去
    slotsEl.innerHTML = '';


    if (total === 0) {
      renderGhosts();
      updateHubDefault();
      return;
    }

    const count = S.pageItems.length;
    const step = 360 / count;
    const half = step / 2 - (count === 1 ? 0 : GAP_DEG);

    ring.appendChild(makePlate());

    S.pageItems.forEach((item, i) => {
      const angle = i * step;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', sectorPath(angle - half, angle + half));
      path.dataset.index = String(i);
      if (S.missing.has(item.id)) path.setAttribute('opacity', '.55');
      ring.appendChild(path);

      const slot = el('button', 'slot');
      slot.type = 'button';
      slot.dataset.index = String(i);
      slot.style.setProperty('--a', `${angle}deg`);
      slot.style.setProperty('--r', `${R_SLOT}px`);
      slot.style.setProperty('--d', `${i * 16}ms`);
      // 不设 title：原生 tooltip 会飘在轮盘上盖住二级胶囊，中心已经把名字和路径显示全了
      slot.removeAttribute('title');
      if (S.missing.has(item.id)) slot.classList.add('is-missing');
      slot.innerHTML = `
        <span class="slot-tile">${iconMarkup(item)}</span>
        <span class="slot-name">${esc(item.name)}</span>`;
      slotsEl.appendChild(slot);
    });

    updateHubDefault();
    updateDots();
  }

  function renderGhosts() {
    const ghosts = 6;
    const step = 360 / ghosts;
    ring.appendChild(makePlate());
    for (let i = 0; i < ghosts; i += 1) {
      const angle = i * step;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', sectorPath(angle - step / 2 + GAP_DEG, angle + step / 2 - GAP_DEG));
      path.classList.add('is-empty');
      ring.appendChild(path);

      const slot = el('button', 'slot is-ghost');
      slot.type = 'button';
      slot.style.setProperty('--a', `${angle}deg`);
      slot.style.setProperty('--r', `${R_SLOT}px`);
      slot.style.setProperty('--d', `${i * 16}ms`);
      slot.innerHTML = `
        <span class="slot-tile"></span>
        <span class="slot-name">${i === 0 ? '添加' : ''}</span>`;
      slot.addEventListener('click', () => { api.openManager(); api.hideWheel(); });
      slotsEl.appendChild(slot);
    }
  }

  function updateDots() {
    hubDots.innerHTML = '';
    if (S.pages <= 1) {
      hubDots.classList.remove('is-on');
      return;
    }
    hubDots.classList.add('is-on');
    for (let i = 0; i < S.pages; i += 1) {
      const dot = el('i');
      if (i === S.page) dot.classList.add('is-on');
      hubDots.appendChild(dot);
    }
  }

  function updateHubDefault() {
    const total = S.items.length;
    hub.classList.add('is-idle');
    hubEyebrow.textContent = '';
    if (!total) {
      hubTitle.textContent = '还没有条目';
      hubSub.textContent = '拖文件进来，或按 Tab 管理';
      return;
    }
    hubTitle.textContent = '轮盘夹';
    const words = [`${total} 个快捷项`];
    if (S.pages > 1) words.push(`第 ${S.page + 1}/${S.pages} 屏 · 滚轮翻页`);
    hubSub.textContent = words.join(' · ');
  }

  function setHot(index) {
    if (S.hot === index) return;
    S.hot = index;
    const item = S.pageItems[index];
    slotsEl.querySelectorAll('.slot').forEach((node) => {
      node.classList.toggle('is-hot', Number(node.dataset.index) === index && !node.classList.contains('is-ghost'));
    });
    ring.querySelectorAll('path').forEach((node) => {
      node.classList.toggle('is-hot', Number(node.dataset.index) === index);
    });
    if (!item) {
      updateHubDefault();
      clearChips();
      clearSubRing();
      return;
    }
    hub.classList.remove('is-idle');
    hubEyebrow.textContent = TYPE_LABEL[item.type] || '条目';
    hubTitle.textContent = item.name;
    const bits = [];
    if (S.missing.has(item.id)) bits.push('路径不存在');
    bits.push(displayTarget(item));
    hubSub.textContent = bits.join(' · ');
    if (item.type === 'group') drawSubRing(item, index);
    else clearSubRing();
    showChips(index);
  }

  /* ---------------- 外环：该应用的窗口 ---------------- */

  function clearChips() {
    chipsEl.innerHTML = '';
  }

  let chipToken = 0;

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
      if (entry.keepTitle) chip.title = entry.title || entry.label;
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

    // 分组：二级用外侧小扇面表现，这里不画胶囊
    if (item.type === 'group') return;

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
      list.slice(0, 6).map((win) => ({ label: win.t, title: win.t, win, keepTitle: true })),
      angle,
      (entry) => api.focusWindow(entry.win.p),
    );
  }

  function clearHot() {
    if (S.hot === -1) return;
    S.hot = -1;
    slotsEl.querySelectorAll('.slot').forEach((n) => n.classList.remove('is-hot'));
    ring.querySelectorAll('path').forEach((n) => n.classList.remove('is-hot'));
    clearChips();
    clearSubRing();
    updateHubDefault();
  }

  /* ---------------- 操作 ---------------- */

  let errorTimer = null;
  function showError(message) {
    hubEyebrow.textContent = '打开失败';
    hubTitle.textContent = '没能打开';
    hubSub.textContent = message || '未知原因';
    hubTitle.style.color = 'var(--accent)';
    clearTimeout(errorTimer);
    errorTimer = setTimeout(() => {
      hubTitle.style.color = '';
      if (S.hot >= 0) setHot(S.hot); else updateHubDefault();
    }, 4000);
    showToast(message || '打开失败');
  }

  async function openAt(index) {
    const item = S.pageItems[index];
    if (!item) return;
    const res = await api.openItem(item.id);
    if (res && !res.ok) showError(res.error);
  }

  function stepPage(dir) {
    if (S.pages <= 1) return;
    const next = (S.page + dir + S.pages) % S.pages;
    if (next === S.page) return;
    S.page = next;
    S.hot = -1;
    scale.style.transition = 'opacity .12s ease, transform .18s ease';
    scale.style.opacity = '0';
    scale.style.transform = 'scale(.985)';
    setTimeout(() => {
      render();
      scale.style.opacity = '1';
      scale.style.transform = 'scale(1)';
      setTimeout(() => { scale.style.transition = ''; }, 220);
    }, 110);
  }

  let toastTimer = null;
  function showToast(text) {
    toastEl.textContent = text;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2400);
  }

  function moveHot(delta) {
    const count = S.pageItems.length;
    if (!count) return;
    const base = S.hot < 0 ? (delta > 0 ? -1 : 0) : S.hot;
    const next = (base + delta + count * 2) % count;
    setHot(next);
  }

  async function reload(preservePage = true) {
    const store = await api.getStore();
    S.items = store.items || [];
    S.settings = store.settings || {};
    if (window.__qpApplyTheme) window.__qpApplyTheme(S.settings.theme || 'auto');
    if (!preservePage) S.page = 0;
    S.page = Math.min(S.page, Math.max(0, Math.ceil(S.items.length / PAGE) - 1));
    render();
    const probe = await api.probe();
    S.missing = new Set(probe.missing || []);
    render();
  }

  /* ---------------- 事件 ---------------- */

  root.addEventListener('mouseover', (e) => {
    const slot = e.target.closest('.slot');
    if (slot && !slot.classList.contains('is-ghost')) {
      setHot(Number(slot.dataset.index));
      return;
    }
    if (e.target === root || e.target === scale || e.target === ring) {
      if (subHitAt(e.clientX, e.clientY) >= 0) return;   // 正穿过二级环带，保持
      clearHot();
    }
  });

  root.addEventListener('mousemove', (e) => {
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
    const slot = e.target.closest('.slot');
    if (slot) {
      if (slot.classList.contains('is-ghost')) return;
      openAt(Number(slot.dataset.index));
      return;
    }
    const path = e.target.closest('path[data-index]');
    if (path) {
      openAt(Number(path.dataset.index));
      return;
    }
    if (e.target === root || e.target === scale || e.target === ring) api.hideWheel();
  });

  root.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (Math.abs(e.deltaY) < 3) return;
    stepPage(e.deltaY > 0 ? 1 : -1);
  }, { passive: false });

  /* ---------------- 快速添加：Ctrl+V / 就地输入 ---------------- */

  let quickBox = null;

  function closeQuickInput() {
    if (!quickBox) return;
    quickBox.remove();
    quickBox = null;
  }

  /// 当前悬停的分组（没有则 null）——快速添加时优先加进它
  function hotGroup() {
    if (S.hot < 0) return null;
    const item = S.pageItems[S.hot];
    return item && item.type === 'group' ? item : null;
  }

  function openQuickInput(initial = '') {
    if (quickBox) {
      quickBox.querySelector('input').focus();
      return;
    }
    const wrap = document.createElement('div');
    wrap.className = 'quick-input';
    const grp = hotGroup();
    wrap.innerHTML = `
      <input type="text" spellcheck="false" placeholder="${grp ? `添加到「${grp.name}」：粘贴网址 / 路径，回车` : '粘贴或输入网址 / 路径，回车添加'}" />
      <kbd>Enter</kbd>`;
    const input = wrap.querySelector('input');
    input.value = initial;
    input.addEventListener('keydown', async (ev) => {
      ev.stopPropagation();
      if (ev.key === 'Escape') { closeQuickInput(); return; }
      if (ev.key !== 'Enter') return;
      const value = input.value.trim();
      if (!value) { closeQuickInput(); return; }
      const list = value.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
      closeQuickInput();
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
      if (added && added.length) {
        await reload();
        const first = S.items.findIndex((it) => it.id === added[0].id);
        if (first >= 0) { S.page = Math.floor(first / PAGE); render(); setHot(first % PAGE); }
        showToast(`已加入 ${added.length} 个条目`);
      } else {
        showToast('没识别到可添加的内容');
      }
    });
    document.getElementById('wheelRoot').appendChild(wrap);
    setTimeout(() => input.focus(), 20);
    quickBox = wrap;
  }

  async function addFromClipboard() {
    const text = (await api.readClipboard()) || '';
    const line = text.split(/\r?\n/).map((x) => x.trim()).filter(Boolean)[0];
    if (!line) { showToast('剪贴板是空的'); return; }
    openQuickInput(line);          // 先放进输入条，让你确认/编辑再回车
  }

  document.addEventListener('keydown', (e) => {
    if (quickBox) return;          // 输入条自己处理
    if (e.ctrlKey && (e.key === 'v' || e.key === 'V')) {
      e.preventDefault();
      addFromClipboard();
      return;
    }
    if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1 && !/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      openQuickInput(e.key);
      return;
    }
    if (e.key === 'Escape') { api.hideWheel(); return; }
    if (e.key === 'Enter') {
      e.preventDefault();
      openAt(S.hot >= 0 ? S.hot : 0);
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      api.openManager();
      api.hideWheel();
      return;
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); moveHot(1); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); moveHot(-1); }
    if (e.key === 'PageDown') { e.preventDefault(); stepPage(1); }
    if (e.key === 'PageUp') { e.preventDefault(); stepPage(-1); }
  });


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

  /* 拖拽添加 */
  let dragDepth = 0;
  window.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dragDepth += 1;
    dropVeil.classList.add('is-on');
  });
  window.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    dropIndex = slotAtPoint(e.clientX, e.clientY);
    paintDropTarget(dropIndex);
  });
  window.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragDepth = Math.max(0, dragDepth - 1);
    if (!dragDepth) {
      dropVeil.classList.remove('is-on');
      dropIndex = -1;
      paintDropTarget(-1);
    }
  });
  window.addEventListener('drop', async (e) => {
    e.preventDefault();
    dragDepth = 0;
    dropVeil.classList.remove('is-on');
    const targets = [];
    for (const file of e.dataTransfer.files || []) {
      try {
        const p = api.pathForFile(file);
        if (p && !targets.includes(p)) targets.push(p);
      } catch (_) { /* ignore */ }
    }
    const uri = e.dataTransfer.getData('text/uri-list');
    if (uri) {
      for (const line of uri.split(/\r?\n/)) {
        const t = line.trim();
        if (!t || t.startsWith('#')) continue;
        if (t.startsWith('file://')) {
          try {
            const p = decodeURIComponent(new URL(t).pathname).replace(/^\//, '').replace(/\//g, '\\');
            if (!targets.includes(p)) targets.push(p);
          } catch (_) { /* ignore */ }
        } else if (/^https?:/i.test(t) && !targets.includes(t)) {
          targets.push(t);
        }
      }
    }
    const text = (e.dataTransfer.getData('text/plain') || '').trim();
    if (text && !targets.includes(text) && /[\w\\/:.-]{3,}/.test(text) && !text.includes('\n')) {
      targets.push(text);
    }
    if (!targets.length) return;
    const dropGroup = dropIndex >= 0 ? S.pageItems[dropIndex] : null;
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

    const insertAt = dropIndex >= 0 ? S.page * 12 + dropIndex : -1;
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
      : `已加入 ${added.length} 个条目`);
  });

  api.on('store:changed', () => reload());
  api.on('windows:changed', () => {
    if (S.hot >= 0) showChips(S.hot);
  });
  api.on('shot:hover', (index) => {
    setHot(Number(index));
  });
  api.on('wheel:opened', async (payload) => {
    const size = (payload && payload.size) || DESIGN;
    zoom.style.setProperty('--zoom', String(Math.min(1, size / DESIGN)));
    S.hot = -1;
    clearChips();
    closeQuickInput();
    await reload();
    root.classList.remove('is-closing', 'is-open');
    void root.offsetWidth;
    root.classList.add('is-open');
  });

  /* 首帧 */
  (async () => {
    root.hidden = false;
    zoom.style.setProperty('--zoom', String(Math.min(1, window.innerWidth / DESIGN)));
    await reload(false);
    if (SHOT) {
      root.classList.add('is-open');
      setTimeout(() => { S.hot = -1; setHot(0); }, 700);
    } else {
      root.classList.add('is-open');
    }
  })();
})();
