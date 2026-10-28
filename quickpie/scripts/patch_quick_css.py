import pathlib
c = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\styles.css")
cs = c.read_text(encoding="utf-8")
cs += """
/* 快速添加输入条 */
.quick-input {
  position: absolute;
  left: 50%;
  bottom: 88px;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  width: 420px;
  padding: 8px 10px 8px 14px;
  border-radius: 14px;
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-m);
  z-index: 6;
  animation: chipIn .18s var(--ease) both;
}
.quick-input input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 13px;
  color: var(--ink);
}
.quick-input input::placeholder { color: var(--ink-3); }
.quick-input kbd {
  font-size: 10px;
  color: var(--ink-3);
  border: 1px solid var(--line-2);
  border-radius: 5px;
  padding: 1px 5px;
  background: var(--surface-2);
}
"""
c.write_text(cs, encoding="utf-8")
print("css ok")
