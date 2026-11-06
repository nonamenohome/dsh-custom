import ctypes
from PIL import ImageGrab
import sys
ctypes.windll.shcore.SetProcessDpiAwareness(2)
l, t, rr, b = int(sys.argv[1]), int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4])
img = ImageGrab.grab(bbox=(l, t, rr, b), all_screens=True)
img.save(r"D:\QYD\dsh-file\.cache\rs-shots\dingtalk-window.png")
print("尺寸:", img.size)
