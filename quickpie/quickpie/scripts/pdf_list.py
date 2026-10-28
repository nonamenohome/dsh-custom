import re
from pathlib import Path
for p in Path(r"D:\QYD\dsh-file\apps\quickpie\docs").glob("QuickPie*.pdf"):
    raw = p.read_bytes()
    pages = len(re.findall(rb"/Type\s*/Page[^s]", raw))
    print(f"{p.name}: {len(raw)/1024:.0f} KB, {pages} 页")
