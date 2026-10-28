"""手工组装 ICO：大尺寸用整图，小尺寸用脸部特写（保证 16/24/32 可辨认）。"""

import struct
from pathlib import Path

from PIL import Image, ImageDraw

SRC = Path(r"C:\Users\quyuedi\.dsh\attachments\v1\objects\54\54e6a426aaf60e778ff9184f1d6e91d3ae8993101d5de902e6b0418bc699a3da")
OUT_DIR = Path(r"D:\QYD\dsh-file\apps\quickpie\build")

def round_mask(size: int, radius_ratio: float = 0.22) -> Image.Image:
    ss = 4
    mask = Image.new("L", (size * ss, size * ss), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, size * ss - 1, size * ss - 1], radius=int(size * ss * radius_ratio), fill=255
    )
    return mask.resize((size, size), Image.LANCZOS)


def render(img: Image.Image, size: int, radius_ratio: float) -> Image.Image:
    base = img.resize((size, size), Image.LANCZOS)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(base, (0, 0), round_mask(size, radius_ratio))
    return out


def build(img: Image.Image, out_path: Path) -> None:
    w, h = img.size
    side = min(w, h)
    square = img.crop(((w - side) // 2, (h - side) // 2, (w - side) // 2 + side, (h - side) // 2 + side))

    # 脸部特写：以头部为中心裁 62%
    fw = int(side * 0.62)
    fx = int(side * 0.52 - fw / 2)
    fy = int(side * 0.40 - fw / 2)
    face = square.crop((max(0, fx), max(0, fy), max(0, fx) + fw, max(0, fy) + fw))

    plan = [
        (16, face, 0.30),
        (24, face, 0.28),
        (32, face, 0.26),
        (48, face, 0.24),
        (64, square, 0.22),
        (128, square, 0.22),
        (256, square, 0.22),
    ]

    blobs = []
    for size, src, radius in plan:
        frame = render(src, size, radius)
        tmp = OUT_DIR / f"_ico_{size}.png"
        frame.save(tmp, "PNG", optimize=True)
        blobs.append((size, tmp.read_bytes()))
        tmp.unlink()

    header = struct.pack("<HHH", 0, 1, len(blobs))
    offset = 6 + 16 * len(blobs)
    entries, data = b"", b""
    for size, blob in blobs:
        width = 0 if size >= 256 else size
        entries += struct.pack("<BBBBHHII", width, width, 0, 0, 1, 32, len(blob), offset)
        offset += len(blob)
        data += blob
    out_path.write_bytes(header + entries + data)
    print(f"{out_path.name}: {out_path.stat().st_size:,} 字节，{len(blobs)} 个尺寸")

    # 预览
    sheet = Image.new("RGBA", (660, 290), (248, 249, 252, 255))
    x = 6
    for size, src, radius in plan:
        thumb = render(src, size, radius)
        sheet.paste(thumb, (x, 280 - size), thumb)
        x += size + 10
    sheet.save(r"D:\QYD\dsh-file\.cache\rs-shots\icon-preview2.png")
    print("预览 2 已生成")


img = Image.open(SRC).convert("RGBA")
build(img, OUT_DIR / "icon.ico")

# 主 PNG 同步更新（512，圆角）
w, h = img.size
side = min(w, h)
sq = img.crop(((w - side) // 2, (h - side) // 2, (w - side) // 2 + side, (h - side) // 2 + side))
render(sq, 512, 0.22).save(OUT_DIR / "icon.png", "PNG")
print("icon.png 已更新")
