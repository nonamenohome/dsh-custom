param(
    [string]$Query = "",
    [string]$Exe = "D:\Weixin\Weixin.exe",
    [string]$ProcName = "Weixin"
)

# 打开微信会话：
#  1) 先找标题包含会话名的独立聊天窗口 -> 直接切过去（C 路径）
#  2) 找不到 -> 唤醒主窗，Ctrl+F 打开搜索，粘贴会话名（A 路径，用户按回车）

Add-Type -AssemblyName System.Windows.Forms
Add-Type @"
using System;
using System.Text;
using System.Collections.Generic;
using System.Runtime.InteropServices;
public class Wc {
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
    [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr after, int x, int y, int cx, int cy, uint flags);
    [DllImport("user32.dll")] public static extern bool BringWindowToTop(IntPtr h);
    [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int c);
    [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr h);
    [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
    [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
    [DllImport("user32.dll")] public static extern IntPtr AttachThreadInput(uint a, uint b, bool f);
    [DllImport("kernel32.dll")] public static extern uint GetCurrentThreadId();
    [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetWindowTextW(IntPtr h, StringBuilder s, int n);
    public delegate bool EnumProc(IntPtr h, IntPtr l);
    [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc cb, IntPtr l);

    public static List<IntPtr> Windows(uint pid) {
        var list = new List<IntPtr>();
        EnumWindows((h, l) => {
            uint p; GetWindowThreadProcessId(h, out p);
            if (p == pid && IsWindowVisible(h)) list.Add(h);
            return true;
        }, IntPtr.Zero);
        return list;
    }
    public static string Title(IntPtr h) {
        var sb = new StringBuilder(512); GetWindowTextW(h, sb, 512); return sb.ToString();
    }
}
"@

function Focus-Hwnd([IntPtr]$h) {
    # Windows 前台锁定：先按一下 Alt 解锁，再 AttachThreadInput 抢焦点，最后校验结果
    for ($try = 0; $try -lt 3; $try++) {
        $fg = [Wc]::GetForegroundWindow()
        if ($fg -eq $h) { return $true }
        if ([Wc]::IsIconic($h)) { [void][Wc]::ShowWindow($h, 9) }

        $fgPid = 0
        $t1 = if ($fg -ne [IntPtr]::Zero) { [Wc]::GetWindowThreadProcessId($fg, [ref]$fgPid) } else { 0 }
        $t2 = [Wc]::GetCurrentThreadId()
        if ($t1 -ne 0) { [void][Wc]::AttachThreadInput($t2, $t1, $true) }
        [void][Wc]::BringWindowToTop($h)
        [void][Wc]::SetForegroundWindow($h)
        if ($t1 -ne 0) { [void][Wc]::AttachThreadInput($t2, $t1, $false) }

        Start-Sleep -Milliseconds 150
        if ([Wc]::GetForegroundWindow() -eq $h) { return $true }

        # 仍然没抢到：模拟一次 Alt 键，解除前台锁后重试
        [System.Windows.Forms.SendKeys]::SendWait("%")
        Start-Sleep -Milliseconds 120
    }
    return ([Wc]::GetForegroundWindow() -eq $h)
}

function Activate-Strong([IntPtr]$h) {
    [void][Wc]::ShowWindow($h, 9)
    [void][Wc]::SetWindowPos($h, [IntPtr](-1), 0, 0, 0, 0, 0x0143)
    Start-Sleep -Milliseconds 90
    [void][Wc]::SetForegroundWindow($h)
    [void][Wc]::SetWindowPos($h, [IntPtr](-2), 0, 0, 0, 0, 0x0143)
    Start-Sleep -Milliseconds 120
    return ([Wc]::GetForegroundWindow() -eq $h)
}

function Wait-Foreground([IntPtr]$h, [int]$ms = 5000) {
    $deadline = (Get-Date).AddMilliseconds($ms)
    while ((Get-Date) -lt $deadline) {
        if ([Wc]::GetForegroundWindow() -eq $h) { return $true }
        Start-Sleep -Milliseconds 100
    }
    return $false
}

$procs = @(Get-Process -Name $ProcName -ErrorAction SilentlyContinue)
if ($procs.Count -eq 0) {
    if (Test-Path $Exe) { Start-Process $Exe | Out-Null; Start-Sleep -Seconds 4 }
    $procs = @(Get-Process -Name $ProcName -ErrorAction SilentlyContinue)
}
if ($procs.Count -eq 0) { Write-Output "NOWINDOW"; exit 1 }

# 1) 找独立聊天窗口
if ($Query) {
    foreach ($p in $procs) {
        foreach ($h in [Wc]::Windows([uint32]$p.Id)) {
            $t = [Wc]::Title($h)
            if ($t -and $t -ne "微信" -and $t -ne "Weixin" -and $t.Contains($Query)) {
                Focus-Hwnd $h
                Start-Sleep -Milliseconds 200
                Write-Output ("FOCUSED:" + $t)
                exit 0
            }
        }
    }
}

# 2) 回退：唤醒主窗并在搜索框里填好会话名
function Find-WeChatMain() {
    $fallback = [IntPtr]::Zero
    foreach ($p in $procs) {
        foreach ($h in [Wc]::Windows([uint32]$p.Id)) {
            $t = [Wc]::Title($h)
            if ($t -eq "微信") {
                if ([Wc]::IsWindowVisible($h)) { return $h }
                if ($fallback -eq [IntPtr]::Zero) { $fallback = $h }
            }
        }
    }
    return $fallback
}

$main = Find-WeChatMain

# 托盘里没有可用窗口时，用微信自带热键 Ctrl+Alt+W 唤出，再找一次
if ($main -eq [IntPtr]::Zero) {
    [System.Windows.Forms.SendKeys]::SendWait("^%w")
    Start-Sleep -Milliseconds 900
    $main = Find-WeChatMain
}
if ($main -eq [IntPtr]::Zero) {
    $p = $procs | Select-Object -First 1
    if ($p.MainWindowHandle -ne 0) { $main = $p.MainWindowHandle }
}
if ($main -eq [IntPtr]::Zero) { Write-Output "NOMAIN"; exit 1 }

[void][Wc]::ShowWindow($main, 5)
if (-not (Focus-Hwnd $main)) {
    if (-not (Activate-Strong $main)) { Write-Output "NOFOREGROUND"; exit 1 }
}
[void](Wait-Foreground $main 2000)
Start-Sleep -Milliseconds 350
if ([Wc]::GetForegroundWindow() -ne $main) {
    if (-not (Activate-Strong $main)) { Write-Output "NOKEYS"; exit 2 }
    if ([Wc]::GetForegroundWindow() -ne $main) { Write-Output "NOKEYS"; exit 2 }
}
[System.Windows.Forms.SendKeys]::SendWait("^f")
Start-Sleep -Milliseconds 900
[System.Windows.Forms.SendKeys]::SendWait("^v")
Start-Sleep -Milliseconds 900
Write-Output "SEARCH"


