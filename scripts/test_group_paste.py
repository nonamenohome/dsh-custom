import ctypes, json, math, os, subprocess, time
from pathlib import Path
ctypes.windll.shcore.SetProcessDpiAwareness(2)
u = ctypes.windll.user32
W,H = u.GetSystemMetrics(0), u.GetSystemMetrics(1)

PROFILE = Path(r"D:\QYD\dsh-file\.cache\qp-group")
data_p = PROFILE / "data.json"
d = json.loads(data_p.read_text(encoding="utf-8"))
before = len(d["items"][0].get("children") or [])
print("分组:", d["items"][0]["name"], "子项数:", before)

EXE = r"D:\QYD\Tools\QuickPie\QuickPie.exe"
BASE = Path(EXE).parent
SHOW = PROFILE / "show.log"
if SHOW.exists(): SHOW.unlink()
subprocess.run(["taskkill","/F","/IM","QuickPie.exe"], capture_output=True)
time.sleep(1.2)
u.SetCursorPos(W//2, H//2); time.sleep(0.4)
env = dict(os.environ); env.pop("ELECTRON_RUN_AS_NODE", None)
p = subprocess.Popen([EXE, f"--user-data-dir={PROFILE}", "--no-sandbox"], cwd=str(BASE),
                     env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(7)
print("alive:", p.poll() is None)

info = json.loads(SHOW.read_text(encoding="utf-8").strip().splitlines()[-1].split(" bounds=")[1].split(" size=")[0])
S = 2
cx = (info["x"] + info["width"]//2) * S
cy = (info["y"] + info["height"]//2) * S
# 悬停第 0 项（顶部）——是个分组
u.SetCursorPos(cx, cy - int(196 * info["width"]/760.0*S))
time.sleep(1.2)
# Ctrl+V
u.keybd_event(0x11,0,0,0); u.keybd_event(0x56,0,0,0); time.sleep(0.08)
u.keybd_event(0x56,0,2,0); u.keybd_event(0x11,0,2,0)
time.sleep(1.2)
# Enter
u.keybd_event(0x0D,0,0,0); time.sleep(0.06); u.keybd_event(0x0D,0,2,0)
time.sleep(2.5)

d2 = json.loads(data_p.read_text(encoding="utf-8"))
after = len(d2["items"][0].get("children") or [])
print("添加后子项数:", after)
print("顶层条目数:", len(d2["items"]))
print("最后一个子项:", (d2["items"][0].get("children") or [{}])[-1].get("target"))
p.terminate()
