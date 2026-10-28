# QuickPie 窗口枚举助手
# 常驻进程，每 800ms 往 stdout 吐一行 JSON：[{h:hwnd,p:pid,e:exe名,t:标题}]
# 用 Add-Type 内存编译 C#，不落地任何 exe（所以不受这台机器的未签名程序限制影响）。

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)

Add-Type -Language CSharp -TypeDefinition @'
using System;
using System.Text;
using System.Runtime.InteropServices;

public class WinList
{
    delegate bool EnumProc(IntPtr hWnd, IntPtr lParam);

    [DllImport("user32.dll")] static extern bool EnumWindows(EnumProc cb, IntPtr p);
    [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr h);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern int GetWindowTextLengthW(IntPtr h);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern int GetWindowTextW(IntPtr h, StringBuilder s, int n);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern int GetClassNameW(IntPtr h, StringBuilder s, int n);
    [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
    [DllImport("user32.dll")] static extern int GetWindowLongW(IntPtr h, int i);
    [DllImport("kernel32.dll")] static extern IntPtr OpenProcess(uint a, bool b, uint pid);
    [DllImport("kernel32.dll", CharSet = CharSet.Unicode)] static extern bool QueryFullProcessImageNameW(IntPtr h, uint f, StringBuilder sb, ref uint size);
    [DllImport("kernel32.dll")] static extern bool CloseHandle(IntPtr h);

    static readonly string[] SkipClasses = {
        "Progman", "WorkerW", "Shell_TrayWnd", "Shell_SecondaryTrayWnd",
        "Windows.UI.Core.CoreWindow", "RLHost", "RLRing"
    };

    static string ExePath(uint pid)
    {
        IntPtr h = OpenProcess(0x1000, false, pid); // PROCESS_QUERY_LIMITED_INFORMATION
        if (h == IntPtr.Zero) return "";
        try
        {
            var sb = new StringBuilder(1024);
            uint size = 1024;
            return QueryFullProcessImageNameW(h, 0, sb, ref size) ? sb.ToString() : "";
        }
        finally { CloseHandle(h); }
    }

    static string Esc(string s)
    {
        var sb = new StringBuilder(s.Length + 8);
        foreach (char c in s)
        {
            if (c == '"') sb.Append("\\\"");
            else if (c == '\\') sb.Append("\\\\");
            else if (c < 32) sb.Append(' ');
            else sb.Append(c);
        }
        return sb.ToString();
    }

    public static string Dump()
    {
        var json = new StringBuilder("[");
        bool first = true;
        EnumWindows((h, l) =>
        {
            if (!IsWindowVisible(h)) return true;
            int len = GetWindowTextLengthW(h);
            if (len <= 0) return true;

            var cls = new StringBuilder(64);
            GetClassNameW(h, cls, 64);
            string cn = cls.ToString();
            foreach (var skip in SkipClasses) if (skip == cn) return true;

            // WS_EX_TOOLWINDOW
            if ((GetWindowLongW(h, -20) & 0x80) != 0) return true;

            var title = new StringBuilder(len + 2);
            GetWindowTextW(h, title, title.Capacity);
            string t = title.ToString().Trim();
            if (t.Length == 0) return true;

            uint pid;
            GetWindowThreadProcessId(h, out pid);
            string exe = ExePath(pid);
            if (exe.Length == 0) return true;
            string exeName = System.IO.Path.GetFileName(exe);
            // 排除自己（Electron 宿主 / 两个实现）
            if (exeName.Equals("electron.exe", StringComparison.OrdinalIgnoreCase) ||
                exeName.Equals("QuickPie.exe", StringComparison.OrdinalIgnoreCase) ||
                exeName.Equals("quickpie-rs.exe", StringComparison.OrdinalIgnoreCase)) return true;

            if (!first) json.Append(",");
            first = false;
            json.Append("{\"h\":").Append(h.ToInt64())
                .Append(",\"p\":").Append(pid)
                .Append(",\"e\":\"").Append(Esc(exeName))
                .Append("\",\"x\":\"").Append(Esc(exe))
                .Append("\",\"t\":\"").Append(Esc(t)).Append("\"}");
            return true;
        }, IntPtr.Zero);
        json.Append("]");
        return json.ToString();
    }
}
'@

while ($true) {
    try {
        $line = [WinList]::Dump()
        [Console]::Out.WriteLine($line)
        [Console]::Out.Flush()
    } catch {
        [Console]::Out.WriteLine('[]')
        [Console]::Out.Flush()
    }
    Start-Sleep -Milliseconds 800
}
