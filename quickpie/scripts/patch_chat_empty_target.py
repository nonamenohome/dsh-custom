import pathlib
q = pathlib.Path("app/manager.js")
s = q.read_text(encoding="utf-8")

# 1) 会话类型允许空目标
s = s.replace("""    const isGroup = draft.type === 'group';
    if (!target && !isGroup) { toast('请填写目标路径或网址'); $('fTarget').focus(); return; }""",
"""    const isGroup = draft.type === 'group';
    const isChat = draft.type === 'chat';
    if (!target && !isGroup && !isChat) {
      toast('请填写目标路径或网址'); $('fTarget').focus(); return;
    }""")

# 2) 会话类型时，目标输入框给出提示
s = s.replace("""    if (isChat) $('fQuery').value = draft.query || '';""",
"""    if (isChat) $('fQuery').value = draft.query || '';
    $('fTarget').placeholder = isChat
      ? '留空即可（默认用微信 D:\\\\Weixin\\\\Weixin.exe）'
      : 'D:\\\\路径 或 https://example.com';""")
q.write_text(s, encoding="utf-8")
print("manager ok")
