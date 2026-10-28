import pathlib
p = pathlib.Path("scripts/md_to_pdf.py")
s = p.read_text(encoding="utf-8")

s = s.replace("""from pathlib import Path

import markdown2""",
"""import base64
from pathlib import Path

import markdown2""")

s = s.replace('PDF = BASE / "docs" / "QuickPie 产品说明.pdf"',
              'PDF = BASE / "docs" / "QuickPie 产品说明.pdf"\nCOVER = BASE / "docs" / "封面.png"')

# 用图片封面替换原来的文字封面
s = s.replace("""  <section class="cover">
    <div class="mark"><span>Q</span></div>
    <h1>{title}</h1>
    <div class="sub">{subtitle}</div>
    <div class="meta">
      版本 0.7.5 · Windows 10 / 11<br />
      Electron 桌面应用 · 本地数据 · 无云端依赖<br />
      文档生成于 2026-10-26
    </div>
  </section>""",
"""  <section class="cover-img"><img src="data:image/png;base64,{cover_b64}" alt="" /></section>""")

s = s.replace("""html = f\"\"\"<!doctype html>""",
"""cover_b64 = base64.b64encode(COVER.read_bytes()).decode() if COVER.exists() else ""

html = f\"\"\"<!doctype html>""")

# 满版封面样式
s = s.replace(""".cover {
  height: 245mm; display: flex; flex-direction: column; justify-content: center;
  page-break-after: always;
}""",
""".cover-img { page-break-after: always; }
.cover-img img {
  display: block;
  width: 210mm; height: 297mm;
  margin: -20mm -18mm 0 -18mm;
  object-fit: cover;
}""")
p.write_text(s, encoding="utf-8")
print("patched")
