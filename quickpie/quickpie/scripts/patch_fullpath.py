import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\winlist.ps1")
s = p.read_text(encoding="utf-8")
s = s.replace('''                .Append(",\\"e\\":\\"").Append(Esc(exeName))''',
'''                .Append(",\\"e\\":\\"").Append(Esc(exeName))
                .Append("\\",\\"x\\":\\"").Append(Esc(exe))''')
p.write_text(s, encoding="utf-8")

p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = p.read_text(encoding="utf-8")
s = s.replace('''      state.items.push(toItem({
        type: 'app',
        name: exeName.replace(/\\.exe$/i, ''),
        target: exeName,
        icon: null,
      }));''',
'''      state.items.push(toItem({
        type: 'app',
        name: exeName.replace(/\\.exe$/i, ''),
        target: (list[0] && list[0].x) || exeName,
        icon: null,
      }));''')
p.write_text(s, encoding="utf-8")
print("ok")
