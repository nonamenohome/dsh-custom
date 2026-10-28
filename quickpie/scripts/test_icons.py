import json, os, shutil, subprocess, time
from pathlib import Path

src = Path(r"D:\QYD\Tools\QuickPie\PortableData\data.json")
prof = Path(r"D:\QYD\dsh-file\.cache\qp-iconfix")
shutil.rmtree(prof, ignore_errors=True)
prof.mkdir(parents=True, exist_ok=True)
d = json.loads(src.read_text(encoding="utf-8"))

# 人为清空几个应用的图标，验证能否补回来
cleared = []
for it in d["items"]:
    if it["type"] in ("app", "group"):
        it["icon"] = None
        cleared.append(it["name"])
(prof / "data.json").write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")
print("清空图标的条目:", cleared)

exe = r"D:\QYD\Tools\QuickPie\QuickPie.exe"
env = dict(os.environ); env.pop("ELECTRON_RUN_AS_NODE", None)
subprocess.run(["taskkill", "/F", "/IM", "QuickPie.exe"], capture_output=True)
time.sleep(1)
p = subprocess.Popen([exe, f"--user-data-dir={prof}", "--no-sandbox"],
                     stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(14)
p.terminate()
time.sleep(1)

d2 = json.loads((prof / "data.json").read_text(encoding="utf-8"))
for it in d2["items"]:
    kids = it.get("children") or []
    print(f'{it["name"]:<10} {it["type"]:<6} icon={"有" if it.get("icon") else "无"}')
    for k in kids:
        print(f'    {k["name"]:<10} icon={"有" if k.get("icon") else "无"}')
