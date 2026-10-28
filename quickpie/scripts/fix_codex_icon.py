import base64, io, json
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw

p = Path(r"D:\QYD\Tools\QuickPie\PortableData\data.json")
d = json.loads(p.read_text(encoding="utf-8"))

src = Path(r"D:\QYD\Tools\icons\Codex.png")
img = Image.open(src).convert("RGBA")
# 统计：有透明像素吗？亮度如何？
alphas = img.getchannel("A").getextrema()
rgb = img.convert("RGB").resize((32, 32))
px = list(rgb.getdata())
avg = tuple(sum(c[i] for c in px) // len(px) for i in range(3))
print("alpha 范围:", alphas, "平均色:", avg)

# 用 alpha 判断：如果大面积不透明且接近纯白 → 说是白底浅色图案
opaque = sum(1 for v in list(img.getchannel("A").getdata()) if v > 200) / (img.width * img.height)
print("不透明比例:", round(opaque, 3))

# 方案：把图案本身染成深色（保留 alpha），再放到透明底上
r, g, b, a = img.split()
# 以 alpha 为遮罩，把可见像素统一压到墨色
ink = Image.new("RGBA", img.size, (28, 28, 30, 255))
ink.putalpha(a)
# 如果原图没有 alpha（全不透明），改用「亮度取反」得到图案
if opaque > 0.9:
    gray = img.convert("L")
    inv = ImageChops.invert(gray)
    ink = Image.new("RGBA", img.size, (28, 28, 30, 0))
    ink.putalpha(inv)
out = ink.resize((256, 256), Image.LANCZOS)
buf = io.BytesIO()
out.save(buf, "PNG")
b64 = base64.b64encode(buf.getvalue()).decode()
data_url = "data:image/png;base64," + b64
out.save(r"D:\QYD\Tools\icons\Codex-dark.png")

changed = 0
def walk(items):
    global changed
    for it in items:
        if (it.get("target") or "").lower().endswith("codex.lnk"):
            it["icon"] = data_url
            changed += 1
            print("已更新:", it["name"])
        walk(it.get("children") or [])
walk(d["items"])
if changed:
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")
print("changed:", changed)
