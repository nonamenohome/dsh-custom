"""逐个验证 openItem：用 --open-item=N 直接调用同一条打开函数。"""

import ctypes
import json
import os
import subprocess
import time
from ctypes import wintypes
from pathlib import Path

ctypes.windll.shcore.SetProcessDpiAwareness(2)
u = ctypes.windll.user32

ELECTRON = r"D:\QYD\dsh-file\apps\image-compress\node_modules\electron\dist\electron.exe"
APP = r"D:\QYD\dsh-file\apps\quickpie"
PROFILE = Path(r"D:\QYD\dsh-file\.cache\open-item-profile")
LOG = PROFILE / "open.log"


def folder_windows():
    n = [0]

    @ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
    def cb(hwnd, _):
        if u.IsWindowVisible(hwnd):
            buf = ctypes.create_unicode_buffer(64)
            u.GetClassNameW(hwnd, buf, 64)
            if buf.value == "CabinetWClass":
                n[0] += 1
        return True

    u.EnumWindows(cb, 0)
    return n[0]


def calc_running():
    out = subprocess.run(["tasklist", "/FI", "IMAGENAME eq calc.exe"],
                         capture_output=True, text=True).stdout
    return "calc.exe" in out


def main():
    PROFILE.mkdir(parents=True, exist_ok=True)
    if not (PROFILE / "data.json").exists():
        src = Path(r"D:\QYD\dsh-file\apps\quickpie\dist\QuickPie\PortableData\data.json")
        (PROFILE / "data.json").write_text(src.read_text(encoding="utf-8"), encoding="utf-8")

    items = json.loads((PROFILE / "data.json").read_text(encoding="utf-8"))["items"]
    env = dict(os.environ)
    env.pop("ELECTRON_RUN_AS_NODE", None)

    for i, item in enumerate(items):
        before_f = folder_windows()
        before_c = calc_running()
        subprocess.run(["taskkill", "/F", "/IM", "electron.exe"], capture_output=True)
        time.sleep(0.4)

        subprocess.run(
            [ELECTRON, APP, f"--open-item={i}", f"--user-data-dir={PROFILE}", "--no-sandbox"],
            env=env, cwd=APP, capture_output=True, timeout=60,
        )
        time.sleep(2.0)
        after_f = folder_windows()
        after_c = calc_running()

        log = LOG.read_text(encoding="utf-8").strip().splitlines() if LOG.exists() else []
        last = log[-1] if log else "(无日志)"
        effect = []
        if after_f > before_f:
            effect.append(f"资源管理器+{after_f - before_f}")
        if after_c and not before_c:
            effect.append("计算器已启动")
        print(f"[{i}] {item['type']:<6} {item['name']:<8} | {last.split(' ', 2)[-1] if log else '-'} | {' '.join(effect) or '（无可见变化）'}")

        subprocess.run(["taskkill", "/F", "/IM", "CalculatorApp.exe"], capture_output=True)
        time.sleep(0.3)


main()
