"""把配色换成 pipie 风格的中性灰（无彩色 + 墨色强调）。

只替换 :root 与 :root[data-theme="dark"] 两个 token 块，其余规则沿用变量。
"""

from pathlib import Path

CSS = Path(r"D:\QYD\dsh-file\apps\quickpie\app\styles.css")
text = CSS.read_text(encoding="utf-8")
lines = text.splitlines(keepends=True)

LIGHT = """:root {
  color-scheme: light;

  /* ── 中性灰基调（参考 pipie：wall / paper / ink 三档） ── */
  --wall:         #eeeef0;
  --wall-2:       #e3e3e6;
  --paper:        #f0f0f2;
  --paper-2:      #e8e8ea;
  --surface:      #ffffff;
  --surface-2:    #f4f4f6;

  --ink:          #1c1c1e;
  --ink-2:        #5b5b60;
  --ink-3:        #8e8e94;
  --line:         #e6e6e9;
  --line-2:       #eff0f2;

  /* 强调 = 墨色（pipie 的做法：不用彩色强调） */
  --accent:       #1c1c1e;
  --accent-ink:   #1c1c1e;
  --accent-soft:  rgba(28, 28, 30, .072);

  --folder:       #83838a;
  --url:          #83838a;
  --app:          #83838a;
  --file:         #83838a;

  --sector:       rgba(255, 255, 255, .965);
  --sector-hi:    #f1f1f4;
  --sector-line:  rgba(28, 28, 30, .085);
  --plate:        rgba(255, 255, 255, .34);
  --plate-line:   rgba(255, 255, 255, .22);
  --hub-bg:       #ffffff;
  --tile:         var(--surface-2);

  --hub-shadow:   0 18px 44px rgba(16, 16, 18, .11), 0 2px 6px rgba(16, 16, 18, .05);
  --ring-shadow:  drop-shadow(0 20px 40px rgba(16, 16, 18, .15)) drop-shadow(0 2px 6px rgba(16, 16, 18, .07));
  --shadow-s:     0 1px 2px rgba(16, 16, 18, .05), 0 6px 16px rgba(16, 16, 18, .06);
  --shadow-m:     0 10px 30px rgba(16, 16, 18, .10), 0 2px 6px rgba(16, 16, 18, .05);

  --radius-lg:    18px;
  --radius-md:    12px;
  --ease:         cubic-bezier(.22, 1, .36, 1);
}
"""

DARK = """:root[data-theme="dark"] {
  color-scheme: dark;

  --wall:         #161618;
  --wall-2:       #0f0f11;
  --paper:        #161618;
  --paper-2:      #0f0f11;
  --surface:      #242427;
  --surface-2:    #2c2c30;

  --ink:          #ececee;
  --ink-2:        #a6a6ac;
  --ink-3:        #74747a;
  --line:         #313135;
  --line-2:       #3a3a3f;

  --accent:       #ececee;
  --accent-ink:   #ececee;
  --accent-soft:  rgba(236, 236, 238, .10);

  --folder:       #9a9aa1;
  --url:          #9a9aa1;
  --app:          #9a9aa1;
  --file:         #9a9aa1;

  --sector:       rgba(36, 36, 39, .965);
  --sector-hi:    #303035;
  --sector-line:  rgba(255, 255, 255, .075);
  --plate:        rgba(255, 255, 255, .028);
  --plate-line:   rgba(255, 255, 255, .06);
  --hub-bg:       #242427;
  --tile:         #2c2c30;

  --hub-shadow:   0 18px 44px rgba(0, 0, 0, .52), 0 2px 6px rgba(0, 0, 0, .36);
  --ring-shadow:  drop-shadow(0 20px 40px rgba(0, 0, 0, .5)) drop-shadow(0 2px 6px rgba(0, 0, 0, .3));
  --shadow-s:     0 1px 2px rgba(0, 0, 0, .32), 0 6px 16px rgba(0, 0, 0, .26);
  --shadow-m:     0 10px 30px rgba(0, 0, 0, .42), 0 2px 6px rgba(0, 0, 0, .3);
}
"""

# 找到两个块的起止行
start_light = next(i for i, l in enumerate(lines) if l.startswith(":root {"))
end_light = next(i for i, l in enumerate(lines) if i > start_light and l.startswith("}"))
start_dark = next(i for i, l in enumerate(lines) if l.startswith(':root[data-theme="dark"]'))
end_dark = next(i for i, l in enumerate(lines) if i > start_dark and l.startswith("}"))

new = (
    lines[:start_light]
    + [LIGHT]
    + lines[end_light + 1:start_dark]
    + [DARK]
    + lines[end_dark + 1:]
)
CSS.write_text("".join(new), encoding="utf-8")
print("tokens 已替换：", start_light + 1, "-", end_dark + 1)
