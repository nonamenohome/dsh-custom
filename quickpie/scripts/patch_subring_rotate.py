import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\wheel.js")
s = p.read_text(encoding="utf-8")

old_start = s.index("      const mid = (a1 + a2) / 2;")
old_end = s.index("    });\n\n    subRing.classList.add('is-on');")
new = '''      const mid = (a1 + a2) / 2;
      const midR = (SUB_IN + SUB_OUT) / 2;
      const arc = ((a2 - a1) * Math.PI / 180) * midR;   // 这个格子有多宽（像素）

      // 图标 + 文字整体沿半径方向旋转，避免横向文字溢出扇面
      const group = document.createElementNS(NS, 'g');
      group.setAttribute('transform', `rotate(${mid.toFixed(2)} ${CX} ${CY})`);

      if (kid.icon) {
        const img = document.createElementNS(NS, 'image');
        img.setAttribute('href', kid.icon);
        img.setAttribute('x', (CX - 10).toFixed(2));
        img.setAttribute('y', (CY - midR - (arc > 62 ? 16 : 8)).toFixed(2));
        img.setAttribute('width', '20');
        img.setAttribute('height', '20');
        img.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        group.appendChild(img);
      }

      if (arc > 52) {
        const text = document.createElementNS(NS, 'text');
        text.setAttribute('x', CX.toFixed(2));
        text.setAttribute('y', (CY - midR + (kid.icon ? 14 : 0)).toFixed(2));
        text.setAttribute('class', 'sub-label');
        text.textContent = kid.name.length > 7 ? `${kid.name.slice(0, 6)}…` : kid.name;
        group.appendChild(text);
      }

      subRing.appendChild(group);
'''
s = s[:old_start] + new + s[old_end:]
p.write_text(s, encoding="utf-8")
print("ok")
