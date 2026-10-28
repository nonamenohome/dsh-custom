import pathlib
p = pathlib.Path("scripts/md_to_pdf.py")
s = p.read_text(encoding="utf-8")
s = s.replace('PDF = BASE / "docs" / "QuickPie 产品说明.pdf"',
              'PDF = BASE / "docs" / "QuickPie 产品说明 v0.7.5.pdf"')
s = s.replace("""if PDF.exists():
    PDF.unlink()""",
"""if PDF.exists():
    try:
        PDF.unlink()
    except PermissionError:
        PDF = PDF.with_name(PDF.stem + "-2.pdf")
        print("原文件被占用，改写到", PDF.name)""")
p.write_text(s, encoding="utf-8")
print("ok")
