import pathlib
w = pathlib.Path("app/wheel.js")
s = w.read_text(encoding="utf-8")

old = "      const looksLikePath = (t) => /[\\\\/:]/.test(t) || /\\.[a-z0-9]{2,5}$/i.test(t);"
new = """      // 只有"真的像路径"才当条目：
      //   盘符开头 / UNC / http(s):// / 含反斜杠 / 纯 ASCII 且带常见扩展名
      // 群名里常见的「/」「.」不再误判（例如「产品/研发群」「群.2024」）
      const looksLikePath = (t) =>
        /^[a-zA-Z]:[\\\\/]/.test(t) ||
        /^\\\\\\\\/.test(t) ||
        /^[a-zA-Z][a-zA-Z0-9+.-]*:\\/\\//.test(t) ||
        t.includes("\\\\") ||
        (/^[\\x20-\\x7e]+$/.test(t) && /\\.[a-z0-9]{2,5}$/i.test(t));"""
assert old in s, "未匹配 looksLikePath 原文"
s = s.replace(old, new, 1)
w.write_text(s, encoding="utf-8")
print("ok")
