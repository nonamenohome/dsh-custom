$ErrorActionPreference = "Continue"
$env:GIT_PAGER = ""
$env:PAGER = ""
$env:GIT_TERMINAL_PROMPT = "0"
$repo = "D:\QYD\dsh-file\.cache\dsh-push"
$log = "D:\QYD\dsh-file\.cache\push-retry.log"
Set-Location $repo
git config http.version HTTP/1.1
git config http.postBuffer 524288000

"[$(Get-Date -Format 'HH:mm:ss')] start retry loop (commit $(git rev-parse --short publish))" | Tee-Object -FilePath $log -Append

for ($i = 1; $i -le 20; $i++) {
    $out = git push origin publish:main 2>&1
    if ($LASTEXITCODE -eq 0) {
        "[$(Get-Date -Format 'HH:mm:ss')] attempt $i OK" | Tee-Object -FilePath $log -Append
        $out | Select-Object -Last 2 | Tee-Object -FilePath $log -Append
        exit 0
    }
    $reason = ($out | Select-String -Pattern 'Could not connect|408|Hung up|denied|rejected' | Select-Object -First 1)
    "[$(Get-Date -Format 'HH:mm:ss')] attempt $i failed: $reason" | Tee-Object -FilePath $log -Append
    Start-Sleep -Seconds 20
}
"[$(Get-Date -Format 'HH:mm:ss')] gave up" | Tee-Object -FilePath $log -Append
exit 1
