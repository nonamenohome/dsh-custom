import pathlib
# preload：暴露新 API
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\preload.js")
s = p.read_text(encoding="utf-8")
s = s.replace("""  windowsFor: (id) => invoke('windows:for', id),""",
"""  windowsFor: (id) => invoke('windows:for', id),
  openChild: (groupId, childId) => invoke('child:open', { groupId, childId }),
  nestItems: (ids, groupId) => invoke('items:nest', { ids, groupId }),
  unnestItem: (groupId, childId) => invoke('items:unnest', { groupId, childId }),""")
p.write_text(s, encoding="utf-8")

# main.js：确认 persist 用的是什么名字
m = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
ms = m.read_text(encoding="utf-8")
import re
for name in ("persist", "save", "broadcast"):
    hits = [i+1 for i, line in enumerate(ms.splitlines()) if re.search(rf"^\s*function {name}\b", line)]
    print(name, hits)
