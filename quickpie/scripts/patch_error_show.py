import pathlib

# main.js：记录每次打开的结果到 userData/open.log
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = p.read_text(encoding="utf-8")
s = s.replace("""  ipcMain.handle('app:open', async (_e, id) => {
    const item = state.items.find((it) => it.id === id);
    try {
      await openItem(item);
      hideWheel();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });""",
"""  ipcMain.handle('app:open', async (_e, id) => {
    const item = state.items.find((it) => it.id === id);
    const logPath = path.join(app.getPath('userData'), 'open.log');
    try {
      await openItem(item);
      fs.appendFileSync(logPath, `${new Date().toISOString()} OK   ${item?.type} ${item?.target}\\n`, 'utf8');
      hideWheel();
      return { ok: true };
    } catch (err) {
      fs.appendFileSync(logPath, `${new Date().toISOString()} FAIL ${item?.type} ${item?.target} :: ${err.message}\\n`, 'utf8');
      return { ok: false, error: err.message };
    }
  });""")
p.write_text(s, encoding="utf-8")

# wheel.js：打开失败时保留轮盘，并在中心显示原因
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\wheel.js")
s = p.read_text(encoding="utf-8")
s = s.replace("""  async function openAt(index) {
    const item = S.pageItems[index];
    if (!item) return;
    const res = await api.openItem(item.id);
    if (res && !res.ok) showToast(res.error || '打开失败');
  }""",
"""  let errorTimer = null;
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
  }""")
p.write_text(s, encoding="utf-8")
print("ok")
