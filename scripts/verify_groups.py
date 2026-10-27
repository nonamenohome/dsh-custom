"""用真实数据验证分组：分别悬停「文件夹」和「网址」两个组。"""

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
r = int(info["width"] * 190 / 760) * S

data = json.loads((PROFILE / "data.json").read_text(encoding="utf-8"))
n = len(data["items"])
print("顶层条目:", [it["name"] for it in data["items"]])

for idx, tag in [(0, "folders"), (1, "urls")]:
    angle = math.radians(idx * 360.0 / n)
    sx = cx + int(r * math.sin(angle))
    sy = cy - int(r * math.cos(angle))
    u.SetCursorPos(sx, sy)
    time.sleep(1.6)
    ImageGrab.grab(bbox=(cx - 780, cy - 780, cx + 780, cy + 780), all_screens=True).resize((760, 760)).save(
        rf"D:\QYD\dsh-file\.cache\rs-shots\group-{tag}.png")
    print(f"截图 {tag} 完成")

p.terminate()
