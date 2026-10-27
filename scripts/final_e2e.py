import ctypes, json, math, os, subprocess, time
from ctypes import wintypes
from pathlib import Path
ctypes.windll.shcore.SetProcessDpiAwareness(2)
u = ctypes.windll.user32

def folders():
    n=[0]
    @ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
    def cb(h,_):
        if u.IsWindowVisible(h):
            b=ctypes.create_unicode_buffer(64); u.GetClassNameW(h,b,64)
            if b.value=="CabinetWClass": n[0]+=1
        return True
    u.EnumWindows(cb,0); return n[0]

exe = r"D:\QYD\Tools\QuickPie\QuickPie.exe"
base = Path(exe).parent
showlog = base / "PortableData" / "show.log"
openlog = base / "PortableData" / "open.log"
for f in (showlog, openlog):
    if f.exists(): f.unlink()

subprocess.run(["taskkill","/F","/IM","QuickPie.exe"], capture_output=True)
subprocess.run(["powershell","-NoProfile","-Command",
  "Get-Process explorer | ForEach-Object { $_.CloseMainWindow() | Out-Null }"], capture_output=True)
time.sleep(2.0)
env = dict(os.environ); env.pop("ELECTRON_RUN_AS_NODE", None)
p = subprocess.Popen([exe, f"--user-data-dir={base}\\PortableData", "--no-sandbox"],
                     cwd=str(base), env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(7)
print("alive:", p.poll() is None, "| 文件夹窗口:", folders())

info = json.loads(showlog.read_text(encoding="utf-8").strip().splitlines()[-1].split(" bounds=")[1].split(" size=")[0])
S = 2
cx = (info["x"] + info["width"]//2) * S
cy = (info["y"] + info["height"]//2) * S
r = int(info["width"] * 190 / 760) * S
a = math.radians(60)   # 第 2 项
sx, sy = cx + int(r*math.sin(a)), cy - int(r*math.cos(a))
print("轮盘中心", cx, cy, "点击", sx, sy)
u.SetCursorPos(sx, sy); time.sleep(0.8)
u.mouse_event(0x0002,0,0,0,0); time.sleep(0.1); u.mouse_event(0x0004,0,0,0,0)
time.sleep(3.5)
print("点击后文件夹窗口:", folders())
print("--- open.log ---")
print(openlog.read_text(encoding="utf-8") if openlog.exists() else "(无)")
p.terminate()
