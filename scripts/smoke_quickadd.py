import json, os, shutil, subprocess, time
from pathlib import Path
prof = Path(r"D:\QYD\dsh-file\.cache\qp-quickadd")
shutil.rmtree(prof, ignore_errors=True); prof.mkdir(parents=True, exist_ok=True)
shutil.copy2(r"D:\QYD\Tools\QuickPie\PortableData\data.json", prof/"data.json")
before = len(json.loads((prof/"data.json").read_text(encoding="utf-8"))["items"])
print("现有条目:", before)
print("说明: UI 里的 Tab 切换需要人工按，这里只验证打包与启动不报错")
env = dict(os.environ); env.pop("ELECTRON_RUN_AS_NODE", None)
exe = r"D:\QYD\Tools\QuickPie\QuickPie.exe"
subprocess.run(["taskkill","/F","/IM","QuickPie.exe"], capture_output=True)
time.sleep(1)
p = subprocess.Popen([exe, f"--user-data-dir={prof}", "--no-sandbox"], env=env,
                     cwd=str(Path(exe).parent), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(7)
print("alive:", p.poll() is None)
p.terminate()
