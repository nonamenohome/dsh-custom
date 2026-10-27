from PIL import Image
src = Image.open(r"D:\QYD\dsh-file\apps\quickpie\build\icon.png").convert("RGBA")
src.resize((256, 256), Image.LANCZOS).save(r"D:\QYD\dsh-file\apps\quickpie\app\logo.png", "PNG")
print("app/logo.png ok")
