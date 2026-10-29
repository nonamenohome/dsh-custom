import pathlib
w = pathlib.Path("app/wheel.js")
s = w.read_text(encoding="utf-8")
if "let quickMode" not in s:
    s = s.replace("  let quickBox = null;", "  let quickBox = null;\n  let quickMode = 'auto';   // auto = 普通条目，chat = 微信会话")
w.write_text(s, encoding="utf-8")

c = pathlib.Path("app/styles.css")
cs = c.read_text(encoding="utf-8")
cs += """
/* 快速输入条：模式胶囊 */
.quick-mode {
  flex: none;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--surface-2);
  color: var(--ink-2);
  border: 1px solid var(--line-2);
}
.quick-input.is-chat .quick-mode {
  background: #07c160;      /* 微信绿 */
  border-color: #07c160;
  color: #fff;
}
.quick-input.is-chat input::placeholder { color: var(--ink-3); }
"""
c.write_text(cs, encoding="utf-8")
print("ok")
