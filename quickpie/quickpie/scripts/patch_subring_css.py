import pathlib
c = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\styles.css")
s = c.read_text(encoding="utf-8")
s += """
/* 二级小扇面 */
.sub-ring {
  opacity: 0;
  pointer-events: none;
  transition: opacity .14s var(--ease);
}
.sub-ring.is-on { opacity: 1; }
.sub-ring.is-on path.sub-sector { pointer-events: auto; }
.sub-ring path.sub-sector {
  fill: var(--sector);
  stroke: var(--sector-line);
  stroke-width: 1;
  cursor: pointer;
  transition: fill .12s var(--ease);
}
.sub-ring path.sub-sector:hover { fill: var(--sector-hi); }
.sub-ring image { pointer-events: none; }
.sub-ring text.sub-label {
  pointer-events: none;
  font-size: 9.5px;
  fill: var(--ink-2);
  text-anchor: middle;
  dominant-baseline: middle;
  font-weight: 500;
}
"""
c.write_text(s, encoding="utf-8")
print("css ok")
