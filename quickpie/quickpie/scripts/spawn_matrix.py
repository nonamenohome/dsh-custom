import ctypes, subprocess, time
from ctypes import wintypes
ctypes.windll.shcore.SetProcessDpiAwareness(2)
u = ctypes.windll.user32

def count():
    n=[0]
    @ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
    def cb(h,_):
        if u.IsWindowVisible(h):
            b=ctypes.create_unicode_buffer(64); u.GetClassNameW(h,b,64)
            if b.value=="CabinetWClass": n[0]+=1
        return True
    u.EnumWindows(cb,0); return n[0]

print("起始:", count())
# 1) node 直接 spawn
subprocess.run(["node","-e",
  "require('child_process').spawn('explorer.exe',['C:\\\\Users\\\\quyuedi\\\\Desktop'],{detached:true,stdio:'ignore'}).unref()"],
  capture_output=True)
time.sleep(2.5)
print("node spawn 后:", count())
# 2) python 直接 spawn
subprocess.Popen(["explorer.exe", r"C:\Users\quyuedi\Downloads"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(2.5)
print("python spawn 后:", count())
