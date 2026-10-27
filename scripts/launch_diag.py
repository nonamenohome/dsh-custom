import subprocess, os, time
exe = r"D:\QYD\dsh-file\apps\quickpie\dist\QuickPie\QuickPie.exe"
env = dict(os.environ)
env.pop("ELECTRON_RUN_AS_NODE", None)
args = [exe, r"--user-data-dir=D:\QYD\dsh-file\apps\quickpie\dist\QuickPie\PortableData", "--no-sandbox", "--enable-logging"]
p = subprocess.Popen(args, cwd=os.path.dirname(exe), env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
time.sleep(6)
alive = p.poll() is None
print("alive:", alive)
if alive:
    p.terminate()
try:
    out, _ = p.communicate(timeout=10)
    print("---- output ----")
    print((out or "")[:3000])
except Exception as e:
    print("comm err", e)
print("returncode:", p.returncode)
