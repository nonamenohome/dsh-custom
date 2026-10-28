const { spawn } = require('child_process');

const script = `
for ($i = 0; $i -lt 3; $i++) {
  Write-Output ("tick " + $i)
  Start-Sleep -Milliseconds 300
}
`;

const ps = spawn('powershell', ['-NoProfile', '-NonInteractive', '-Command', script], {
  stdio: ['pipe', 'pipe', 'pipe'],
  windowsHide: true,
});

let out = '';
ps.stdout.on('data', (d) => { out += d.toString(); });
ps.stderr.on('data', (d) => { out += '[err] ' + d.toString(); });
ps.on('error', (e) => console.log('spawn error:', e.message));
ps.on('close', () => console.log('stdout:', JSON.stringify(out)));
