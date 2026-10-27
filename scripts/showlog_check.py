import ctypes, os, subprocess, time
from pathlib import Path
ctypes.windll.shcore.SetProcessDpiAwareness(2)
u = ctypes.windll.user32
W,H = u.GetSystemMetrics(0), u.GetSystemMetrics(1)
CX,CY = W//2, H//2
exe = r"D:\QYD\Tools\QuickPie\QuickPie.exe"
base = Path(exe).parent
showlog = base / "PortableData" / "show.log"
if showlog.exists(): showlog.unlink()
subprocess.run(["taskkill","/F","/IM","QuickPie.exe"], capture_output=True)
time.sleep(1.0)
u.SetCursorPos(CX,CY); time.sleep(0.4)
env = dict(os.environ); env.pop("ELECTRON_RUN_AS_NODE", None)
p = subprocess.Popen([exe, f"--user-data-dir={base}\\PortableData", "--no-sandbox"],
                     cwd=str(base), env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(7)
print("alive:", p.poll() is None)
print("--- show.log ---")
print(showlog.read_text(encoding="utf-8") if showlog.exists() else "(无)")
p.terminate()
