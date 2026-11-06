import os, shutil, subprocess, time, ctypes
from pathlib import Path
ctypes.windll.shcore.SetProcessDpiAwareness(2)
u = ctypes.windll.user32
prof = Path(r"D:\QYD\dsh-file\.cache\qp-hk6")
shutil.rmtree(prof, ignore_errors=True); prof.mkdir(parents=True, exist_ok=True)
shutil.copy2(r"D:\QYD\Tools\QuickPie\PortableData\data.json", prof/"data.json")

def fg():
    h = u.GetForegroundWindow()
    b = ctypes.create_unicode_buffer(256); u.GetWindowTextW(h, b, 256)
    # 只保留 ASCII，避免控制台编码炸
    return "".join(c for c in b.value if 32 <= ord(c) < 127)

subprocess.run(["taskkill","/F","/IM","QuickPie.exe"], capture_output=True)
time.sleep(1.5)
env = dict(os.environ); env.pop("ELECTRON_RUN_AS_NODE", None)
exe = r"D:\QYD\Tools\QuickPie\QuickPie.exe"
p = subprocess.Popen([exe, f"--user-data-dir={prof}", "--no-sandbox"], cwd=str(Path(exe).parent),
                     env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(12)
print("alive:", p.poll() is None, "| fg_before:", repr(fg()))
u.SetCursorPos(600, 400); time.sleep(0.3)
u.keybd_event(0x11,0,0,0); time.sleep(0.03); u.keybd_event(0x12,0,0,0); time.sleep(0.03)
u.keybd_event(0x31,0,0,0); time.sleep(0.06)
u.keybd_event(0x31,0,2,0); time.sleep(0.03); u.keybd_event(0x12,0,2,0); time.sleep(0.03); u.keybd_event(0x11,0,2,0)
time.sleep(5)
print("fg_after:", repr(fg()))
p.terminate()
