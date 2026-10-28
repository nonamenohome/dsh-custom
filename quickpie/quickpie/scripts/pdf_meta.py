import re
from pathlib import Path
p = Path(r"D:\QYD\dsh-file\apps\quickpie\docs\QuickPie 产品说明.pdf")
raw = p.read_bytes()
pages = len(re.findall(rb"/Type\s*/Page[^s]", raw))
print("文件:", p.name, f"{len(raw)/1024:.0f} KB")
print("页数(估算):", pages)
print("含中文字体:", b"MicrosoftYaHei" in raw or b"YaHei" in raw or b"SimSun" in raw)
print("PDF 头:", raw[:8])
