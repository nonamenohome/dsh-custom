"""生成产品说明封面：A4 竖版 PNG（150dpi），用 Edge 无头截图。"""

import base64
import math
import subprocess
from pathlib import Path

BASE = Path(r"D:\QYD\dsh-file\apps\quickpie")
ICON = BASE / "app" / "logo.png"
HTML = BASE / "docs" / "_cover.html"
PNG = BASE / "docs" / "封面.png"

icon_b64 = base64.b64encode(ICON.read_bytes()).decode()

W, H = 1240, 1754
CX, CY = 620, 830          # 轮盘中心
R_IN, R_OUT = 168, 430
SLOTS = 8


def polar(r, deg):
    a = math.radians(deg - 90)
    return CX + r * math.cos(a), CY + r * math.sin(a)


def sector(a1, a2, r1, r2):
    large = 1 if a2 - a1 > 180 else 0
    x1, y1 = polar(r2, a1)
    x2, y2 = polar(r2, a2)
    x3, y3 = polar(r1, a2)
    x4, y4 = polar(r1, a1)
    return (f"M{x1:.1f} {y1:.1f} A{r2} {r2} 0 {large} 1 {x2:.1f} {y2:.1f} "
            f"L{x3:.1f} {y3:.1f} A{r1} {r1} 0 {large} 0 {x4:.1f} {y4:.1f} Z")


step = 360 / SLOTS
paths = []
for i in range(SLOTS):
    a1 = i * step + 0.8
    a2 = (i + 1) * step - 0.8
    op = 0.09 if i % 3 else 0.16          # 少量扇区加深，做层次
    paths.append(f'<path d="{sector(a1, a2, R_IN, R_OUT)}" fill="#1c1c1e" opacity="{op}"/>')

# 外圈细环
ring_outer = f'<circle cx="{CX}" cy="{CY}" r="{R_OUT + 26}" fill="none" stroke="#1c1c1e" stroke-opacity=".10" stroke-width="1"/>'

html = f"""<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>
  @page {{ size: {W}px {H}px; margin: 0; }}
  html, body {{ margin: 0; width: {W}px; height: {H}px; }}
  body {{
    font-family: "Microsoft YaHei UI", "Microsoft YaHei", "Segoe UI", system-ui, sans-serif;
    background: radial-gradient(120% 90% at 50% 0%, #ffffff 0%, #f4f4f6 46%, #ececef 100%);
    color: #1c1c1e; position: relative; overflow: hidden;
  }}
  .vig {{ position: absolute; inset: 0;
    background: radial-gradient(70% 55% at 50% 42%, rgba(255,255,255,0) 40%, rgba(28,28,30,.045) 100%); }}
  .wheel {{ position: absolute; left: 0; top: 0; }}
  .hub {{
    position: absolute; left: {CX - 106}px; top: {CY - 106}px; width: 212px; height: 212px;
    border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center;
    box-shadow: 0 24px 60px rgba(16,16,18,.16), 0 2px 8px rgba(16,16,18,.06);
  }}
  .hub img {{ width: 112px; height: 112px; border-radius: 24px; }}
  .text {{ position: absolute; left: 0; right: 0; top: 1320px; text-align: center; }}
  .kicker {{ font-size: 13px; letter-spacing: .32em; color: #8e8e94; margin-bottom: 18px; }}
  h1 {{ font-size: 62px; line-height: 1.14; margin: 0 0 10px; letter-spacing: -1.4px; }}
  .sub {{ font-size: 21px; color: #5b5b60; margin-bottom: 34px; }}
  .line {{ width: 84px; height: 3px; background: #1c1c1e; margin: 0 auto 30px; border-radius: 2px; }}
  .meta {{ font-size: 13.5px; color: #8e8e94; line-height: 2.1; }}
  .foot {{ position: absolute; left: 0; right: 0; bottom: 64px; text-align: center;
    font-size: 12px; color: #a6a6ac; letter-spacing: .08em; }}
</style></head><body>
  <div class="vig"></div>
  <svg class="wheel" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
    <circle cx="{CX}" cy="{CY}" r="{R_OUT}" fill="#ffffff" opacity=".72"/>
    {ring_outer}
    {''.join(paths)}
    <circle cx="{CX}" cy="{CY}" r="{R_IN - 6}" fill="#ffffff"/>
  </svg>
  <div class="hub"><img src="data:image/png;base64,{icon_b64}" alt=""></div>
  <div class="text">
    <div class="kicker">QUICKPIE</div>
    <h1>轮盘夹</h1>
    <div class="sub">把常用入口收进一个轮盘</div>
    <div class="line"></div>
    <div class="meta">
      产品说明 · v0.7.5<br />
      Windows 10 / 11 · Electron 桌面应用<br />
      纯本地数据 · 无云端依赖
    </div>
  </div>
  <div class="foot">QuickPie · 2026</div>
</body></html>"""

HTML.write_text(html, encoding="utf-8")

edge = next((p for p in [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
] if Path(p).exists()), None)

if PNG.exists():
    PNG.unlink()

subprocess.run([
    edge, "--headless=new", "--disable-gpu", "--hide-scrollbars",
    "--force-device-scale-factor=1",
    f"--window-size={W},{H}",
    f"--screenshot={PNG}",
    HTML.as_uri(),
], capture_output=True, timeout=120)

print("封面:", PNG.name, f"{PNG.stat().st_size/1024:.0f} KB" if PNG.exists() else "生成失败")
