import ctypes, subprocess, time
from ctypes import wintypes
ctypes.windll.shcore.SetProcessDpiAwareness(2)
u = ctypes.windll.user32

def folders():
    n=[0]
    @ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
    def cb(h,_):
        if u.IsWindowVisible(h):
            b=ctypes.create_unicode_buffer(64); u.GetClassNameW(h,b,64)
            if b.value=="CabinetWClass": n[0]+=1
        return True
    u.EnumWindows(cb,0); return n[0]

def run(label, cwd, target):
    before = folders()
    node = ("const{spawn}=require('child_process');"
            "const c=spawn('explorer.exe',[process.argv[1]],{detached:true,stdio:'ignore'});"
            "c.on('exit',x=>console.log('child exit',x));"
            "c.unref();")
    r = subprocess.run(["node","-e",node,target], cwd=cwd, capture_output=True, text=True, timeout=20)
    time.sleep(3)
    print(f"{label}: 文件夹窗口 {before} -> {folders()}  node输出={r.stdout.strip()!r} {r.stderr.strip()[:80]!r}")

run("A cwd=用户目录", r"C:\Users\quyuedi", r"C:\Users\quyuedi\Desktop")
run("B cwd=dist目录", r"D:\QYD\dsh-file\apps\quickpie\dist\QuickPie", r"C:\Users\quyuedi\Desktop")
run("C cwd=dist, 目标是 Downloads", r"D:\QYD\dsh-file\apps\quickpie\dist\QuickPie", r"C:\Users\quyuedi\Downloads")
