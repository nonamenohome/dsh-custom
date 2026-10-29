import pathlib
m = pathlib.Path("main.js")
s = m.read_text(encoding="utf-8")

# 会话类型允许空目标：把这条判断挪到「非会话」才生效
old = """  const target = String(item.target || '').trim();
  if (!target) throw new Error('条目没有目标地址');"""
new = """  const target = String(item.target || '').trim();
  const isChatItem = item.type === 'chat' || item.type === 'wechat';
  if (!target && !isChatItem) throw new Error('条目没有目标地址');"""
assert old in s, "未找到目标校验"
s = s.replace(old, new, 1)
m.write_text(s, encoding="utf-8")
print("guard 已放开会话类型")
