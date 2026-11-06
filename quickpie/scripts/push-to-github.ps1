$ErrorActionPreference = "Continue"
$env:GIT_PAGER = ""
$env:PAGER = ""
$env:GIT_TERMINAL_PROMPT = "0"

$src = "D:\QYD\dsh-file\apps\quickpie"
$repo = "D:\QYD\dsh-file\.cache\dsh-push"
$treeFile = "D:\QYD\dsh-file\.cache\tree-entries.txt"
$msgFile = "D:\QYD\dsh-file\.cache\commitmsg-push.txt"
Set-Location $repo
git config http.version HTTP/1.1
git config http.postBuffer 524288000

# 1) 拉取远端最新 main（无 blob，快）
"== fetch origin main =="
for ($i=1; $i -le 3; $i++) {
    git fetch --depth 1 --filter=blob:none origin main 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) { break }
    "fetch 重试 $i"; Start-Sleep -Seconds 5
}
$remoteMain = (git rev-parse FETCH_HEAD).Trim()
Write-Output "remote main: $remoteMain"

# 2) 用最新源码覆盖 quickpie/
"== sync files =="
Remove-Item (Join-Path $repo "quickpie") -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force (Join-Path $repo "quickpie") | Out-Null
$tar = "D:\QYD\dsh-file\.cache\qp2.tar"
Push-Location $src
git archive --format=tar HEAD -o $tar
Pop-Location
tar -xf $tar -C (Join-Path $repo "quickpie")
Write-Output ("files: " + (Get-ChildItem (Join-Path $repo "quickpie") -Recurse -File -Force | Measure-Object).Count)

# 3) 建 quickpie 子树（取索引里带前缀的树，再取内层）
"== build subtree =="
$idx = Join-Path $repo ".git\index-qp4"
Remove-Item $idx -Force -ErrorAction SilentlyContinue
$env:GIT_INDEX_FILE = $idx
git read-tree --empty
git add -A quickpie
$outerTree = (git write-tree).Trim()
$innerTree = (git rev-parse "${outerTree}:quickpie").Trim()
$env:GIT_INDEX_FILE = $null
Write-Output "subtree: $innerTree"
Write-Output ("entries: " + (git ls-tree --name-only $innerTree | Measure-Object).Count)

# 4) 顶层树 = 远端 main 的树 + quickpie
"== build top tree =="
$entries = git cat-file -p "${remoteMain}^{tree}"
$newLine = "040000 tree $innerTree`tquickpie"
$sorted = New-Object System.Collections.Generic.List[string]
$inserted = $false
foreach ($l in $entries) {
    $mode = ($l -split " ")[0]
    $name = ($l -split "`t")[1]
    if ($name -eq "quickpie") { continue }
    $key = if ($mode -eq "040000") { "$name/" } else { $name }
    if (-not $inserted -and [string]::CompareOrdinal($key, "quickpie/") -gt 0) { $sorted.Add($newLine); $inserted = $true }
    $sorted.Add($l)
}
if (-not $inserted) { $sorted.Add($newLine) }
[IO.File]::WriteAllText($treeFile, ($sorted -join "`n") + "`n", (New-Object System.Text.UTF8Encoding($false)))
$topTree = (cmd /c "git mktree --missing < `"$treeFile`"").Trim()
Write-Output "top tree: $topTree"

# 5) 提交并推送
"== commit & push =="
$msg = @"
feat(quickpie): 会话类型 + 唤醒已有实例 (v0.9.3)

- 新增「会话」条目：填会话名即可，目标可留空
- 点击优先按窗口标题匹配独立聊天窗口，否则唤醒主窗并填好搜索框
- 分组/应用若已在运行则唤醒已有窗口，不再启动第二个实例
- 发送按键前校验前台窗口，避免按键漏到其它程序
- 快速添加支持 Ctrl+V 后按 Tab 转为会话条目
"@
[IO.File]::WriteAllText($msgFile, $msg, (New-Object System.Text.UTF8Encoding($false)))
$commit = (git commit-tree $topTree -p $remoteMain -F $msgFile).Trim()
Write-Output "commit: $commit"
git update-ref refs/heads/publish $commit

$ok = $false
for ($i=1; $i -le 6; $i++) {
    $out = git push origin publish:main 2>&1
    if ($LASTEXITCODE -eq 0) { $ok = $true; $out | Select-Object -Last 2; break }
    "push 第 $i 次失败: " + (($out | Select-String 'rejected|Could not connect|408' | Select-Object -First 1))
    Start-Sleep -Seconds 8
}
Write-Output "pushed: $ok"
