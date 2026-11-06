import os, subprocess, time
from pathlib import Path
exe = Path(r"D:\QYD\dsh-file\.cache\release-test\QuickPie.exe")
env = dict(os.environ); env.pop("ELECTRON_RUN_AS_NODE", None)
subprocess.run(["taskkill","/F","/IM","QuickPie.exe"], capture_output=True)
time.sleep(1)
p = subprocess.Popen([str(exe), "--no-sandbox", "--user-data-dir=" + str(exe.parent / "PortableData")],
                     cwd=str(exe.parent), env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(8)
print("启动成功:", p.poll() is None)
print("生成了数据:", (exe.parent / "PortableData" / "data.json").exists())
p.terminate()
