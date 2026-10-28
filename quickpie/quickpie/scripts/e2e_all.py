"""QuickPie 端到端测试：逐个条目点击，验证是否真的打开。

前置：应用已打包到 dist\\QuickPie，数据在 PortableData。
"""

import ctypes
import json
import math
import os
import subprocess
import time
from ctypes import wintypes
from pathlib import Path

ctypes.windll.shcore.SetProcessDpiAwareness(2)
u = ctypes.windll.user32

EXE = r"D:\QYD\dsh-file\apps\quickpie\dist\QuickPie\QuickPie.exe"
BASE = Path(EXE).parent
DATA = BASE / "PortableData"
LOG = DATA / "open.log"

W, H = u.GetSystemMetrics(0), u.GetSystemMetrics(1)
CX, CY = W // 2, H // 2
SLOT_R = 380  # 190 CSS × 2 (200% DPI)


def vk(code, down):
    u.keybd_event(code, 0, 0 if down else 2, 0)


def hotkey():
    vk(0x11, True); vk(0x10, True); vk(0x20, True)
    time.sleep(0.05)
    vk(0x20, False); vk(0x10, False); vk(0x11, False)


def click_at(x, y):
    u.SetCursorPos(x, y)
    time.sleep(0.45)
    u.mouse_event(0x0002, 0, 0, 0, 0)
    time.sleep(0.08)
    u.mouse_event(0x0004, 0, 0, 0, 0)


def count_folder_windows():
    """统计资源管理器文件夹窗口（CabinetWClass）"""
    count = [0]

    @ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
    def cb(hwnd, _):
        if not u.IsWindowVisible(hwnd):
            return True
        buf = ctypes.create_unicode_buffer(64)
        u.GetClassNameW(hwnd, buf, 64)
        if buf.value == "CabinetWClass":
            count[0] += 1
        return True

    u.EnumWindows(cb, 0)
    return count[0]


def read_log():
    if not LOG.exists():
        return []
    return [ln for ln in LOG.read_text(encoding="utf-8", errors="replace").splitlines() if ln.strip()]


def main():
    subprocess.run(["taskkill", "/F", "/IM", "QuickPie.exe"], capture_output=True)
    time.sleep(1.2)
    if LOG.exists():
        LOG.unlink()

    items = json.loads((DATA / "data.json").read_text(encoding="utf-8"))["items"]
    n = min(len(items), 12)
    print(f"条目 {n} 个:", [(i, it["type"], it["name"]) for i, it in enumerate(items)])

    u.SetCursorPos(CX, CY)
    time.sleep(0.4)
    env = dict(os.environ)
    env.pop("ELECTRON_RUN_AS_NODE", None)
    proc = subprocess.Popen(
        [EXE, f"--user-data-dir={DATA}", "--no-sandbox"],
        cwd=str(BASE), env=env,
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    time.sleep(5.5)
    print("进程存活:", proc.poll() is None)

    results = []
    for i, item in enumerate(items[:n]):
        before_folders = count_folder_windows()
        before_calc = len(subprocess.run(["tasklist", "/FI", "IMAGENAME eq CalculatorApp.exe"],
                                         capture_output=True, text=True).stdout.splitlines())

        # 光标先回到中心，热键呼出
        u.SetCursorPos(CX, CY)
        time.sleep(0.3)
        hotkey()
        time.sleep(0.9)

        angle = math.radians(i * 360.0 / n)
        sx = CX + int(SLOT_R * math.sin(angle))
        sy = CY - int(SLOT_R * math.cos(angle))
        click_at(sx, sy)
        time.sleep(2.2)

        after_folders = count_folder_windows()
        lines = read_log()
        last = lines[-1] if lines else "(无日志)"
        results.append({
            "index": i,
            "type": item["type"],
            "name": item["name"],
            "log": last,
            "folders_delta": after_folders - before_folders,
        })
        print(f"[{i}] {item['type']:<6} {item['name']:<8} -> {last}  文件夹数 {before_folders}->{after_folders}")

    proc.terminate()
    print("\n===== 汇总 =====")
    for r in results:
        print(f"{r['index']} {r['type']:<6} {r['name']:<8} Δ文件夹={r['folders_delta']:+d}  {r['log']}")

    Path(r"D:\QYD\dsh-file\.cache\e2e-result.json").write_text(
        json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")


main()
