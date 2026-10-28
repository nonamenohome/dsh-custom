import ctypes, json, math, os, subprocess, time
from pathlib import Path
ctypes.windll.shcore.SetProcessDpiAwareness(2)
u = ctypes.windll.user32
exe = r"D:\QYD\Tools\QuickPie\QuickPie.exe"
base = Path(exe).parent
showlog = base / "PortableData" / "show.log"
openlog = base / "PortableData" / "open.log"
for f in (showlog, openlog):
    if f.exists(): f.unlink()

subprocess.run(["taskkill","/F","/IM","QuickPie.exe"], capture_output=True)
time.sleep(1.2)
env = dict(os.environ); env.pop("ELECTRON_RUN_AS_NODE", None)
p = subprocess.Popen([exe, f"--user-data-dir={base}\\PortableData", "--no-sandbox"],
                     cwd=str(base), env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(7)
print("alive:", p.poll() is None)

info = json.loads(showlog.read_text(encoding="utf-8").strip().splitlines()[-1].split(" bounds=")[1].split(" size=")[0])
SCALE = 2  # 200% DPI：日志是 DIP，点击要物理像素
cx = (info["x"] + info["width"] // 2) * SCALE
cy = (info["y"] + info["height"] // 2) * SCALE
print("轮盘中心:", cx, cy)
r = int(info["width"] * 190 / 760) * SCALE
a = math.radians(60)
sx, sy = cx + int(r * math.sin(a)), cy - int(r * math.cos(a))
print("点击:", sx, sy)
u.SetCursorPos(sx, sy); time.sleep(0.8)
u.mouse_event(0x0002,0,0,0,0); time.sleep(0.1); u.mouse_event(0x0004,0,0,0,0)
time.sleep(3)
print("--- open.log ---")
print(openlog.read_text(encoding="utf-8") if openlog.exists() else "(无)")
p.terminate()
