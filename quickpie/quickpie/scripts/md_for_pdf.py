import re
from pathlib import Path
src = Path("docs/产品说明.md")
dst = Path("docs/产品说明-pdf.md")
lines = src.read_text(encoding="utf-8").splitlines()
out, h2, h3 = [], 0, 0
for ln in lines:
    m = re.match(r"^## (?:[\u4e00-\u9fa5]+、)?(.+)$", ln)
    if m and not ln.startswith("###"):
        h2 += 1; h3 = 0
        out.append(f"## {h2}. {m.group(1).strip()}")
        continue
    m = re.match(r"^### (?:(\d+\.\d+)\s*)?(.+)$", ln)
    if m:
        h3 += 1
        out.append(f"### {h2}.{h3} {m.group(2).strip()}")
        continue
    out.append(ln)
dst.write_text("\n".join(out), encoding="utf-8")
print("生成", dst)
print("章节:", [l for l in out if l.startswith("## ")][:9])
