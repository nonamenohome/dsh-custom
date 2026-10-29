import pathlib

p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\wechat-chat.ps1")
s = p.read_text(encoding="utf-8")

# 1) 增加 SetWindowPos 声明
if "SetWindowPos" not in s:
    s = s.replace(
        '    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);',
        '    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);\n'
        '    [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr after, int x, int y, int cx, int cy, uint flags);'
    )

# 2) 更硬的激活方式
if "Activate-Strong" not in s:
    s = s.replace(
        "function Wait-Foreground([IntPtr]$h, [int]$ms = 5000) {",
        """function Activate-Strong([IntPtr]$h) {
    [void][Wc]::ShowWindow($h, 9)
    [void][Wc]::SetWindowPos($h, [IntPtr](-1), 0, 0, 0, 0, 0x0143)
    Start-Sleep -Milliseconds 90
    [void][Wc]::SetForegroundWindow($h)
    [void][Wc]::SetWindowPos($h, [IntPtr](-2), 0, 0, 0, 0, 0x0143)
    Start-Sleep -Milliseconds 120
    return ([Wc]::GetForegroundWindow() -eq $h)
}

function Wait-Foreground([IntPtr]$h, [int]$ms = 5000) {"""
    )

# 3) Focus-Hwnd 失败时用 Activate-Strong 兜底
s = s.replace(
    '[void][Wc]::ShowWindow($main, 5)\nif (-not (Focus-Hwnd $main)) { Write-Output "NOFOREGROUND"; exit 1 }',
    '[void][Wc]::ShowWindow($main, 5)\n'
    'if (-not (Focus-Hwnd $main)) {\n'
    '    if (-not (Activate-Strong $main)) { Write-Output "NOFOREGROUND"; exit 1 }\n'
    '}'
)

# 4) 发键前二次校验：前台不是微信就绝不发键
guard = """if ([Wc]::GetForegroundWindow() -ne $main) {
    if (-not (Activate-Strong $main)) { Write-Output "NOKEYS"; exit 2 }
    if ([Wc]::GetForegroundWindow() -ne $main) { Write-Output "NOKEYS"; exit 2 }
}
[System.Windows.Forms.SendKeys]::SendWait("^f")"""

if "NOKEYS" not in s:
    s = s.replace('[System.Windows.Forms.SendKeys]::SendWait("^f")', guard, 1)

p.write_text(s, encoding="utf-8")
print("加固完成; 含 Activate-Strong:", "Activate-Strong" in s, "含 NOKEGUARD:", "NOKEYS" in s)
