import pathlib

# ---------- main.js ----------
m = pathlib.Path("main.js")
s = m.read_text(encoding="utf-8")

# 1) 探测：会话类型不参与「路径不存在」判断
s = s.replace("""  for (const item of state.items) {
    if (item.type === 'url') continue;
    let ok = false;""",
"""  for (const item of state.items) {
    // 网址与会话没有本地路径，不参与存在性检查
    if (item.type === 'url' || item.type === 'chat' || item.type === 'wechat') continue;
    if (!String(item.target || '').trim()) continue;
    let ok = false;""")

# 2) 微信 exe 解析：目标为空/不存在时回退到常见路径
s = s.replace("""    const exe = target && fs.existsSync(target) ? target : 'D:\\\\Weixin\\\\Weixin.exe';""",
"""    const exe = (target && fs.existsSync(target)) ? target : defaultWeChatExe();""")

s = s.replace("""function helperTmp() {""",
"""/// 微信 exe：target 无效时按常见安装位置找
function defaultWeChatExe() {
  const candidates = [
    'D:\\\\Weixin\\\\Weixin.exe',
    'C:\\\\Program Files\\\\Tencent\\\\Weixin\\\\Weixin.exe',
    'C:\\\\Program Files (x86)\\\\Tencent\\\\WeChat\\\\WeChat.exe',
    'C:\\\\Program Files\\\\Tencent\\\\WeChat\\\\WeChat.exe',
  ];
  for (const p of candidates) {
    try { if (fs.existsSync(p)) return p; } catch (_) { /* ignore */ }
  }
  return candidates[0];
}

function helperTmp() {""")

# 3) 图标：会话类型用微信 exe 的图标
s = s.replace("""    item.icon = raw.icon || (await resolveIcon(item.type, item.exe || item.target,
      item.shortcut ? [item.shortcut] : []));""",
"""    const iconTarget = (item.type === 'chat' || item.type === 'wechat')
      ? (item.target && fs.existsSync(item.target) ? item.target : defaultWeChatExe())
      : (item.exe || item.target);
    item.icon = raw.icon || (await resolveIcon(item.type, iconTarget,
      item.shortcut ? [item.shortcut] : []));""")
m.write_text(s, encoding="utf-8")

# ---------- wheel.js ----------
w = pathlib.Path("app/wheel.js")
ws = w.read_text(encoding="utf-8")
ws = ws.replace("""  function displayTarget(item) {
    if (item.type === 'url') {""",
"""  function displayTarget(item) {
    if (item.type === 'chat' || item.type === 'wechat') {
      return `微信会话 · ${item.query || item.name}`;
    }
    if (item.type === 'url') {""")
w.write_text(ws, encoding="utf-8")
print("patched")
