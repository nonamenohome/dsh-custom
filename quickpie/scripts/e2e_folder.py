import ctypes, json, math, os, subprocess, time
from pathlib import Path

ctypes.windll.shcore.SetProcessDpiAwareness(2)
u = ctypes.windll.user32
w, h = u.GetSystemMetrics(0), u.GetSystemMetrics(1)
cx, cy = w // 2, h // 2

exe = r"D:\QYD\dsh-file\apps\quickpie\dist\QuickPie\QuickPie.exe"
base = Path(exe).parent
data = base / "PortableData"
log = data / "open.log"

items = json.loads((data / "data.json").read_text(encoding="utf-8"))["items"]
print("条目顺序:", [(i, it["type"], it["name"]) for i, it in enumerate(items)])

idx = next(i for i, it in enumerate(items) if it["type"] == "folder")
n = min(len(items), 12)
angle = math.radians(idx * 360.0 / n)
print("将点击:", idx, items[idx]["name"], "角度", math.degrees(angle))

if log.exists(): log.unlink()
subprocess.run(["taskkill", "/F", "/IM", "QuickPie.exe"], capture_output=True)
time.sleep(1.2)
u.SetCursorPos(cx, cy); time.sleep(0.4)

env = dict(os.environ); env.pop("ELECTRON_RUN_AS_NODE", None)
p = subprocess.Popen([exe, f"--user-data-dir={data}", "--no-sandbox"],
                     cwd=str(base), env=env,
                     stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(5.5)
print("alive:", p.poll() is None)

r = 380
sx, sy = cx + int(r * math.sin(angle)), cy - int(r * math.cos(angle))
u.SetCursorPos(sx, sy); time.sleep(0.6)
u.mouse_event(0x0002, 0, 0, 0, 0); time.sleep(0.1); u.mouse_event(0x0004, 0, 0, 0, 0)
time.sleep(3.0)

print("--- open.log ---")
print(log.read_text(encoding="utf-8") if log.exists() else "(无日志)")
p.terminate()
