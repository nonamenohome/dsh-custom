import pathlib, subprocess
from pathlib import Path

BASE = Path(r"D:\QYD\dsh-file\apps\quickpie")
HTML = BASE / "docs" / "_cover.html"
OUT = BASE / "docs" / "QuickPie 封面.png"
if OUT.exists():
    OUT.unlink()

edge = next(p for p in [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
] if Path(p).exists())

subprocess.run([
    edge, "--headless=new", "--disable-gpu", "--hide-scrollbars",
    "--force-device-scale-factor=2",
    "--window-size=1240,1754",
    f"--screenshot={OUT}",
    HTML.as_uri(),
], capture_output=True, timeout=180)

from PIL import Image
im = Image.open(OUT)
print("输出:", OUT.name, im.size, f"{OUT.stat().st_size/1024:.0f} KB")
