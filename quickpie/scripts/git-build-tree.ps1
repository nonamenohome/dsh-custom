$ErrorActionPreference = "Stop"
$env:GIT_PAGER = ""
$env:PAGER = ""

$repo = "D:\QYD\dsh-file\.cache\dsh-push"
$treeFile = "D:\QYD\dsh-file\.cache\tree-entries.txt"
$msgFile = "D:\QYD\dsh-file\.cache\commitmsg.txt"
$sub = "e1e67e37f5ef1c88a0c1250074c8bee5b62ed475"
Set-Location $repo

$entries = git cat-file -p "origin/main^{tree}"
if (-not $entries) { throw "cannot read origin/main tree" }

$newLine = "040000 tree $sub`tquickpie"
$sorted = New-Object System.Collections.Generic.List[string]
$inserted = $false
foreach ($l in $entries) {
    $parts = $l -split "`t"
    $mode = ($l -split " ")[0]
    $name = $parts[1]
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
if (-not $newTree) { throw "mktree failed" }
Write-Output "new tree: $newTree"
Write-Output ("entries: " + (git cat-file -p $newTree | Measure-Object).Count)

$commit = (git commit-tree $newTree -p origin/main -F $msgFile).Trim()
Write-Output "commit: $commit"
git update-ref refs/heads/publish $commit
Write-Output ("publish: " + (git rev-parse --short publish))
$hasQp = [bool](git ls-tree --name-only publish | Where-Object { $_ -eq "quickpie" })
Write-Output ("has quickpie: $hasQp")
Write-Output ("top-level entries: " + (git ls-tree --name-only publish | Measure-Object).Count)

