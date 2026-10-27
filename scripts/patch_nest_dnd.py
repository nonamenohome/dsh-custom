import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\manager.js")
s = p.read_text(encoding="utf-8")

s = s.replace("""    const rect = row.getBoundingClientRect();
    const after = e.clientY > rect.top + rect.height / 2;
    row.classList.add(after ? 'drop-after' : 'drop-before');""",
"""    const rect = row.getBoundingClientRect();
    const ratio = (e.clientY - rect.top) / rect.height;
    if (row.dataset.group === '1' && ratio > 0.28 && ratio < 0.72) {
      row.classList.add('drop-into');       // 拖到分组中间 = 变成二级条目
      return;
    }
    row.classList.add(ratio > 0.5 ? 'drop-after' : 'drop-before');""")

s = s.replace("""    const rect = row.getBoundingClientRect();
    const after = e.clientY > rect.top + rect.height / 2;
    const ids = S.items.map((it) => it.id).filter((x) => x !== id);""",
"""    const rect = row.getBoundingClientRect();
    const ratio = (e.clientY - rect.top) / rect.height;
    if (row.dataset.group === '1' && ratio > 0.28 && ratio < 0.72) {
      const res = await api.nestItems([id], targetId);
      dragId = null;
      if (res && res.ok) toast(`已放入分组（${res.moved} 项）`);
      await refresh();
      return;
    }
    const after = ratio > 0.5;
    const ids = S.items.map((it) => it.id).filter((x) => x !== id);""")

s = s.replace("""    listEl.querySelectorAll('.row').forEach((r) => r.classList.remove('drop-before', 'drop-after'));""",
"""    listEl.querySelectorAll('.row').forEach((r) => r.classList.remove('drop-before', 'drop-after', 'drop-into'));""")
p.write_text(s, encoding="utf-8")
print("dnd ok")
