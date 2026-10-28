import ctypes, json, os, subprocess, time
from pathlib import Path
from PIL import ImageGrab
ctypes.windll.shcore.SetProcessDpiAwareness(2)
u = ctypes.windll.user32
W,H = u.GetSystemMetrics(0), u.GetSystemMetrics(1)

exe = r"D:\QYD\Tools\QuickPie\QuickPie.exe"
base = Path(exe).parent
data = base / "PortableData" / "data.json"
before = json.loads(data.read_text(encoding="utf-8"))["items"]
print("添加前条目数:", len(before))

subprocess.run(["taskkill","/F","/IM","QuickPie.exe"], capture_output=True)
time.sleep(1.2)
u.SetCursorPos(W//2, H//2); time.sleep(0.4)
env = dict(os.environ); env.pop("ELECTRON_RUN_AS_NODE", None)
p = subprocess.Popen([exe, f"--user-data-dir={base}\\PortableData", "--no-sandbox"],
                     cwd=str(base), env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(6.5)
print("alive:", p.poll() is None)

# Ctrl+V
u.keybd_event(0x11,0,0,0); u.keybd_event(0x56,0,0,0); time.sleep(0.08)
u.keybd_event(0x56,0,2,0); u.keybd_event(0x11,0,2,0)
time.sleep(1.2)
ImageGrab.grab(bbox=(W//2-450, H//2-450, W//2+450, H//2+450), all_screens=True).resize((600,600)).save(
    r"D:\QYD\dsh-file\.cache\rs-shots\quick_input.png")
print("截图已存")

# 回车确认
u.keybd_event(0x0D,0,0,0); time.sleep(0.06); u.keybd_event(0x0D,0,2,0)
time.sleep(3)
after = json.loads(data.read_text(encoding="utf-8"))["items"]
print("添加后条目数:", len(after))
print("最后一条:", after[-1]["type"], after[-1]["name"], after[-1]["target"] if after else "")
p.terminate()
