import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\manager.js")
s = p.read_text(encoding="utf-8")
s = s.replace("""    dragId = dragId || e.dataTransfer.types.includes(DRAG_TYPE) ? dragId : dragId;
    if (!e.dataTransfer.types.includes(DRAG_TYPE)) return;   // 外部文件交给 document 的 drop""",
"""    if (!e.dataTransfer.types.includes(DRAG_TYPE)) return;   // 外部文件交给 document 的 drop""")
p.write_text(s, encoding="utf-8")
print("ok")
