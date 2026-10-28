import json, subprocess, base64
from pathlib import Path

PS = r'''
param([string]$Lnk)
$base = [IO.Path]::GetFileNameWithoutExtension($Lnk)
$pkg = $null
$app = Get-StartApps | Where-Object { $_.Name -eq $base } | Select-Object -First 1
if ($app) {
  $fam = ($app.AppID -split '!')[0]
  $pkg = Get-AppxPackage | Where-Object { $_.PackageFamilyName -eq $fam } | Select-Object -First 1
}
if (-not $pkg) {
  $pkg = Get-AppxPackage | Where-Object { $_.Name -like ('*' + $base + '*') } | Select-Object -First 1
}
if (-not $pkg) { 'NOPKG'; exit }
$man = Join-Path $pkg.InstallLocation 'AppxManifest.xml'
if (-not (Test-Path $man)) { 'NOMANIFEST'; exit }
$xml = Get-Content $man -Raw -Encoding utf8
$rel = $null
foreach ($p in @('Square44x44Logo="([^"]+)"','Square150x150Logo="([^"]+)"','Logo="([^"]+)"')) {
  $m = [regex]::Match($xml, $p)
  if ($m.Success) { $rel = $m.Groups[1].Value; break }
}
if (-not $rel) { 'NOLOGO'; exit }
$rel = $rel -replace '\\','/'
$dir = Split-Path (Join-Path $pkg.InstallLocation $rel)
$leaf = [IO.Path]::GetFileNameWithoutExtension($rel)
$c = Get-ChildItem $dir -Filter ($leaf + '*') -File -ErrorAction SilentlyContinue | Where-Object { $_.Extension -eq '.png' } | Sort-Object Length -Descending | Select-Object -First 1
if (-not $c) { 'NOFILE'; exit }
'DATA:' + [Convert]::ToBase64String([IO.File]::ReadAllBytes($c.FullName))
'''
script = Path(r"D:\QYD\dsh-file\.cache\uwp2.ps1")
script.write_text(PS, encoding="utf-8")

def uwp_icon(lnk):
    r = subprocess.run(["powershell","-NoProfile","-ExecutionPolicy","Bypass","-File",str(script),"-Lnk",lnk],
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    out = (r.stdout or "").strip().splitlines()
    line = out[-1] if out else ""
    if line.startswith("DATA:"):
        return "data:image/png;base64," + line[5:]
    return None, (line or (r.stderr or "")[:100])

data_p = Path(r"D:\QYD\Tools\QuickPie\PortableData\data.json")
d = json.loads(data_p.read_text(encoding="utf-8"))

targets = {
    r"C:\Users\quyuedi\Desktop\Claude.lnk": None,
    r"C:\Users\quyuedi\Desktop\Codex.lnk": None,
}
for t in list(targets):
    res = uwp_icon(t)
    if isinstance(res, tuple):
        print(t, "失败:", res[1])
    else:
        targets[t] = res
        print(t, "OK, base64 长度", len(res))

changed = 0
def walk(items):
    global changed
    for it in items:
        t = (it.get("target") or "")
        for k, icon in targets.items():
            if icon and t.lower() == k.lower():
                it["icon"] = icon
                changed += 1
                print("  设置图标:", it["name"])
        walk(it.get("children") or [])
walk(d["items"])

if changed:
    data_p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")
print("更新条目数:", changed)
