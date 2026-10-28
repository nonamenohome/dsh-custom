import pathlib
c = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\styles.css")
s = c.read_text(encoding="utf-8")
s = s.replace(""".child-name { flex: 1;""",
""".child-name-input {
  flex: 1;
  min-width: 0;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  padding: 3px 6px;
  margin: -3px 0;
  font-size: 12.5px;
  color: var(--ink);
  font-family: inherit;
}
.child-name-input:hover { border-color: var(--line); background: var(--surface); }
.child-name-input:focus {
  outline: none;
  border-color: var(--accent);
  background: var(--surface);
}
.child-name { flex: 1;""")
c.write_text(s, encoding="utf-8")
print("css ok")
