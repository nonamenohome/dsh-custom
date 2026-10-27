import ctypes, time, math
ctypes.windll.shcore.SetProcessDpiAwareness(2)
u = ctypes.windll.user32
w, h = u.GetSystemMetrics(0), u.GetSystemMetrics(1)
cx, cy = w // 2, h // 2
u.SetCursorPos(cx, cy)
time.sleep(0.4)
r = 380
a = math.radians(60)
sx, sy = cx + int(r * math.sin(a)), cy - int(r * math.cos(a))
u.SetCursorPos(sx, sy)
time.sleep(0.4)
u.mouse_event(0x0002, 0, 0, 0, 0)
time.sleep(0.1)
u.mouse_event(0x0004, 0, 0, 0, 0)
print("clicked", sx, sy)
