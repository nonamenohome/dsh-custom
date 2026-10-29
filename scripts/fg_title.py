import ctypes
from ctypes import wintypes
ctypes.windll.shcore.SetProcessDpiAwareness(2)
u = ctypes.windll.user32
h = u.GetForegroundWindow()
buf = ctypes.create_unicode_buffer(256)
u.GetWindowTextW(h, buf, 256)
print("前台窗口:", buf.value)
