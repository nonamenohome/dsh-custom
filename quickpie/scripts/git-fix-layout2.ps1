$ErrorActionPreference = "Stop"
$env:GIT_PAGER = ""
$env:PAGER = ""

$repo = "D:\QYD\dsh-file\.cache\dsh-push"
$treeFile = "D:\QYD\dsh-file\.cache\tree-entries.txt"
$msgFile = "D:\QYD\dsh-file\.cache\commitmsg3.txt"
Set-Location $repo

$outer = Join-Path $repo "quickpie"
$inner = Join-Path $outer "quickpie"

"== flatten: move inner contents up one level =="
if (Test-Path $inner) {
    Get-ChildItem -Path $inner -Force | ForEach-Object {
        Move-Item -Path $_.FullName -Destination (Join-Path $outer $_.Name) -Force
    }
    Remove-Item $inner -Recurse -Force
    Write-Output "flattened"
} else {
    Write-Output "no inner dir"
}
Write-Output ("files now: " + (Get-ChildItem $outer -Recurse -File -Force | Measure-Object).Count)
Get-ChildItem $outer -Force | Select-Object -First 12 -ExpandProperty Name

"== rebuild subtree from flattened dir =="
$idx = Join-Path $repo ".git\index-qp3"
Remove-Item $idx -Force -ErrorAction SilentlyContinue
$env:GIT_INDEX_FILE = $idx
git read-tree --empty
git add -A quickpie
$sub = (git write-tree).Trim()
$env:GIT_INDEX_FILE = $null
Write-Output "subtree: $sub"
Write-Output ("  entries: " + (git ls-tree --name-only $sub | Measure-Object).Count)
git ls-tree --name-only $sub | Select-Object -First 12 | ForEach-Object { "  - $_" }

"== rebuild top-level tree =="
$entries = git cat-file -p "origin/main^{tree}"
$newLine = "040000 tree $sub`tquickpie"
$sorted = New-Object System.Collections.Generic.List[string]
$inserted = $false
foreach ($l in $entries) {
    $parts = $l -split "`t"
    $mode = ($l -split " ")[0]
    $name = $parts[1]
    if ($name -eq "quickpie") { continue }
    $key = if ($mode -eq "040000") { "$name/" } else { $name }
    if (-not $inserted -and [string]::CompareOrdinal($key, "quickpie/") -gt 0) {
        $sorted.Add($newLine); $inserted = $true
    }
    $sorted.Add($l)
}
if (-not $inserted) { $sorted.Add($newLine) }
[IO.File]::WriteAllText($treeFile, ($sorted -join "`n") + "`n", (New-Object System.Text.UTF8Encoding($false)))
$newTree = (cmd /c "git mktree --missing < `"$treeFile`"").Trim()
Write-Output "top tree: $newTree"

$msg = "fix(quickpie): flatten layout so files sit directly under quickpie/"
[IO.File]::WriteAllText($msgFile, $msg, (New-Object System.Text.UTF8Encoding($false)))
$commit = (git commit-tree $newTree -p main -F $msgFile).Trim()
Write-Output "commit: $commit"
git update-ref refs/heads/publish $commit
Write-Output "publish ref updated"
