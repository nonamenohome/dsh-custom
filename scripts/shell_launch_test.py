import ctypes, math, os, subprocess, time
from ctypes import wintypes
from pathlib import Path

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
    for c in (0x11,0x10,0x20): u.keybd_event(c,0,0,0)
    time.sleep(0.05)
    for c in (0x20,0x10,0x11): u.keybd_event(c,0,2,0)

exe = Path(r"D:\QYD\dsh-file\apps\quickpie\dist\QuickPie\QuickPie.exe")
data = exe.parent / "PortableData"
log = data / "open.log"
if log.exists(): log.unlink()

subprocess.run(["taskkill","/F","/IM","QuickPie.exe"], capture_output=True)
time.sleep(1.0)
u.SetCursorPos(CX,CY); time.sleep(0.3)

# 用 shell 启动（等价双击），避免 DSH 的进程树限制
subprocess.run(["rundll32.exe","shell32.dll,ShellExec_RunDLL",
                f'"{exe}" --user-data-dir="{data}" --no-sandbox'], capture_output=True)
time.sleep(6)
print("QuickPie 进程数:", len(subprocess.run(["tasklist","/FI","IMAGENAME eq QuickPie.exe"],
      capture_output=True,text=True).stdout.splitlines())-3)

before = folders()
u.SetCursorPos(CX,CY); time.sleep(0.3)
hotkey(); time.sleep(1.0)
a = math.radians(60)
sx,sy = CX+int(380*math.sin(a)), CY-int(380*math.cos(a))
u.SetCursorPos(sx,sy); time.sleep(0.5)
u.mouse_event(0x0002,0,0,0,0); time.sleep(0.08); u.mouse_event(0x0004,0,0,0,0)
time.sleep(3)
print("文件夹窗口:", before, "->", folders())
print("--- open.log ---")
print(log.read_text(encoding="utf-8") if log.exists() else "(无)")
subprocess.run(["taskkill","/F","/IM","QuickPie.exe"], capture_output=True)
