"""生成 QuickPie 的应用图标（build/icon.ico / icon.png）。

图形：墨色圆盘 + 朱红扇形 + 纸色轮毂 —— 一眼看出「轮盘」，
且 16px 下仍然可辨。
"""

from PIL import Image, ImageDraw
import os

INK = (34, 29, 23, 255)
ACCENT = (184, 81, 47, 255)
PAPER = (255, 253, 248, 255)

SS = 1024  # 超采样画布
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "build")


def render():
    img = Image.new("RGBA", (SS, SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    pad = 40
    r = SS // 2 - pad
    cx = cy = SS // 2

    # 圆盘
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=INK)
    # 扇形（右上）
    d.pieslice([cx - r, cy - r, cx + r, cy + r], start=-90, end=0, fill=ACCENT)
    # 扇形与圆盘之间的细缝
    gap = 10
    d.line([(cx, cy - r), (cx, cy)], fill=PAPER, width=gap)
    d.line([(cx, cy), (cx + r, cy)], fill=PAPER, width=gap)
    # 轮毂
    hr = int(r * 0.34)
    d.ellipse([cx - hr, cy - hr, cx + hr, cy + hr], fill=PAPER)

    # 圆周轻微内缩，让边缘更干净
    mask = Image.new("L", (SS, SS), 0)
    ImageDraw.Draw(mask).ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)
    out = Image.new("RGBA", (SS, SS), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    return out


def main():
    os.makedirs(OUT, exist_ok=True)
    master = render()
    sizes = [16, 24, 32, 48, 64, 128, 256]
    frames = [master.resize((s, s), Image.LANCZOS) for s in sizes]
    ico_path = os.path.join(OUT, "icon.ico")
    # 用 32bpp BMP 帧写 ICO：Electron / Windows 托盘对 PNG 帧支持不稳
    frames[-1].save(
        ico_path,
        format="ICO",
        sizes=[(s, s) for s in sizes],
        bitmap_format="bmp",
    )
    master.resize((256, 256), Image.LANCZOS).save(os.path.join(OUT, "icon.png"))
    print("written:", ico_path)


if __name__ == "__main__":
    main()
