import ctypes, os, subprocess, time
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
for name in ("open.log", "show.log"):
    f = base / "PortableData" / name
    if f.exists(): f.unlink()

subprocess.run(["taskkill","/F","/IM","QuickPie.exe"], capture_output=True)
subprocess.run(["powershell","-NoProfile","-Command",
  "Get-Process explorer | ForEach-Object { $_.CloseMainWindow() | Out-Null }"], capture_output=True)
time.sleep(2)
env = dict(os.environ); env.pop("ELECTRON_RUN_AS_NODE", None)
p = subprocess.Popen([exe, f"--user-data-dir={base}\\PortableData", "--no-sandbox"],
                     cwd=str(base), env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(6)
print("alive:", p.poll() is None, "| 起始文件夹:", folders())
print("show.log:", (base/"PortableData"/"show.log").read_text(encoding="utf-8").strip() if (base/"PortableData"/"show.log").exists() else "(无)")

# 用键盘：回车 = 打开第一个条目（不依赖鼠标坐标）
u.keybd_event(0x0D, 0, 0, 0); time.sleep(0.05); u.keybd_event(0x0D, 0, 2, 0)
time.sleep(3.5)
print("回车后文件夹:", folders())
print("--- open.log ---")
lg = base/"PortableData"/"open.log"
print(lg.read_text(encoding="utf-8") if lg.exists() else "(无)")
p.terminate()
