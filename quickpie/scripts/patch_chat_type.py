import pathlib, re

# ---------- main.js ----------
m = pathlib.Path("main.js")
s = m.read_text(encoding="utf-8")

# toItem 增加 query
s = s.replace("""    children: Array.isArray(raw.children)""",
"""    query: String(raw.query || ''),
    children: Array.isArray(raw.children)""")

# openItem 增加 chat 分支
s = s.replace("""  if (item.type === 'url') {
    await shell.openExternal(normalizeUrl(target));
    return 'openExternal';
  }""",
"""  if (item.type === 'url') {
    await shell.openExternal(normalizeUrl(target));
    return 'openExternal';
  }

  // 会话：优先切到同名的独立聊天窗口，否则唤醒主窗并在搜索框填好会话名
  if (item.type === 'chat' || item.type === 'wechat') {
    const query = String(item.query || item.name || '').trim();
    if (!query) throw new Error('这个会话条目没有填会话名');
    clipboard.writeText(query);
    const scriptPath = path.join(ROOT, 'app', 'wechat-chat.ps1');
    const exe = target && fs.existsSync(target) ? target : 'D:\\\\Weixin\\\\Weixin.exe';
    const child = spawn('powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', scriptPath,
       '-Query', query, '-Exe', exe],
      { env: { ...process.env, TEMP: helperTmp(), TMP: helperTmp() }, windowsHide: true });
    child.unref();
    return 'wechat-chat';
  }""")

# 会话也参与外环窗口列表
s = s.replace("""function windowsForItem(item) {
  if (!item || item.type !== 'app') return [];""",
"""function windowsForItem(item) {
  if (!item || (item.type !== 'app' && item.type !== 'chat' && item.type !== 'wechat')) return [];""")
m.write_text(s, encoding="utf-8")

# ---------- preload 无需改 ----------

# ---------- manager.js ----------
q = pathlib.Path("app/manager.js")
ms = q.read_text(encoding="utf-8")
ms = ms.replace("const TYPE_LABEL = {", "const TYPE_LABEL = {\n    chat: '会话',")
ms = ms.replace("""    $('argsField').style.display = draft.type === 'app' ? '' : 'none';""",
"""    $('argsField').style.display = draft.type === 'app' ? '' : 'none';
    const isChat = draft.type === 'chat';
    $('queryField').hidden = !isChat;
    $('queryField').style.display = isChat ? '' : 'none';
    if (isChat) $('fQuery').value = draft.query || '';""")
ms = ms.replace("""      args: argsInput,""",
"""      args: argsInput,
      query: ($('fQuery') ? $('fQuery').value : '').trim(),""")
ms = ms.replace("""  $('fArgs').addEventListener('input', (e) => {""",
"""  $('fQuery').addEventListener('input', (e) => {
    if (S.editing) S.editing.query = e.target.value;
  });

  $('fArgs').addEventListener('input', (e) => {""")
q.write_text(ms, encoding="utf-8")

# ---------- index.html ----------
h = pathlib.Path("app/index.html")
hs = h.read_text(encoding="utf-8")
hs = hs.replace("""                <button type="button" data-type="group">分组</button>""",
"""                <button type="button" data-type="group">分组</button>
                <button type="button" data-type="chat">会话</button>""")
hs = hs.replace("""            <label class="field" id="argsField">""",
"""            <label class="field" id="queryField" hidden>
              <span>会话名 <em>微信里显示的名字</em></span>
              <input id="fQuery" placeholder="例：文件传输助手" spellcheck="false" />
            </label>

            <label class="field" id="argsField">""")
h.write_text(hs, encoding="utf-8")
print("patched")
