import pathlib
c = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\styles.css")
s = c.read_text(encoding="utf-8")
s += """
/* 分组里新增二级条目 */
.child-add { align-self: flex-start; margin-top: 2px; }
.child-add-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  padding: 8px;
  border: 1px dashed var(--line-2);
  border-radius: 9px;
  background: var(--surface);
}
.child-add-form input {
  min-width: 0;
  border: 1px solid var(--line);
  border-radius: 7px;
  background: var(--surface-2);
  padding: 4px 8px;
  font-size: 12px;
  font-family: inherit;
  color: var(--ink);
}
.child-add-form input:focus { outline: none; border-color: var(--accent); }
.child-add-form button { align-self: center; }
"""
c.write_text(s, encoding="utf-8")
print("css ok")
