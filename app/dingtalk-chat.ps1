param([string]$Query = "", [string]$Exe = "D:\DingDing\main\current_new\DingTalk.exe", [string]$ProcName = "DingTalk")

# 打开钉钉指定会话：
#  1) 有标题含会话名的独立窗口 -> 直接切过去
#  2) 否则唤出主窗，点搜索框（UIA 设值，不模拟打字），回车进会话

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName UIAutomationClient, UIAutomationTypes
Add-Type @"
using System; using System.Text; using System.Collections.Generic; using System.Runtime.InteropServices;
public class DT {
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
    [DllImport("user32.dll")] public static extern bool BringWindowToTop(IntPtr h);
    [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int c);
    [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr h);
    [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
    [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr a, int x, int y, int cx, int cy, uint f);
    [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint p);
    [DllImport("user32.dll")] public static extern IntPtr AttachThreadInput(uint a, uint b, bool f);
    [DllImport("kernel32.dll")] public static extern uint GetCurrentThreadId();
    [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetWindowTextW(IntPtr h, StringBuilder s, int n);
    [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
    [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
    [DllImport("user32.dll")] public static extern void mouse_event(uint f, uint dx, uint dy, uint d, IntPtr e);
    public delegate bool EnumProc(IntPtr h, IntPtr l);
    [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc cb, IntPtr l);
    public static List<IntPtr> Windows(uint pid) {
        var list = new List<IntPtr>();
        EnumWindows((h, l) => { uint p; GetWindowThreadProcessId(h, out p); if (p == pid) list.Add(h); return true; }, IntPtr.Zero);
        return list;
    }
    public static string Title(IntPtr h) { var sb = new StringBuilder(512); GetWindowTextW(h, sb, 512); return sb.ToString(); }
}
"@

[void][DT]::SetProcessDPIAware()

function Activate([IntPtr]$h) {
    if ([DT]::IsIconic($h)) { [void][DT]::ShowWindow($h, 9) }
    [void][DT]::ShowWindow($h, 5)
    for ($i = 0; $i -lt 3; $i++) {
        if ([DT]::GetForegroundWindow() -eq $h) { return $true }
        $fg = [DT]::GetForegroundWindow(); $fgPid = 0
        $t1 = if ($fg -ne [IntPtr]::Zero) { [DT]::GetWindowThreadProcessId($fg, [ref]$fgPid) } else { 0 }
        $t2 = [DT]::GetCurrentThreadId()
        if ($t1 -ne 0) { [void][DT]::AttachThreadInput($t2, $t1, $true) }
        [void][DT]::BringWindowToTop($h); [void][DT]::SetForegroundWindow($h)
        if ($t1 -ne 0) { [void][DT]::AttachThreadInput($t2, $t1, $false) }
        Start-Sleep -Milliseconds 150
        if ([DT]::GetForegroundWindow() -eq $h) { return $true }
        [void][DT]::SetWindowPos($h, [IntPtr](-1), 0,0,0,0, 0x0143); Start-Sleep -Milliseconds 80
        [void][DT]::SetWindowPos($h, [IntPtr](-2), 0,0,0,0, 0x0143)
    }
    return ([DT]::GetForegroundWindow() -eq $h)
}

$procs = @(Get-Process -Name $ProcName -ErrorAction SilentlyContinue)
if ($procs.Count -eq 0) {
    if (Test-Path $Exe) { Start-Process $Exe | Out-Null; Start-Sleep -Seconds 4; $procs = @(Get-Process -Name $ProcName -ErrorAction SilentlyContinue) }
}
if ($procs.Count -eq 0) { Write-Output "NOWINDOW"; exit 1 }

# 1) 独立聊天窗口（标题 = 人名/群名）
if ($Query) {
    foreach ($p in $procs) {
        foreach ($h in [DT]::Windows([uint32]$p.Id)) {
            $t = [DT]::Title($h)
            if ($t -and $t -ne "钉钉" -and $t.Contains($Query)) {
                [void](Activate $h); Write-Output ("FOCUSED:" + $t); exit 0
            }
        }
    }
}

# 2) 主窗 + 搜索框
$main = [IntPtr]::Zero
foreach ($p in $procs) { if ($p.MainWindowHandle -ne 0) { $main = $p.MainWindowHandle; break } }
if ($main -eq [IntPtr]::Zero) { Write-Output "NOMAIN"; exit 1 }
if (-not (Activate $main)) { Write-Output "NOFOREGROUND"; exit 1 }
Start-Sleep -Milliseconds 500

$root = [System.Windows.Automation.AutomationElement]::FromHandle($main)
$condType = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::ControlTypeProperty, [System.Windows.Automation.ControlType]::Edit)

function Find-SearchBox() {
    # 1) 先在主窗里找
    $edits = $root.FindAll([System.Windows.Automation.TreeScope]::Descendants, $condType)
    for ($i = 0; $i -lt $edits.Count; $i++) {
        if ($edits[$i].Current.ClassName -eq 'QLineEdit') { return $edits[$i] }
    }
    # 2) 主窗里没有：在整个桌面按进程找（搜索框可能在独立弹窗里）
    foreach ($p in $procs) {
        $condPid = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::ProcessIdProperty, $p.Id)
        $and = New-Object System.Windows.Automation.AndCondition($condPid, $condType)
        $all = [System.Windows.Automation.AutomationElement]::RootElement.FindAll([System.Windows.Automation.TreeScope]::Descendants, $and)
        for ($i = 0; $i -lt $all.Count; $i++) {
            if ($all[$i].Current.ClassName -eq 'QLineEdit') { return $all[$i] }
        }
    }
    return $null
}

$search = Find-SearchBox
if (-not $search) { Write-Output "NOSEARCH"; exit 2 }

# 搜索框默认禁用：先点一下
if (-not $search.Current.IsEnabled) {
    $r = $search.Current.BoundingRectangle
    if ($r.Width -gt 0) {
        [void][DT]::SetCursorPos([int]($r.X + $r.Width/2), [int]($r.Y + $r.Height/2))
        Start-Sleep -Milliseconds 120
        [DT]::mouse_event(0x0002,0,0,0,[IntPtr]::Zero); Start-Sleep -Milliseconds 70
        [DT]::mouse_event(0x0004,0,0,0,[IntPtr]::Zero); Start-Sleep -Milliseconds 500
        $search = Find-SearchBox
    }
}
if (-not $search.Current.IsEnabled) { Write-Output "SEARCHDISABLED"; exit 3 }

try {
    $search.GetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern).SetValue($Query)
} catch { Write-Output ("SETFAIL:" + $_.Exception.Message); exit 4 }

Start-Sleep -Milliseconds 900

# 和微信一致：只把名字填好，最后一步回车交给用户（钉钉不接受程序合成的选中操作）
if ([DT]::GetForegroundWindow() -ne $main) { [void](Activate $main); Start-Sleep -Milliseconds 300 }
Write-Output "READY"

