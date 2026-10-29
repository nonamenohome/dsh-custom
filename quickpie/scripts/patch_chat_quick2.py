import pathlib
w = pathlib.Path("app/wheel.js")
s = w.read_text(encoding="utf-8")

# 1) 输入条加模式胶囊
s = s.replace("""    const wrap = document.createElement('div');
    wrap.className = 'quick-input';
    const grp = hotGroup();
    wrap.innerHTML = `
      <input type="text" spellcheck="false" placeholder="${grp ? `添加到「${grp.name}」：粘贴网址 / 路径，回车` : '粘贴或输入网址 / 路径，回车添加'}" />
      <kbd>Enter</kbd>`;""",
"""    quickMode = 'auto';
    const wrap = document.createElement('div');
    wrap.className = 'quick-input';
    const grp = hotGroup();
    wrap.innerHTML = `
      <span class="quick-mode">条目</span>
      <input type="text" spellcheck="false" placeholder="${grp ? `添加到「${grp.name}」：回车确认，Tab 切成微信会话` : '粘贴名字或路径；Tab 切成微信会话，回车添加'}" />
      <kbd>Tab</kbd><kbd>Enter</kbd>`;""")

# 2) keydown：Tab 切换模式；回车按模式添加
s = s.replace("""      if (ev.key === 'Escape') { closeQuickInput(); return; }
      if (ev.key !== 'Enter') return;""",
"""      if (ev.key === 'Escape') { closeQuickInput(); return; }
      if (ev.key === 'Tab') {
        ev.preventDefault();
        quickMode = quickMode === 'auto' ? 'chat' : 'auto';
        wrap.querySelector('.quick-mode').textContent = quickMode === 'chat' ? '微信会话' : '条目';
        wrap.classList.toggle('is-chat', quickMode === 'chat');
        return;
      }
      if (ev.key !== 'Enter') return;""")

# 3) 添加时区分模式
s = s.replace("""      const added = await api.addItems(list.map((target) => ({ target })));""",
"""      const payload = list.map((target) => (quickMode === 'chat'
        ? { type: 'chat', name: target, query: target, target: '' }
        : { target }));
      const added = await api.addItems(payload);""")
w.write_text(s, encoding="utf-8")
print("ok")
