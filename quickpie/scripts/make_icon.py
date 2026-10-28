"""把用户给的图做成应用图标（多尺寸 ICO + PNG）。

源图 188x168，非正方形：先居中裁成正方形，再放大到 512，圆角处理。
"""

from pathlib import Path

from PIL import Image, ImageDraw

SRC = Path(r"C:\Users\quyuedi\.dsh\attachments\v1\objects\54\54e6a426aaf60e778ff9184f1d6e91d3ae8993101d5de902e6b0418bc699a3da")
OUT_DIR = Path(r"D:\QYD\dsh-file\apps\quickpie\build")

img = Image.open(SRC).convert("RGBA")
w, h = img.size
print("源图:", w, "x", h)

# 1) 居中裁正方形
side = min(w, h)
left = (w - side) // 2
top = (h - side) // 2
img = img.crop((left, top, left + side, top + side))
print("裁成:", img.size)

# 2) 放大到 512（LANCZOS）
base = img.resize((512, 512), Image.LANCZOS)

# 3) 圆角（半径 22%），4x 超采样做抗锯齿遮罩
SS = 4
mask = Image.new("L", (512 * SS, 512 * SS), 0)
draw = ImageDraw.Draw(mask)
draw.rounded_rectangle(
    [0, 0, 512 * SS - 1, 512 * SS - 1],
    radius=int(512 * SS * 0.22),
    fill=255,
)
mask = mask.resize((512, 512), Image.LANCZOS)

out = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
out.paste(base, (0, 0), mask)

OUT_DIR.mkdir(parents=True, exist_ok=True)
png_path = OUT_DIR / "icon.png"
out.save(png_path, "PNG")
print("写出:", png_path, png_path.stat().st_size, "字节")

# 4) 多尺寸 ICO（Windows 需要的 16/24/32/48/64/128/256）
ico_path = OUT_DIR / "icon.ico"
sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
out.save(ico_path, format="ICO", sizes=sizes)
print("写出:", ico_path, ico_path.stat().st_size, "字节")

# 5) 预视图：各尺寸并排，方便肉眼确认
sheet = Image.new("RGBA", (16 + 24 + 32 + 48 + 64 + 128 + 256 + 8 * 8, 272), (250, 250, 252, 255))
x = 4
for size in (16, 24, 32, 48, 64, 128, 256):
    thumb = out.resize((size, size), Image.LANCZOS)
    sheet.paste(thumb, (x, 272 - size - 8), thumb)
    x += size + 8
sheet.save(r"D:\QYD\dsh-file\.cache\rs-shots\icon-preview.png")
print("预览已生成")
