/* QuickPie —— 条目管理界面 */
(() => {
  'use strict';

  const params = new URLSearchParams(location.search);
  const VIEW = params.get('view') || 'manager';
  const SHOT = params.get('shot') === '1';
  const api = window.api;
  if (VIEW !== 'manager') return;

  const $ = (id) => document.getElementById(id);
  const root = $('managerRoot');
  const listEl = $('itemList');
  const searchEl = $('searchInput');
  const toastEl = $('mToast');

  const TYPE_LABEL = {
    chat: '会话',
    group: '分组', folder: '目录', url: '网址', app: '应用', file: '文件' };
  const ICONS = {
    open: '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 3.5h3v3"/><path d="M12.5 3.5 7.6 8.4"/><path d="M11.6 9.4v2.3a1 1 0 0 1-1 1H4.4a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1h2.3"/></svg>',
    edit: '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M11.1 2.9a1.3 1.3 0 0 1 1.9 1.9l-7 7-2.5.6.6-2.5z"/></svg>',
    up: '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12.5V4"/><path d="M4.6 7.4 8 4l3.4 3.4"/></svg>',
    down: '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3.5V12"/><path d="M11.4 8.6 8 12l-3.4-3.4"/></svg>',
    trash: '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3.4 4.6h9.2"/><path d="M6.4 4.6V3.3h3.2v1.3"/><path d="M4.9 4.6 5.5 13h5l.6-8.4"/></svg>',
  };

  const S = {
    items: [],
    settings: {},
    meta: {},
    filter: 'all',
    query: '',
    selected: null,
    editing: null,
    recording: false,
  };

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  function prettyAccel(accel) {
    if (!accel) return '未设置';
    return accel.replace(/CommandOrControl/g, 'Ctrl').replace(/Control/g, 'Ctrl').replace(/Super/g, 'Win');
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
    if (item.icon) return `<img src="${esc(item.icon)}" alt="" draggable="false" />`;
    return `<span class="glyph-tile" data-type="${esc(item.type)}">${esc(glyphLetter(item))}</span>`;
  }

  let toastTimer = null;
  function toast(text, ms = 2200) {
    toastEl.textContent = text;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), ms);
  }

  /* ---------------- 数据 ---------------- */

  async function refresh(keepSelection = true) {
    const store = await api.getStore();
    S.items = store.items || [];
    S.settings = store.settings || {};
    S.meta = store.meta || {};
    if (window.__qpApplyTheme) window.__qpApplyTheme(S.settings.theme || 'auto');
    if (!keepSelection) S.selected = null;
    if (S.selected && !S.items.some((it) => it.id === S.selected)) S.selected = null;
    renderList();
    renderCounts();
    renderHeader();
    renderSettings();
    if (!S.editing && S.selected) {
      const item = S.items.find((it) => it.id === S.selected);
      if (item) S.editing = { ...item, isNew: false };
    }
    renderEditor();
  }

  function visibleItems() {
    const q = S.query.trim().toLowerCase();
    return S.items.filter((item) => {
      if (S.filter !== 'all' && item.type !== S.filter) return false;
      if (!q) return true;
      return `${item.name} ${item.target}`.toLowerCase().includes(q);
    });
  }

  function renderCounts() {
    const counts = { all: S.items.length, folder: 0, url: 0, app: 0, file: 0 };
    for (const item of S.items) counts[item.type] = (counts[item.type] || 0) + 1;
    document.querySelectorAll('[data-count]').forEach((node) => {
      node.textContent = String(counts[node.dataset.count] || 0);
    });
  }

  function renderHeader() {
    $('hotkeyKbd').textContent = prettyAccel(S.settings.hotkey);
    $('appVersion').textContent = S.meta.version || '0.1.0';
    $('dataDirHint').textContent = S.meta.dataDir || '';
    $('listHint').textContent = S.items.length
      ? `共 ${S.items.length} 项 · 轮盘每屏显示 ${S.meta.pageSize || 12} 项`
      : '把文件、文件夹、网址拖到窗口里即可添加';
  }

  function renderList() {
    const items = visibleItems();
    listEl.innerHTML = '';
    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-list';
      empty.innerHTML = S.items.length
        ? '没有匹配的条目。<br />换个关键词，或切换上方的筛选。'
        : '还没有任何条目。<br />点右上角「＋ 添加」，或直接把文件拖进来。';
      listEl.appendChild(empty);
      return;
    }
    for (const item of items) {
      const row = document.createElement('div');
      row.className = 'row';
      row.dataset.id = item.id;
      if (item.type === 'group') row.dataset.group = '1';
      if (S.selected === item.id) row.classList.add('is-on');
      const sub = item.type === 'url'
        ? item.target.replace(/^https?:\/\//i, '')
        : item.target;
      row.innerHTML = `
        <div class="row-icon">${iconMarkup(item)}</div>
        <div class="row-main">
          <div class="row-name">${esc(item.name)}</div>
          <div class="row-sub" title="${esc(item.target)}">${esc(sub)}</div>
        </div>
        <div class="row-side">
          <span class="badge" data-type="${esc(item.type)}">${TYPE_LABEL[item.type] || item.type}</span>
          <div class="row-actions">
            <button class="icobtn" data-act="open" title="打开">${ICONS.open}</button>
            <button class="icobtn" data-act="edit" title="编辑">${ICONS.edit}</button>
            <button class="icobtn" data-act="up" title="上移">${ICONS.up}</button>
            <button class="icobtn" data-act="down" title="下移">${ICONS.down}</button>
            <button class="icobtn danger" data-act="del" title="删除">${ICONS.trash}</button>
          </div>
        </div>`;
      listEl.appendChild(row);
    }
  }

  /* ---------------- 列表拖动（指针事件，不依赖 HTML5 DnD） ---------------- */

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

  /* ---------------- 编辑器 ---------------- */

  function blankDraft(type = 'folder') {
    return { isNew: true, type, name: '', target: '', args: '', icon: null };
  }

  function selectItem(id) {
    S.selected = id;
    const item = S.items.find((it) => it.id === id);
    S.editing = item ? { ...item, isNew: false } : null;
    switchTab('item');
    renderList();
    renderEditor();
  }

  function renderEditor() {
    const empty = $('editorEmpty');
    const form = $('editorForm');
    const draft = S.editing;
    if (!draft) {
      empty.hidden = false;
      form.hidden = true;
      return;
    }
    empty.hidden = true;
    form.hidden = false;

    $('fName').value = draft.name || '';
    $('fTarget').value = draft.target || '';
    $('fArgs').value = draft.args || '';
    $('argsField').style.display = draft.type === 'app' ? '' : 'none';
    const isChat = draft.type === 'chat';
    $('queryField').hidden = !isChat;
    $('queryField').style.display = isChat ? '' : 'none';
    if (isChat) $('fQuery').value = draft.query || '';
    $('fTarget').placeholder = isChat
      ? '留空即可（默认用微信 D:\\Weixin\\Weixin.exe）'
      : 'D:\\路径 或 https://example.com';
    const isGroup = draft.type === 'group';
    $('childField').hidden = !isGroup;
    $('childField').style.display = isGroup ? '' : 'none';
    if (isGroup) renderChildren(draft);
    $('previewName').textContent = draft.name || '（未命名）';
    $('previewType').textContent = `${TYPE_LABEL[draft.type] || draft.type}${draft.isNew ? ' · 新建' : ''}`;
    $('previewIcon').innerHTML = iconMarkup(draft);
    $('btnDelete').hidden = !!draft.isNew;
    $('btnSave').textContent = draft.isNew ? '添加' : '保存';
    document.querySelectorAll('#fType button').forEach((btn) => {
      btn.classList.toggle('is-on', btn.dataset.type === draft.type);
    });
  }

  function renderChildren(draft) {
    const box = $('childList');
    box.innerHTML = '';
    const kids = draft.children || [];
    if (!kids.length) {
      box.innerHTML = '<div class="child-empty">还没有二级条目</div>';
      return;
    }
    const addBtn = document.createElement('button');
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

    kids.forEach((kid) => {
      const row = document.createElement('div');
      row.className = 'child-row';
      row.innerHTML = `
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
      });

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
      });
      row.querySelector('button').addEventListener('click', async () => {
        await api.unnestItem(draft.id, kid.id);
        await refresh();
        const fresh = S.items.find((it) => it.id === draft.id);
        if (fresh) { S.editing = { ...fresh, isNew: false }; renderEditor(); }
      });
      box.appendChild(row);
    });
  }

  function startNew(type = 'folder') {
    S.selected = null;
    S.editing = blankDraft(type);
    switchTab('item');
    renderList();
    renderEditor();
    setTimeout(() => $('fName').focus(), 30);
  }

  async function saveDraft() {
    const draft = S.editing;
    if (!draft) return;
    // 直接从输入框取值：不依赖草稿是否同步
    const nameInput = ($('fName').value || '').trim();
    const target = ($('fTarget').value || '').trim();
    const argsInput = ($('fArgs').value || '').trim();
    const isGroup = draft.type === 'group';
    const isChat = draft.type === 'chat';
    if (!target && !isGroup && !isChat) {
      toast('请填写目标路径或网址'); $('fTarget').focus(); return;
    }
    const payload = {
      type: draft.type,
      name: nameInput,
      target,
      args: argsInput,
      query: ($('fQuery') ? $('fQuery').value : '').trim(),
      icon: draft.icon || undefined,
      children: isGroup ? (draft.children || []) : undefined,
    };
    if (draft.isNew) {
      const added = await api.addItems([payload]);
      if (added && added.length) {
        S.selected = added[0].id;
        S.editing = { ...added[0], isNew: false };
        toast('已添加');
      }
    } else {
      const res = await api.updateItem(draft.id, payload);
      if (res && res.ok) {
        S.selected = res.item.id;
        S.editing = { ...res.item, isNew: false };
        toast('已保存');
      } else {
        toast((res && res.error) || '保存失败');
      }
    }
    await refresh();
  }

  async function deleteCurrent() {
    if (!S.editing || S.editing.isNew) return;
    await api.removeItem(S.editing.id);
    S.selected = null;
    S.editing = null;
    await refresh();
    renderEditor();
    toast('已删除');
  }

  async function move(id, delta) {
    const ids = S.items.map((it) => it.id);
    const from = ids.indexOf(id);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= ids.length) return;
    [ids[from], ids[to]] = [ids[to], ids[from]];
    await api.reorder(ids);
    S.items = ids.map((id2) => S.items.find((it) => it.id === id2)).filter(Boolean);
    renderList();
  }

  /* ---------------- 设置 ---------------- */

  function renderSettings() {
    $('hotkeyValue').textContent = prettyAccel(S.settings.hotkey);
    $('autoLaunch').checked = !!S.settings.autoLaunch;
    document.querySelectorAll('#themeSeg button').forEach((btn) => {
      btn.classList.toggle('is-on', btn.dataset.theme === (S.settings.theme || 'auto'));
    });
  }

  /* ---------------- 快捷键录制 ---------------- */

  const KEY_NAMES = {
    ' ': 'Space', Escape: 'Esc', ArrowUp: 'Up', ArrowDown: 'Down', ArrowLeft: 'Left',
    ArrowRight: 'Right', Enter: 'Enter', Tab: 'Tab', Backspace: 'Backspace',
    Delete: 'Delete', Home: 'Home', End: 'End', PageUp: 'PageUp', PageDown: 'PageDown',
    Insert: 'Insert', PrintScreen: 'PrintScreen', '+': 'Plus',
  };

  function accelFromEvent(e) {
    const mods = [];
    if (e.ctrlKey) mods.push('Control');
    if (e.altKey) mods.push('Alt');
    if (e.shiftKey) mods.push('Shift');
    if (e.metaKey) mods.push('Super');
    let key = e.key;
    if (['Control', 'Alt', 'Shift', 'Meta'].includes(key)) return null;
    if (KEY_NAMES[key]) key = KEY_NAMES[key];
    else if (key.length === 1) key = key.toUpperCase();
    else if (/^F\d{1,2}$/.test(key)) { /* 保持 */ }
    else return null;
    if (!mods.length) return null;
    return [...mods, key].join('+');
  }

  function startRecording() {
    if (S.recording) return;
    S.recording = true;
    const btn = $('hotkeyBtn');
    btn.classList.add('is-rec');
    $('hotkeyValue').textContent = '按下组合键…';
    $('hotkeyWarn').hidden = true;

    const onKey = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === 'Escape') { stop(); return; }
      const accel = accelFromEvent(e);
      if (!accel) return; // 只有修饰键，继续等
      stop();
      const res = await api.updateSettings({ hotkey: accel });
      if (res && res.ok) {
        S.settings = res.settings;
        renderSettings();
        toast(`快捷键已改为 ${prettyAccel(accel)}`);
      } else {
        renderSettings();
        const warn = $('hotkeyWarn');
        warn.hidden = false;
        warn.textContent = (res && res.error) || '快捷键注册失败，换一个试试';
      }
    };

    const stop = () => {
      S.recording = false;
      btn.classList.remove('is-rec');
      window.removeEventListener('keydown', onKey, true);
      renderSettings();
    };
    window.addEventListener('keydown', onKey, true);
    btn._stopRecording = stop;
  }

  /* ---------------- 事件绑定 ---------------- */

  // 列表交互（委托）
  listEl.addEventListener('click', async (e) => {
    const row = e.target.closest('.row');
    if (!row) return;
    const id = row.dataset.id;
    const act = e.target.closest('[data-act]');
    if (!act) { selectItem(id); return; }
    e.stopPropagation();
    switch (act.dataset.act) {
      case 'open': {
        const res = await api.openItem(id);
        if (res && !res.ok) toast(res.error || '打开失败');
        break;
      }
      case 'edit': selectItem(id); break;
      case 'up': await move(id, -1); break;
      case 'down': await move(id, 1); break;
      case 'del': {
        await api.removeItem(id);
        if (S.selected === id) { S.selected = null; S.editing = null; }
        await refresh();
        toast('已删除');
        break;
      }
      default: break;
    }
  });

  listEl.addEventListener('dblclick', async (e) => {
    const row = e.target.closest('.row');
    if (!row) return;
    const res = await api.openItem(row.dataset.id);
    if (res && !res.ok) toast(res.error || '打开失败');
  });

  // 搜索 / 筛选
  searchEl.addEventListener('input', () => {
    S.query = searchEl.value;
    renderList();
  });
  searchEl.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { searchEl.value = ''; S.query = ''; renderList(); searchEl.blur(); }
  });

  $('filters').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    S.filter = chip.dataset.filter;
    document.querySelectorAll('.chip').forEach((c) => c.classList.toggle('is-on', c === chip));
    renderList();
  });

  // 表单
  $('fName').addEventListener('input', (e) => {
    if (!S.editing) return;
    S.editing.name = e.target.value;
    $('previewName').textContent = S.editing.name || '（未命名）';
  });
  $('fTarget').addEventListener('input', (e) => {
    if (!S.editing) return;
    S.editing.target = e.target.value;
  });
  $('fQuery').addEventListener('input', (e) => {
    if (S.editing) S.editing.query = e.target.value;
  });

  $('fArgs').addEventListener('input', (e) => {
    if (!S.editing) return;
    S.editing.args = e.target.value;
  });
  $('fType').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-type]');
    if (!btn || !S.editing) return;
    S.editing.type = btn.dataset.type;
    renderEditor();
  });
  $('editorForm').addEventListener('submit', (e) => {
    e.preventDefault();
    saveDraft();
  });
  $('btnCancel').addEventListener('click', () => {
    if (S.editing && !S.editing.isNew) S.editing = { ...S.items.find((it) => it.id === S.editing.id) || S.editing, isNew: false };
    else { S.editing = null; S.selected = null; }
    renderList();
    renderEditor();
  });
  $('btnDelete').addEventListener('click', deleteCurrent);
  $('btnBrowse').addEventListener('click', async () => {
    if (!S.editing) return;
    const kind = S.editing.type === 'folder' ? 'folder' : S.editing.type === 'app' ? 'app' : 'file';
    const res = await api.pick(kind);
    if (!res || res.canceled) return;
    S.editing.target = res.path;
    S.editing.icon = null;
    if (!S.editing.name) {
      const base = res.path.replace(/[\\/]+$/, '').split(/[\\/]/).pop() || '';
      S.editing.name = S.editing.type === 'app' ? base.replace(/\.(exe|lnk|bat|cmd)$/i, '') : base;
      $('fName').value = S.editing.name;
      $('previewName').textContent = S.editing.name;
    }
    $('fTarget').value = res.path;
    renderEditor();
  });
  $('btnIconCustom').addEventListener('click', async () => {
    const res = await api.pickIcon();
    if (!res || !res.ok) return;
    S.editing.icon = res.icon;
    $('previewIcon').innerHTML = `<img src="${res.icon}" alt="" />`;
    toast('已选择自定义图标，记得点保存');
  });

  $('btnIconAuto').addEventListener('click', async () => {
    if (!S.editing) return;
    const icon = await api.resolveIcon(S.editing.type, S.editing.target);
    S.editing.icon = icon || null;
    renderEditor();
    toast(icon ? '图标已更新' : '没取到图标，继续用字母牌');
  });

  // 顶栏
  $('btnAdd').addEventListener('click', () => startNew('folder'));
  $('btnOpenWheel').addEventListener('click', () => api.showWheel());
  $('btnMin').addEventListener('click', () => api.minimize());
  $('btnClose').addEventListener('click', () => api.closeWindow());

  $('btnPaste').addEventListener('click', async () => {
    const text = await api.readClipboard();
    if (!text || !text.trim()) { toast('剪贴板是空的'); return; }
    const lines = text.split(/\r?\n/).map((s) => s.trim().replace(/^"(.*)"$/, '$1')).filter(Boolean);
    if (!lines.length) { toast('没识别到可用内容'); return; }
    const added = await api.addItems(lines.map((target) => ({ target })));
    await refresh();
    toast(`已从剪贴板加入 ${added.length} 项`);
  });

  // 设置
  $('hotkeyBtn').addEventListener('click', () => {
    if (S.recording && $('hotkeyBtn')._stopRecording) $('hotkeyBtn')._stopRecording();
    else startRecording();
  });
  $('autoLaunch').addEventListener('change', async (e) => {
    const res = await api.updateSettings({ autoLaunch: e.target.checked });
    if (res && res.settings) S.settings = res.settings;
    toast(e.target.checked ? '已设置开机自启' : '已关闭开机自启');
  });
  $('themeSeg').addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-theme]');
    if (!btn) return;
    const res = await api.updateSettings({ theme: btn.dataset.theme });
    if (res && res.settings) {
      S.settings = res.settings;
      if (window.__qpApplyTheme) window.__qpApplyTheme(S.settings.theme);
      renderSettings();
    }
  });
  $('btnExport').addEventListener('click', async () => {
    const res = await api.exportData();
    if (res && res.ok) toast('已导出到 ' + res.path, 3200);
    else if (res && res.error) toast(res.error);
  });
  $('btnImport').addEventListener('click', async () => {
    const res = await api.importData();
    if (res && res.ok) { await refresh(); toast(`已导入 ${res.count} 项`); }
    else if (res && res.error) toast(res.error);
  });
  $('btnDataDir').addEventListener('click', () => api.openDataDir());

  // 标签页
  function switchTab(name) {
    document.querySelectorAll('#tabs .tab').forEach((t) => t.classList.toggle('is-on', t.dataset.tab === name));
    $('tabItem').hidden = name !== 'item';
    $('tabSettings').hidden = name !== 'settings';
  }
  $('tabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (tab) switchTab(tab.dataset.tab);
  });

  // 全局快捷键
  document.addEventListener('keydown', (e) => {
    if (S.recording) return;
    const inField = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
    if (e.key === '/' && !inField) { e.preventDefault(); searchEl.focus(); }
    if (e.ctrlKey && e.key.toLowerCase() === 'n') { e.preventDefault(); startNew('folder'); }
    if (e.key === 'Escape' && inField) document.activeElement.blur();
  });

  // 拖拽添加
  document.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
  document.addEventListener('drop', async (e) => {
    e.preventDefault();
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
    if (!targets.length) return;
    const added = await api.addItems(targets.map((target) => ({ target })));
    await refresh();
    if (added && added.length) {
      selectItem(added[0].id);
      const el = listEl.querySelector(`.row[data-id="${added[0].id}"]`);
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
    toast(`已加入 ${added.length} 项`);
  });

  api.on('store:changed', () => refresh());

  /* 首帧 */
  (async () => {
    root.hidden = false;
    if (SHOT) document.body.classList.add('is-shot-manager');
    await refresh(false);
    if (SHOT && S.items.length) selectItem(S.items[0].id);
  })();
})();
