"""验证二级小扇面可点击：悬停分组 → 移到二级环带 → 点击 → 看 open.log。"""

import ctypes
import json
import math
import os
import subprocess
import time
from pathlib import Path

from PIL import ImageGrab

ctypes.windll.shcore.SetProcessDpiAwareness(2)
u = ctypes.windll.user32
W, H = u.GetSystemMetrics(0), u.GetSystemMetrics(1)

EXE = r"D:\QYD\Tools\QuickPie\QuickPie.exe"
BASE = Path(EXE).parent
PROFILE = BASE / "PortableData"
SHOW = PROFILE / "show.log"
LOG = PROFILE / "open.log"
if LOG.exists():
    LOG.unlink()

subprocess.run(["taskkill", "/F", "/IM", "QuickPie.exe"], capture_output=True)
time.sleep(1.2)
u.SetCursorPos(W // 2, H // 2)
time.sleep(0.4)

env = dict(os.environ)
env.pop("ELECTRON_RUN_AS_NODE", None)
p = subprocess.Popen([EXE, f"--user-data-dir={PROFILE}", "--no-sandbox"],
                     cwd=str(BASE), env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(7.5)
print("alive:", p.poll() is None)

info = json.loads(SHOW.read_text(encoding="utf-8").strip().splitlines()[-1]
                  .split(" bounds=")[1].split(" size=")[0])
S = 2
cx = (info["x"] + info["width"] // 2) * S
cy = (info["y"] + info["height"] // 2) * S
dip = info["width"] / 760.0 * S          # 1 个设计像素 = 多少物理像素

data = json.loads((PROFILE / "data.json").read_text(encoding="utf-8"))
n = len(data["items"])
group = data["items"][0]
kids = group.get("children") or []
print("分组:", group["name"], "子项:", [k["name"] for k in kids])

step = 360.0 / n
span = step - 1.2
cell = span / len(kids)

# 1) 先悬停一级扇区
u.SetCursorPos(cx, cy - int(196 * dip))
time.sleep(1.2)

# 2) 移到中间那个二级扇面（父扇区角度 base=0，第 k 个的中心角）
k = 1
deg = -span / 2 + (k + 0.5) * cell
rad = math.radians(deg)
r_sub = (262 + 344) / 2
sx = cx + int(r_sub * dip * math.sin(rad))
sy = cy - int(r_sub * dip * math.cos(rad))
u.SetCursorPos(sx, sy)
time.sleep(1.0)
ImageGrab.grab(bbox=(cx - 480, cy - 480, cx + 480, cy + 480), all_screens=True).resize((700, 700)).save(
    r"D:\QYD\dsh-file\.cache\rs-shots\sub-hover.png")
print("悬停截图完成 ->", deg, sx, sy)

# 3) 点击
u.mouse_event(0x0002, 0, 0, 0, 0)
time.sleep(0.08)
u.mouse_event(0x0004, 0, 0, 0, 0)
time.sleep(2.5)

print("--- open.log ---")
print(LOG.read_text(encoding="utf-8") if LOG.exists() else "(无)")
p.terminate()
