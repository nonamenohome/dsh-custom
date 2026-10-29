import ctypes
from PIL import ImageGrab
ctypes.windll.shcore.SetProcessDpiAwareness(2)
u = ctypes.windll.user32
W,H = u.GetSystemMetrics(0), u.GetSystemMetrics(1)
ImageGrab.grab(bbox=(0,0,W,H), all_screens=True).resize((1280,800)).save(r"D:\QYD\dsh-file\.cache\rs-shots\wechat-chat-test.png")
print("截图完成")
