$ErrorActionPreference = "Stop"
$env:GIT_PAGER = ""
$env:PAGER = ""

$repo = "D:\QYD\dsh-file\.cache\dsh-push"
$treeFile = "D:\QYD\dsh-file\.cache\tree-entries.txt"
$msgFile = "D:\QYD\dsh-file\.cache\commitmsg2.txt"
Set-Location $repo

"== step 1: rebuild quickpie subtree (paths relative to its root) =="
$idx = Join-Path $repo ".git\index-qp2"
Remove-Item $idx -Force -ErrorAction SilentlyContinue
$env:GIT_INDEX_FILE = $idx
Set-Location (Join-Path $repo "quickpie")
git read-tree --empty
git add -A .
$sub = (git write-tree).Trim()
Set-Location $repo
$env:GIT_INDEX_FILE = $null
Write-Output "subtree: $sub"
Write-Output ("  root entries: " + (git ls-tree --name-only $sub | Measure-Object).Count)
git ls-tree --name-only $sub | ForEach-Object { "  - $_" }

"== step 2: rebuild top-level tree =="
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
        $sorted.Add($newLine)
        $inserted = $true
    }
    $sorted.Add($l)
}
if (-not $inserted) { $sorted.Add($newLine) }
[IO.File]::WriteAllText($treeFile, ($sorted -join "`n") + "`n", (New-Object System.Text.UTF8Encoding($false)))
$newTree = (cmd /c "git mktree --missing < `"$treeFile`"").Trim()
Write-Output "top tree: $newTree"

"== step 3: commit on top of current main =="
$msg = "fix(quickpie): flatten directory layout (no nested quickpie/quickpie)`n`nPrevious commit placed files under quickpie/quickpie/. This commit puts`napp/, main.js, package.json ... directly under quickpie/."
[IO.File]::WriteAllText($msgFile, $msg, (New-Object System.Text.UTF8Encoding($false)))
$commit = (git commit-tree $newTree -p main -F $msgFile).Trim()
Write-Output "commit: $commit"
git update-ref refs/heads/publish $commit
git ls-tree --name-only publish | ForEach-Object { "  top: $_" }
