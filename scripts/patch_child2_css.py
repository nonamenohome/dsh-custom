import pathlib
c = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\styles.css")
s = c.read_text(encoding="utf-8")
s += """
/* 二级条目：两行（名字 / 目标） */
.child-row { flex-direction: column; align-items: stretch; gap: 4px; }
.child-line { display: flex; align-items: center; gap: 8px; }
.child-line-2 { padding-left: 26px; }
.child-target-input {
  flex: 1;
  min-width: 0;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  padding: 2px 6px;
  font-size: 11.5px;
  color: var(--ink-2);
  font-family: inherit;
}
.child-target-input:hover { border-color: var(--line); background: var(--surface); }
.child-target-input:focus { outline: none; border-color: var(--accent); background: var(--surface); color: var(--ink); }
.child-row .child-name-input { font-weight: 500; }

/* 拖动中的行 */
body.row-dragging { cursor: grabbing; }
body.row-dragging .row { user-select: none; }
"""
c.write_text(s, encoding="utf-8")
print("css ok")
