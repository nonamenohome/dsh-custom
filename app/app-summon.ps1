param(
    [string]$Exe = "",
    [string]$ProcName = ""
)
# 唤醒一个已在运行的程序（托盘隐藏也能出来）；没运行则启动它。
# 不做任何搜索、不发任何按键。

Add-Type @"
using System;
using System.Text;
using System.Collections.Generic;
using System.Runtime.InteropServices;
public class Summon {
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
    [DllImport("user32.dll")] public static extern bool BringWindowToTop(IntPtr h);
    [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int c);
    [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr h);
    [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
    [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr after, int x, int y, int cx, int cy, uint flags);
    [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
    [DllImport("user32.dll")] public static extern IntPtr AttachThreadInput(uint a, uint b, bool f);
    [DllImport("kernel32.dll")] public static extern uint GetCurrentThreadId();
    [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetWindowTextW(IntPtr h, StringBuilder s, int n);
    [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetClassNameW(IntPtr h, StringBuilder s, int n);
    [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
    [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
    public delegate bool EnumProc(IntPtr h, IntPtr l);

    public static List<IntPtr> Windows(uint pid) {
        var list = new List<IntPtr>();
        EnumWindows((h, l) => {
            uint p; GetWindowThreadProcessId(h, out p);
            if (p == pid) { list.Add(h); }
            return true;
        }, IntPtr.Zero);
        return list;
    }
    [DllImport("user32.dll")] static extern bool EnumWindows(EnumProc cb, IntPtr l);

    public static string Title(IntPtr h) { var sb = new StringBuilder(512); GetWindowTextW(h, sb, 512); return sb.ToString(); }
    public static string Cls(IntPtr h) { var sb = new StringBuilder(256); GetClassNameW(h, sb, 256); return sb.ToString(); }

    /// 挑一个最像"主窗口"的：可见且有标题的优先，其次标题非空，最后任一。
    public static IntPtr PickMain(uint pid) {
        IntPtr best = IntPtr.Zero; int bestScore = -1;
        foreach (var h in Windows(pid)) {
            var t = Title(h); var c = Cls(h);
            if (c.Contains("ToolTip") || c.Contains("ToolSave") || c.Contains("IME") || c.Contains("MSCTF")) continue;
            if (t.Length == 0) continue;
            int score = 0;
            if (IsWindowVisible(h)) score += 10;
            RECT r; GetWindowRect(h, out r);
            long area = (long)(r.R - r.L) * (r.B - r.T);
            if (area > 200000) score += 5; else if (area < 50000) score -= 5;
            if (t.Length <= 20) score += 2;
            if (score > bestScore) { bestScore = score; best = h; }
        }
        return best;
    }
}
"@

function Activate([IntPtr]$h) {
    if ([Summon]::IsIconic($h)) { [void][Summon]::ShowWindow($h, 9) }
    [void][Summon]::ShowWindow($h, 5)
    for ($i = 0; $i -lt 3; $i++) {
        if ([Summon]::GetForegroundWindow() -eq $h) { return $true }
        $fg = [Summon]::GetForegroundWindow()
        $fgPid = 0
        $t1 = if ($fg -ne [IntPtr]::Zero) { [Summon]::GetWindowThreadProcessId($fg, [ref]$fgPid) } else { 0 }
        $t2 = [Summon]::GetCurrentThreadId()
        if ($t1 -ne 0) { [void][Summon]::AttachThreadInput($t2, $t1, $true) }
        [void][Summon]::BringWindowToTop($h)
        [void][Summon]::SetForegroundWindow($h)
        if ($t1 -ne 0) { [void][Summon]::AttachThreadInput($t2, $t1, $false) }
        Start-Sleep -Milliseconds 150
        if ([Summon]::GetForegroundWindow() -eq $h) { return $true }
        [void][Summon]::SetWindowPos($h, [IntPtr](-1), 0, 0, 0, 0, 0x0143)
        Start-Sleep -Milliseconds 80
        [void][Summon]::SetWindowPos($h, [IntPtr](-2), 0, 0, 0, 0, 0x0143)
    }
    return ([Summon]::GetForegroundWindow() -eq $h)
}

if (-not $ProcName -and $Exe) { $ProcName = [IO.Path]::GetFileNameWithoutExtension($Exe) }

$procs = @()
if ($ProcName) { $procs = @(Get-Process -Name $ProcName -ErrorAction SilentlyContinue) }

if ($procs.Count -gt 0) {
    $best = [IntPtr]::Zero; $bestPid = 0
    # 优先用系统认定的"主窗口"（避免挑到聊天子窗）
    foreach ($p in $procs) {
        if ($p.MainWindowHandle -ne 0) { $best = $p.MainWindowHandle; $bestPid = $p.Id; break }
    }
    if ($best -eq [IntPtr]::Zero) {
        foreach ($p in $procs) {
            $h = [Summon]::PickMain([uint32]$p.Id)
            if ($h -ne [IntPtr]::Zero) { $best = $h; $bestPid = $p.Id; break }
        }
    }
    if ($best -ne [IntPtr]::Zero) {
        $ok = Activate $best
        Write-Output ("SUMMONED:" + [Summon]::Title($best) + ":" + $ok)
        exit 0
    }
    # 进程在但没有窗口（纯托盘且无 HWND）-> 只能再执行一次让它自己弹
}

if ($Exe -and (Test-Path $Exe)) {
    Start-Process $Exe | Out-Null
    Start-Sleep -Seconds 2
    $procs = @(Get-Process -Name $ProcName -ErrorAction SilentlyContinue)
    foreach ($p in $procs) {
        $h = [Summon]::PickMain([uint32]$p.Id)
        if ($h -ne [IntPtr]::Zero) { [void](Activate $h); Write-Output ("STARTED:" + [Summon]::Title($h)); exit 0 }
    }
    Write-Output "STARTED-NOWINDOW"
    exit 0
}

Write-Output "NOFOUND"
exit 1

