import ctypes, json, math, os, subprocess, time
from ctypes import wintypes
from pathlib import Path
from PIL import ImageGrab

ctypes.windll.shcore.SetProcessDpiAwareness(2)
u = ctypes.windll.user32
W,H = u.GetSystemMetrics(0), u.GetSystemMetrics(1)
CX,CY = W//2, H//2

def folders():
    n=[0]
    @ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
    def cb(h,_):
        if u.IsWindowVisible(h):
            b=ctypes.create_unicode_buffer(64); u.GetClassNameW(h,b,64)
            if b.value=="CabinetWClass": n[0]+=1
        return True
    u.EnumWindows(cb,0); return n[0]

def hotkey():
    for code in (0x11,0x10,0x20): u.keybd_event(code,0,0,0)
    time.sleep(0.05)
    for code in (0x20,0x10,0x11): u.keybd_event(code,0,2,0)

exe = r"D:\QYD\dsh-file\apps\quickpie\dist\QuickPie\QuickPie.exe"
base = Path(exe).parent
data = base / "PortableData"
log = data / "open.log"
if log.exists(): log.unlink()

subprocess.run(["taskkill","/F","/IM","QuickPie.exe"], capture_output=True)
subprocess.run(["powershell","-NoProfile","-Command",
  "Get-Process explorer | ForEach-Object { $_.CloseMainWindow() | Out-Null }"], capture_output=True)
time.sleep(1.5)
u.SetCursorPos(CX,CY); time.sleep(0.3)

env = dict(os.environ); env.pop("ELECTRON_RUN_AS_NODE", None)
p = subprocess.Popen([exe, f"--user-data-dir={data}", "--no-sandbox"], cwd=str(base),
                     env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(5.5)
print("alive:", p.poll() is None, "| 文件夹窗口起始:", folders())

for idx, name in [(0, "桌面"), (1, "下载"), (2, "工作区")]:
    u.SetCursorPos(CX,CY); time.sleep(0.3)
    hotkey(); time.sleep(1.0)
    a = math.radians(idx*60)
    sx, sy = CX+int(380*math.sin(a)), CY-int(380*math.cos(a))
    u.SetCursorPos(sx,sy); time.sleep(0.5)
    u.mouse_event(0x0002,0,0,0,0); time.sleep(0.08); u.mouse_event(0x0004,0,0,0,0)
    time.sleep(2.5)
    print(f"点击 {name}: 文件夹窗口={folders()}")

ImageGrab.grab(all_screens=True).resize((1280,800)).save(r"D:\QYD\dsh-file\.cache\rs-shots\verify_click_folders.png")
print("--- open.log ---")
print(log.read_text(encoding="utf-8") if log.exists() else "(无)")
p.terminate()
