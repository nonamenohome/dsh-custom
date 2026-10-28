# QuickPie 本地验证脚本
#   .\scripts\dev-run.ps1 shot             -> 生成界面截图到 ..\..\.cache\shots
#   .\scripts\dev-run.ps1 shot -Dark       -> 深色主题截图
#   .\scripts\dev-run.ps1 selftest         -> 跑数据层自检，写 ..\..\.cache\selftest.json
#
# 说明：DSH 的受限沙箱会拦截 Chromium 渲染进程所需的命名管道，
# 因此这里默认带上 --no-sandbox，并在 workspace 内使用独立 profile。

param(
  [Parameter(Position = 0)]
  [ValidateSet('shot', 'selftest')]
  [string]$Mode = 'shot',

  [switch]$Dark,

  [string]$Electron = "D:\QYD\dsh-file\apps\image-compress\node_modules\electron\dist\electron.exe"
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$cache = Join-Path (Split-Path -Parent (Split-Path -Parent $root)) '.cache'

if (-not (Test-Path $Electron)) {
  throw "找不到 electron.exe: $Electron"
}

$env:ELECTRON_RUN_AS_NODE = $null
$outDir = Join-Path $cache 'shots'
$profileDir = Join-Path $cache ("qp-" + $Mode + $(if ($Dark) { '-dark' } else { '' }))
if ($Mode -eq 'shot' -and -not $Dark) {
  if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Force $outDir | Out-Null }
  Get-ChildItem "$outDir\*" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
}

$argv = @($root, '--no-sandbox', "--user-data-dir=$profileDir")
if ($Mode -eq 'shot') {
  $argv += '--shot'
  if ($Dark) { $argv += '--dark' }
} else {
  $argv += '--selftest'
}

& $Electron @argv
Write-Host "exit=$LASTEXITCODE"

if ($Mode -eq 'shot') {
  Get-ChildItem "$outDir\*" -ErrorAction SilentlyContinue | Select-Object Name, Length | Format-Table -AutoSize
} else {
  Get-Content (Join-Path $profileDir 'selftest.json') -Encoding utf8 -ErrorAction SilentlyContinue
}
