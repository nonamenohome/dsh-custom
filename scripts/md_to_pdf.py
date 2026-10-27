"""把产品说明 Markdown 转成排好版的 HTML，再用 Edge 无头打印为 PDF。"""

import subprocess
import sys
import base64
from pathlib import Path

import markdown2

BASE = Path(r"D:\QYD\dsh-file\apps\quickpie")
MD = BASE / "docs" / "产品说明.md"
HTML = BASE / "docs" / "产品说明.html"
PDF = BASE / "docs" / "QuickPie 产品说明 v0.7.5.pdf"
COVER = BASE / "docs" / "封面.png"

text = MD.read_text(encoding="utf-8")

# 去掉文档里自己的一级标题，封面单独排版
lines = text.splitlines()
title = "QuickPie 轮盘夹"
subtitle = "产品说明"
body_md = []
for ln in lines:
    if ln.startswith("# ") and len(body_md) == 0:
        continue
    body_md.append(ln)
body_md = "\n".join(body_md).lstrip("\n")

html_body = markdown2.markdown(
    body_md,
    extras=["tables", "fenced-code-blocks", "cuddled-lists", "break-on-newline", "header-ids"],
)

CSS = """
@page { size: A4; margin: 20mm 18mm 18mm 18mm; }
* { box-sizing: border-box; }
body {
  font-family: "Microsoft YaHei UI", "Microsoft YaHei", "Segoe UI", system-ui, sans-serif;
  font-size: 10.5pt; line-height: 1.75; color: #1c1c1e; margin: 0;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}
.cover-img { page-break-after: always; }
.cover-img img {
  display: block;
  width: 210mm; height: 297mm;
  margin: -20mm -18mm 0 -18mm;
  object-fit: cover;
}
.cover .mark { width: 64px; height: 64px; border-radius: 16px; background: #1c1c1e;
  display: flex; align-items: center; justify-content: center; margin-bottom: 28px; }
.cover .mark span { color: #fff; font-size: 30px; font-weight: 700; }
.cover h1 { font-size: 34pt; line-height: 1.2; margin: 0 0 6px; letter-spacing: -0.5px; }
.cover .sub { font-size: 15pt; color: #86868b; margin-bottom: 40px; }
.cover .meta { font-size: 9.5pt; color: #86868b; line-height: 2; border-top: 1px solid #e6e6e9; padding-top: 14px; width: 78%; }
h1, h2, h3, h4 { color: #1c1c1e; font-weight: 600; }
h2 { font-size: 17pt; margin: 26pt 0 10pt; padding-bottom: 6pt; border-bottom: 1px solid #e6e6e9;
  page-break-after: avoid; page-break-before: always; }
h2:first-of-type { page-break-before: avoid; }
h3 { font-size: 12.5pt; margin: 18pt 0 6pt; page-break-after: avoid; }
h4 { font-size: 11pt; margin: 14pt 0 4pt; page-break-after: avoid; }
p { margin: 0 0 9pt; }
ul, ol { margin: 0 0 10pt; padding-left: 18pt; }
li { margin: 2pt 0; }
strong { font-weight: 600; }
a { color: #06c; text-decoration: none; }
blockquote {
  margin: 10pt 0; padding: 8pt 12pt; border-left: 3px solid #d2d2d7;
  background: #fafafa; color: #4a4a4f;
}
table { border-collapse: collapse; width: 100%; margin: 10pt 0 14pt; font-size: 9.5pt;
  page-break-inside: avoid; }
th, td { border: 1px solid #e6e6e9; padding: 6pt 8pt; text-align: left; vertical-align: top; }
th { background: #f5f5f7; font-weight: 600; }
tr:nth-child(even) td { background: #fcfcfd; }
code { font-family: "Cascadia Mono", Consolas, monospace; font-size: 9pt;
  background: #f5f5f7; padding: 1pt 4pt; border-radius: 4px; }
pre { background: #f5f5f7; border: 1px solid #e6e6e9; border-radius: 8px;
  padding: 10pt 12pt; overflow: hidden; page-break-inside: avoid; margin: 10pt 0; }
pre code { background: none; padding: 0; font-size: 8.6pt; line-height: 1.6; }
hr { border: none; border-top: 1px solid #e6e6e9; margin: 18pt 0; }
h2 + p, h3 + p { page-break-before: avoid; }
"""

cover_b64 = base64.b64encode(COVER.read_bytes()).decode() if COVER.exists() else ""

html = f"""<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8" />
<title>{title} {subtitle}</title>
<style>{CSS}</style></head>
<body>
  <section class="cover-img"><img src="data:image/png;base64,{cover_b64}" alt="" /></section>
  {html_body}
</body></html>
"""

HTML.write_text(html, encoding="utf-8")
print("HTML:", HTML, HTML.stat().st_size, "字节")

edge = next(
    (p for p in [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    ] if Path(p).exists()),
    None,
)
if not edge:
    print("找不到 Edge")
    sys.exit(1)

if PDF.exists():
    try:
        PDF.unlink()
    except PermissionError:
        PDF = PDF.with_name(PDF.stem + "-2.pdf")
        print("原文件被占用，改写到", PDF.name)

args = [
    edge, "--headless=new", "--disable-gpu", "--no-first-run", "--no-pdf-header-footer",
    f"--print-to-pdf={PDF}", HTML.as_uri(),
]
subprocess.run(args, capture_output=True, timeout=180)

if PDF.exists():
    print("PDF:", PDF.name, f"{PDF.stat().st_size/1024:.0f} KB")
else:
    print("生成失败")
