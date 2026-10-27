import pathlib
# 1) helper 排除自己
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\winlist.ps1")
s = p.read_text(encoding="utf-8")
s = s.replace('''            string exe = ExePath(pid);
            if (exe.Length == 0) return true;''',
'''            string exe = ExePath(pid);
            if (exe.Length == 0) return true;
            string exeName = System.IO.Path.GetFileName(exe);
            // 排除自己（Electron 宿主 / 两个实现）
            if (exeName.Equals("electron.exe", StringComparison.OrdinalIgnoreCase) ||
                exeName.Equals("QuickPie.exe", StringComparison.OrdinalIgnoreCase) ||
                exeName.Equals("quickpie-rs.exe", StringComparison.OrdinalIgnoreCase)) return true;''')
s = s.replace('''                .Append(",\\"e\\":\\"").Append(Esc(System.IO.Path.GetFileName(exe)))''',
'''                .Append(",\\"e\\":\\"").Append(Esc(exeName))''')
p.write_text(s, encoding="utf-8")

# 2) 截图时挑一个非自身的应用
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\main.js")
s = p.read_text(encoding="utf-8")
s = s.replace('''    const [exeName] = winCache.keys();
    const list = winCache.get(exeName) || [];''',
'''    const preferred = [...winCache.keys()].find((k) => k !== 'electron.exe' && k !== 'quickpie.exe') || [...winCache.keys()][0];
    const exeName = preferred;
    const list = winCache.get(exeName) || [];''')
p.write_text(s, encoding="utf-8")
print("ok")
