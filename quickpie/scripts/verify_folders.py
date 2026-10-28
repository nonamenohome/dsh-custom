import ctypes, os, subprocess, time
from ctypes import wintypes
from pathlib import Path
ctypes.windll.shcore.SetProcessDpiAwareness(2)
u = ctypes.windll.user32

def folder_windows():
    n = [0]
    @ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
    def cb(hwnd, _):
        if u.IsWindowVisible(hwnd):
            b = ctypes.create_unicode_buffer(64); u.GetClassNameW(hwnd, b, 64)
            if b.value == "CabinetWClass": n[0] += 1
        return True
    u.EnumWindows(cb, 0)
    return n[0]

# 先关掉所有资源管理器窗口
subprocess.run(["powershell","-NoProfile","-Command",
  "Get-Process explorer | ForEach-Object { $_.CloseMainWindow() | Out-Null }"], capture_output=True)
time.sleep(1.5)
print("关闭后文件夹窗口数:", folder_windows())

env = dict(os.environ); env.pop("ELECTRON_RUN_AS_NODE", None)
ELECTRON = r"D:\QYD\dsh-file\apps\image-compress\node_modules\electron\dist\electron.exe"
APP = r"D:\QYD\dsh-file\apps\quickpie"
PROFILE = r"D:\QYD\dsh-file\.cache\open-item-profile"

subprocess.run([ELECTRON, APP, "--open-item=0", f"--user-data-dir={PROFILE}", "--no-sandbox"],
               env=env, cwd=APP, capture_output=True, timeout=60)
time.sleep(3.0)
print("打开后文件夹窗口数:", folder_windows())

subprocess.run([ELECTRON, APP, "--open-item=1", f"--user-data-dir={PROFILE}", "--no-sandbox"],
               env=env, cwd=APP, capture_output=True, timeout=60)
time.sleep(3.0)
print("再打开下载后:", folder_windows())

from PIL import ImageGrab
ImageGrab.grab(all_screens=True).resize((1280,800)).save(r"D:\QYD\dsh-file\.cache\rs-shots\verify_folders.png")
print("shot ok")
