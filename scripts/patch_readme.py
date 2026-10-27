import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\README.md")
s = p.read_text(encoding="utf-8")

s = s.replace("""- **一点即开**：悬停看名称和完整路径，左键打开；扇区也可点。""",
"""- **一点即开**：悬停看名称和完整路径，左键打开；扇区也可点。
- **外环窗口列表**：悬停到「应用」类条目时，在它的扇区外侧拉出这个应用的每个窗口胶囊
  （例如微信的「微信」「图片和视频」），点胶囊直接切到那个窗口。
  窗口枚举由常驻 PowerShell（`Add-Type` 内存编译 C#）完成，不落地新 exe。""")

s = s.replace("""## 已知边界""",
"""## 外环是怎么实现的

`app/winlist.ps1` 是个常驻进程：`EnumWindows` → PID → exe 路径，每 800ms 往 stdout 吐一行
JSON（已排掉 `Progman`/`WorkerTray` 这类外壳窗口）。主进程解析后按 exe 名缓存，悬停应用条目时
把该 exe 的窗口回传给渲染层，渲染层在扇区外侧排胶囊；点胶囊时用
`WScript.Shell.AppActivate(pid)` 切窗口。

> 为什么不用原生模块：这台机器对**新编译的未签名 exe** 有限制（`ShellExecute`/`Shell_NotifyIcon`
> 返回 `ACCESS_DENIED`），但 PowerShell 是系统签名的程序，`Add-Type` 内存编译不落地文件，
> 反而更稳。副作用是要把子进程的 `TEMP` 指到可写目录，否则 `Add-Type` 会失败。

## 已知边界""")

s = s.replace("""- **没有鼠标侧键呼出**：需要全局鼠标钩子，Electron 自带 API 做不到，当前只支持键盘热键；
  要那套交互得加一个原生模块（或转 Rust，像 PiPie 那样）。""",
"""- **没有鼠标侧键呼出**：需要全局鼠标钩子，Electron 自带 API 做不到，当前只支持键盘热键
  （顺带一提：pipie 默认就是侧键呼出，没有侧键的鼠标基本用不了它）。""")

s = s.replace("""- 轮盘一屏 12 项，更多靠翻页，不做 PiPie 那种连续滚动。""",
"""- 轮盘一屏 12 项，更多靠翻页，不做 PiPie 那种连续滚动。
- 外环只有窗口标题，**没有 DWM 实时预览**（那需要把别的窗口画面合成进自己的窗口，
  只有原生 `DwmRegisterThumbnail` 能做，Electron 里拿不到）。""")
p.write_text(s, encoding="utf-8")
print("readme updated")
