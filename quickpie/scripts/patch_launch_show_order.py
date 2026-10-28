import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = p.read_text(encoding="utf-8")
s = s.replace("""    if (firstRun) {
      createManagerWindow();
    } else if (!SHOT) {
      setTimeout(() => { try { showWheel(); } catch (_) {} }, 400);
    }""",
"""    if (firstRun) {
      createManagerWindow();
    } else if (!SHOT) {
      // 必须等渲染器加载完再弹，否则弹的是个空透明窗口（看起来像没反应）
      const win = createWheelWindow();
      const show = () => setTimeout(() => { try { showWheel(); } catch (_) { /* ignore */ } }, 350);
      if (win.webContents.isLoading()) win.webContents.once('did-finish-load', show);
      else show();
    }""")
p.write_text(s, encoding="utf-8")
print("ok")
