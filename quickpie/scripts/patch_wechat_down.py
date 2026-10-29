import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\wechat-chat.ps1")
s = p.read_text(encoding="utf-8")
s = s.replace('''[System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
Start-Sleep -Milliseconds 300''',
'''[System.Windows.Forms.SendKeys]::SendWait("{DOWN}")
Start-Sleep -Milliseconds 250
[System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
Start-Sleep -Milliseconds 400''')
p.write_text(s, encoding="utf-8")
print("patched")
