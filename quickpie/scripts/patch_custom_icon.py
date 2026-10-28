import pathlib
m = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = m.read_text(encoding="utf-8")
s = s.replace("""  ipcMain.handle('clipboard:read',""",
"""  ipcMain.handle('icon:pick', async () => {
    const picked = await dialog.showOpenDialog(managerWin || wheelWin, {
      title: '选择图标图片',
      properties: ['openFile'],
      filters: [
        { name: '图片 / 图标', extensions: ['png', 'ico', 'jpg', 'jpeg', 'webp', 'bmp'] },
      ],
    });
    if (picked.canceled || !picked.filePaths.length) return { ok: false };
    const file = picked.filePaths[0];
    try {
      const buf = fs.readFileSync(file);
      const ext = path.extname(file).toLowerCase().replace('.', '');
      const mime = ext === 'ico' ? 'image/x-icon' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
      return { ok: true, icon: `data:${mime};base64,${buf.toString('base64')}` };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle('clipboard:read',""")
m.write_text(s, encoding="utf-8")

p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\preload.js")
ps = p.read_text(encoding="utf-8")
ps = ps.replace("""  readClipboard: () => invoke('clipboard:read'),""",
"""  readClipboard: () => invoke('clipboard:read'),
  pickIcon: () => invoke('icon:pick'),""")
p.write_text(ps, encoding="utf-8")

q = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\manager.js")
ms = q.read_text(encoding="utf-8")
ms = ms.replace("""  $('btnIconAuto').addEventListener""",
"""  $('btnIconCustom').addEventListener('click', async () => {
    const res = await api.pickIcon();
    if (!res || !res.ok) return;
    S.editing.icon = res.icon;
    $('previewIcon').innerHTML = `<img src="${res.icon}" alt="" />`;
    toast('已选择自定义图标，记得点保存');
  });

  $('btnIconAuto').addEventListener""")
q.write_text(ms, encoding="utf-8")

h = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\index.html")
hs = h.read_text(encoding="utf-8")
hs = hs.replace("""<button type="button" class="btn ghost small" id="btnIconAuto" title="按当前目标重新抓取图标">换图标</button>""",
"""<button type="button" class="btn ghost small" id="btnIconAuto" title="按当前目标重新抓取图标">重抓</button>
              <button type="button" class="btn ghost small" id="btnIconCustom" title="从图片文件指定图标">自定义图标</button>""")
h.write_text(hs, encoding="utf-8")
print("ok")
