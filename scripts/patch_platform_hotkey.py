import pathlib

# ============ index.html：会话平台 + 条目快捷键 ============
h = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\index.html")
s = h.read_text(encoding="utf-8")
if 'id="fPlatform"' not in s:
    s = s.replace("""            <label class="field" id="queryField" hidden>""",
"""            <label class="field" id="platformField" hidden>
              <span>平台</span>
              <select id="fPlatform" class="segmented">
                <option value="wechat">微信</option>
                <option value="dingtalk">钉钉</option>
              </select>
            </label>

            <label class="field" id="queryField" hidden>""")
if 'id="fHotkey"' not in s:
    s = s.replace("""            <label class="field" id="argsField">""",
"""            <label class="field" id="hotkeyField">
              <span>快捷键 <em>可选，全局生效</em></span>
              <div class="input-row">
                <input id="fHotkey" readonly placeholder="点这里，然后按下组合键（如 Ctrl+Alt+1）" />
                <button type="button" class="btn ghost small" id="btnHotkeyClear">清除</button>
              </div>
            </label>

            <label class="field" id="argsField">""")
h.write_text(s, encoding="utf-8")

# ============ manager.js ============
m = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\manager.js")
ms = m.read_text(encoding="utf-8")

# 编辑器渲染：平台 + 快捷键
if "fPlatform" not in ms:
    ms = ms.replace("""    if (isChat) $('fQuery').value = draft.query || '';""",
"""    if (isChat) $('fQuery').value = draft.query || '';
    $('platformField').hidden = !isChat;
    $('platformField').style.display = isChat ? '' : 'none';
    if (isChat) $('fPlatform').value = draft.platform || 'wechat';
    $('fHotkey').value = draft.hotkey || '';""")

# 保存时带上 platform / hotkey
if "platform: (" not in ms:
    ms = ms.replace("""      query: ($('fQuery') ? $('fQuery').value : '').trim(),""",
"""      query: ($('fQuery') ? $('fQuery').value : '').trim(),
      platform: ($('fPlatform') ? $('fPlatform').value : '') || undefined,
      hotkey: ($('fHotkey') ? $('fHotkey').value : '').trim(),""")

# 快捷键录制
if "btnHotkeyClear" not in ms:
    ms = ms.replace("""  $('fName').addEventListener('input', (e) => {""",
"""  $('fHotkey').addEventListener('keydown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;
    const parts = [];
    if (e.ctrlKey) parts.push('Control');
    if (e.altKey) parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');
    if (e.metaKey) parts.push('Super');
    if (!parts.length) { toast('至少要带一个修饰键（Ctrl / Alt / Shift）'); return; }
    const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
    parts.push(key);
    const accel = parts.join('+');
    $('fHotkey').value = accel;
    if (S.editing) S.editing.hotkey = accel;
    $('fHotkey').blur();
  });

  $('btnHotkeyClear').addEventListener('click', () => {
    $('fHotkey').value = '';
    if (S.editing) S.editing.hotkey = '';
  });

  $('fName').addEventListener('input', (e) => {""")
m.write_text(ms, encoding="utf-8")

# ============ main.js ============
mn = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
t = mn.read_text(encoding="utf-8")

# toItem: platform / hotkey
if "platform: String(" not in t:
    t = t.replace("""    query: String(raw.query || ''),""",
"""    query: String(raw.query || ''),
    platform: String(raw.platform || ''),
    hotkey: String(raw.hotkey || ''),""")

# chat 分支：按平台选脚本
old_chat = """    const exe = (target && fs.existsSync(target)) ? target : defaultWeChatExe();"""
new_chat = """    const platform = item.platform
      || (/dingtalk/i.test(target) ? 'dingtalk' : 'wechat');
    if (platform === 'dingtalk') {
      const dingExe = (target && fs.existsSync(target))
        ? target
        : 'D:\\\\DingDing\\\\main\\\\current_new\\\\DingTalk.exe';
      const dingScript = path.join(ROOT, 'app', 'dingtalk-chat.ps1');
      const c = spawn('powershell.exe',
        ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', dingScript,
         '-Query', query, '-Exe', dingExe],
        { env: { ...process.env, TEMP: helperTmp(), TMP: helperTmp() }, windowsHide: true });
      c.unref();
      return 'dingtalk-chat';
    }
    const exe = (target && fs.existsSync(target)) ? target : defaultWeChatExe();"""
if "dingtalk-chat" not in t:
    t = t.replace(old_chat, new_chat, 1)

mn.write_text(t, encoding="utf-8")
print("patched")
