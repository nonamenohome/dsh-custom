import pathlib

# ---------- main.js：允许会话条目空目标 ----------
m = pathlib.Path("main.js")
s = m.read_text(encoding="utf-8")
s = s.replace("""    const target = String(raw?.target ?? '').trim();
    if (!target) continue;""",
"""    const target = String(raw?.target ?? '').trim();
    const rawChat = raw && (raw.type === 'chat' || raw.type === 'wechat');
    if (!target && !rawChat) continue;""")
m.write_text(s, encoding="utf-8")

# ---------- wheel.js：输入条支持 Tab 切换「普通 / 微信会话」 ----------
w = pathlib.Path("app/wheel.js")
ws = w.read_text(encoding="utf-8")

old = """  function openQuickInput(initial = '') {
    if (quickBox) {
      quickBox.querySelector('input').focus();
      return;
    }
    const grp = hotGroup();
    wrap.innerHTML = `
      <input type="text" spellcheck="false" placeholder="${grp ? `添加到「${grp.name}」：粘贴网址 / 路径，回车` : '粘贴或输入网址 / 路径，回车添加'}" />
      <kbd>Enter</kbd>`;"""

new = """  let quickMode = 'auto';   // auto = 普通条目；chat = 微信会话

  function openQuickInput(initial = '') {
    if (quickBox) {
      quickBox.querySelector('input').focus();
      return;
    }
    quickMode = 'auto';
    const grp = hotGroup();
    const wrap = document.createElement('div');
    wrap.className = 'quick-input';
    wrap.innerHTML = `
      <span class="quick-mode">自动</span>
      <input type="text" spellcheck="false" placeholder="${grp ? `添加到「${grp.name}」：粘贴网址 / 路径，回车` : '粘贴网址 / 路径，Tab 切成微信会话，回车添加'}" />
      <kbd>Tab</kbd><kbd>Enter</kbd>`;"""

assert old in ws, "未匹配到 openQuickInput 原文"
ws = ws.replace(old, new)
w.write_text(ws, encoding="utf-8")
print("phase1 ok")
