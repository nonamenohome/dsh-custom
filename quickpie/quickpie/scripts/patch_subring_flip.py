import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\wheel.js")
s = p.read_text(encoding="utf-8")

s = s.replace("""      const group = document.createElementNS(NS, 'g');
      group.setAttribute('transform', `rotate(${mid.toFixed(2)} ${CX} ${CY})`);""",
"""      const flip = mid > 90 && mid < 270;   // 下半圈把文字翻 180°，避免倒着读
      const rot = flip ? mid + 180 : mid;
      const dir = flip ? 1 : -1;
      const group = document.createElementNS(NS, 'g');
      group.setAttribute('transform', `rotate(${rot.toFixed(2)} ${CX} ${CY})`);""")

s = s.replace("""        img.setAttribute('y', (CY - midR - (arc > 62 ? 16 : 8)).toFixed(2));""",
"""        img.setAttribute('y', (CY + dir * (midR + (arc > 62 ? 16 : 8))).toFixed(2));""")

s = s.replace("""        text.setAttribute('y', (CY - midR + (kid.icon ? 14 : 0)).toFixed(2));""",
"""        text.setAttribute('y', (CY + dir * (midR - (kid.icon ? 14 : 0))).toFixed(2));""")
p.write_text(s, encoding="utf-8")
print("ok")
