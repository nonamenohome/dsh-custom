param([string]$LnkPath)

# 从 UWP / 商店应用快捷方式里取图标：
# 1) 开始菜单按名字找 AUMID  2) 退化为按包名模糊匹配  3) 读清单里的 logo，取最大的 PNG

$base = [IO.Path]::GetFileNameWithoutExtension($LnkPath)
$pkg = $null

$app = Get-StartApps | Where-Object { $_.Name -eq $base } | Select-Object -First 1
if ($app) {
  $family = ($app.AppID -split '!')[0]
  $pkg = Get-AppxPackage | Where-Object { $_.PackageFamilyName -eq $family } | Select-Object -First 1
}

if (-not $pkg) {
  $pkg = Get-AppxPackage | Where-Object { $_.Name -like "*$base*" } | Select-Object -First 1
}

if (-not $pkg) {
  # 最后：从 .lnk 二进制里找包名（形如 Name_1.2.3.4_x64__hash）
  try {
    $bytes = [IO.File]::ReadAllBytes($LnkPath)
    $txt = -join ($bytes | ForEach-Object { if ($_ -ge 32 -and $_ -lt 127) { [char]$_ } else { ' ' } })
    $m = [regex]::Match($txt, '([A-Za-z0-9.\-]+)_\d+(?:\.\d+)+_(?:x64|x86|arm64|neutral)__([a-z0-9]{13})')
    if ($m.Success) {
      $family = $m.Groups[1].Value + '_' + $m.Groups[2].Value
      $pkg = Get-AppxPackage | Where-Object { $_.PackageFamilyName -eq $family } | Select-Object -First 1
    }
  } catch { }
}

if (-not $pkg) { Write-Output 'NOPKG'; exit }
if (-not $pkg.InstallLocation) { Write-Output 'NOLOC'; exit }

$manifest = Join-Path $pkg.InstallLocation 'AppxManifest.xml'
if (-not (Test-Path $manifest)) { Write-Output 'NOMANIFEST'; exit }

$xml = Get-Content $manifest -Raw -Encoding utf8
$logoRel = $null
foreach ($pat in @('Square44x44Logo="([^"]+)"', 'Square150x150Logo="([^"]+)"', 'Logo="([^"]+)"')) {
  $m = [regex]::Match($xml, $pat)
  if ($m.Success) { $logoRel = $m.Groups[1].Value; break }
}
if (-not $logoRel) { Write-Output 'NOLOGO'; exit }

$logoRel = $logoRel -replace '\\', '/'
$dir = Split-Path (Join-Path $pkg.InstallLocation $logoRel)
$leaf = [IO.Path]::GetFileNameWithoutExtension($logoRel)

$cand = Get-ChildItem $dir -Filter "$leaf*" -File -ErrorAction SilentlyContinue |
  Where-Object { $_.Extension -eq '.png' } |
  Sort-Object Length -Descending | Select-Object -First 1

if (-not $cand) { Write-Output 'NOFILE'; exit }

$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($cand.FullName))
Write-Output ('DATA:' + $b64)
