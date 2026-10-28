import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\wheel.js")
s = p.read_text(encoding="utf-8")

# 1) 快捷键：Ctrl+V 直接加剪贴板；可打印字符唤起输入条
anchor = """  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { api.hideWheel(); return; }"""
new_anchor = """  /* ---------------- 快速添加：Ctrl+V / 就地输入 ---------------- */

  let quickBox = null;

  function closeQuickInput() {
    if (!quickBox) return;
    quickBox.remove();
    quickBox = null;
  }

  function openQuickInput(initial = '') {
    if (quickBox) {
      quickBox.querySelector('input').focus();
      return;
    }
    const wrap = document.createElement('div');
    wrap.className = 'quick-input';
    wrap.innerHTML = `
      <input type="text" spellcheck="false" placeholder="粘贴或输入网址 / 路径，回车添加" />
      <kbd>Enter</kbd>`;
    const input = wrap.querySelector('input');
    input.value = initial;
    input.addEventListener('keydown', async (ev) => {
      ev.stopPropagation();
      if (ev.key === 'Escape') { closeQuickInput(); return; }
      if (ev.key !== 'Enter') return;
      const value = input.value.trim();
      if (!value) { closeQuickInput(); return; }
      const list = value.split(/\\r?\\n/).map((x) => x.trim()).filter(Boolean);
      closeQuickInput();
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
    const line = text.split(/\\r?\\n/).map((x) => x.trim()).filter(Boolean)[0];
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
    if (e.key === 'Escape') { api.hideWheel(); return; }"""
assert anchor in s
s = s.replace(anchor, new_anchor)

# 2) 打开轮盘时关掉输入条
s = s.replace("""    S.hot = -1;
    clearChips();
    await reload();""",
"""    S.hot = -1;
    clearChips();
    closeQuickInput();
    await reload();""")
p.write_text(s, encoding="utf-8")
print("ok")
