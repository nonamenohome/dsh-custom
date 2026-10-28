import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\wheel.js")
s = p.read_text(encoding="utf-8")
s = s.replace("""  function drawSubRing(item, index) {
    clearSubRing();""",
"""  function drawSubRing(item, index) {
    try {
    return drawSubRingInner(item, index);
    } catch (err) {
      hubSub.textContent = `二级渲染失败: ${err.message}`;
      return undefined;
    }
  }

  function drawSubRingInner(item, index) {
    clearSubRing();""")
s = s.replace("""    subRing.classList.add('is-on');
  }""",
"""    subRing.classList.add('is-on');
    hubSub.textContent += ` [sub:${subRing.childElementCount}]`;
  }""")
p.write_text(s, encoding="utf-8")
print("ok")
