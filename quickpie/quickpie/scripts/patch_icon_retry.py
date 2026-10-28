import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = p.read_text(encoding="utf-8")

# 1) PowerShell 兜底超时 6s -> 2.5s
s = s.replace("resolve(null); }, 6000);", "resolve(null); }, 2500);")

# 2) 添加后：缺图标的立即后台补（不等重启）
s = s.replace("""    state.items.push(item);
    added.push(item);""",
"""    state.items.push(item);
    added.push(item);""")

s = s.replace("""  saveState();
  broadcast();
  return added;""",
"""  saveState();
  broadcast();

  // 有缺图标的就立刻在后台补，补到一张广播一张，轮盘会实时刷出来
  if (added.some((it) => !it.icon)) {
    hydrateIcons().catch(() => {});
  }
  return added;""")
p.write_text(s, encoding="utf-8")
print("main ok")
