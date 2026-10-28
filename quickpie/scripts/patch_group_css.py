import pathlib
c = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\styles.css")
s = c.read_text(encoding="utf-8")
s += """
/* 二级条目（分组） */
.chip { display: flex; align-items: center; gap: 6px; }
.chip img { width: 16px; height: 16px; border-radius: 4px; object-fit: contain; flex: none; }
.chip span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.child-list { display: flex; flex-direction: column; gap: 6px; margin-top: 6px; }
.child-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: var(--surface-2);
}
.child-icon img, .child-icon span { width: 18px; height: 18px; border-radius: 5px; display: block; }
.child-name { flex: 1; font-size: 12.5px; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.child-type { font-size: 11px; color: var(--ink-3); }
.child-empty { font-size: 12px; color: var(--ink-3); padding: 8px 2px; }
.child-hint { font-size: 11.5px; color: var(--ink-3); margin-top: 6px; line-height: 1.5; }
.child-hint b { color: var(--ink-2); font-weight: 600; }
.row.drop-into { outline: 2px solid var(--accent); outline-offset: -2px; }
.btn.tiny { padding: 2px 8px; font-size: 11.5px; }
"""
c.write_text(s, encoding="utf-8")
print("css ok")
