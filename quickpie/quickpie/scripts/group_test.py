"""用测试数据验证「二级分组」：悬停分组扇区，看外侧是否展开子项胶囊。"""

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

PROFILE = Path(r"D:\QYD\dsh-file\.cache\qp-group")
PROFILE.mkdir(parents=True, exist_ok=True)

edge = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not Path(edge).exists():
    edge = r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"

data = {
    "version": 1,
    "settings": {"hotkey": "Control+Shift+Space", "theme": "auto", "autoLaunch": False},
    "items": [
        {
            "id": "grp-folders",
            "type": "group",
            "name": "文件夹",
            "target": "C:\\",
            "args": "",
            "icon": None,
            "children": [
                {"id": "c1", "type": "folder", "name": "桌面", "target": r"C:\Users\quyuedi\Desktop", "args": "", "icon": None},
                {"id": "c2", "type": "folder", "name": "下载", "target": r"C:\Users\quyuedi\Downloads", "args": "", "icon": None},
                {"id": "c3", "type": "folder", "name": "工作区", "target": r"D:\QYD\dsh-file", "args": "", "icon": None},
                {"id": "c4", "type": "folder", "name": "桌面截图", "target": r"C:\Users\quyuedi\Pictures\Screenshots", "args": "", "icon": None},
            ],
        },
        {
            "id": "grp-edge",
            "type": "group",
            "name": "Edge",
            "target": edge,
            "args": "",
            "icon": None,
            "children": [
                {"id": "e1", "type": "url", "name": "GitHub", "target": "https://github.com", "args": "", "icon": None},
                {"id": "e2", "type": "url", "name": "哔哩哔哩", "target": "https://www.bilibili.com", "args": "", "icon": None},
                {"id": "e3", "type": "url", "name": "MDN", "target": "https://developer.mozilla.org", "args": "", "icon": None},
            ],
        },
        {"id": "x1", "type": "app", "name": "计算器", "target": r"C:\WINDOWS\System32\calc.exe", "args": "", "icon": None},
    ],
}
(PROFILE / "data.json").write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
show_log = PROFILE / "show.log"
if show_log.exists():
    show_log.unlink()

exe = r"D:\QYD\Tools\QuickPie\QuickPie.exe"
base = Path(exe).parent
subprocess.run(["taskkill", "/F", "/IM", "QuickPie.exe"], capture_output=True)
time.sleep(1.2)
u.SetCursorPos(W // 2, H // 2)
time.sleep(0.4)

env = dict(os.environ)
env.pop("ELECTRON_RUN_AS_NODE", None)
p = subprocess.Popen([exe, f"--user-data-dir={PROFILE}", "--no-sandbox"],
                     cwd=str(base), env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(7)
print("alive:", p.poll() is None)

info = json.loads(show_log.read_text(encoding="utf-8").strip().splitlines()[-1]
                  .split(" bounds=")[1].split(" size=")[0])
S = 2
cx = (info["x"] + info["width"] // 2) * S
cy = (info["y"] + info["height"] // 2) * S
r = int(info["width"] * 190 / 760) * S

# 3 个条目 → 每项 120°；第 0 项在正上方
angle = math.radians(0)
sx, sy = cx + int(r * math.sin(angle)), cy - int(r * math.cos(angle))
u.SetCursorPos(sx, sy)
time.sleep(1.4)
ImageGrab.grab(bbox=(cx - 780, cy - 780, cx + 780, cy + 780), all_screens=True).resize((780, 780)).save(
    r"D:\QYD\dsh-file\.cache\rs-shots\group-hover2.png")
print("截图完成")
print("--- open.log ---")
log = PROFILE / "open.log"
print(log.read_text(encoding="utf-8") if log.exists() else "(无)")
p.terminate()
