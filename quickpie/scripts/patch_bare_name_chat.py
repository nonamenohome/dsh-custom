import pathlib
w = pathlib.Path("app/wheel.js")
s = w.read_text(encoding="utf-8")

# 1) 模式胶囊可点击切换
s = s.replace("""    const input = wrap.querySelector('input');""",
"""    const modeChip = wrap.querySelector('.quick-mode');
    const toggleMode = () => {
      quickMode = quickMode === 'auto' ? 'chat' : 'auto';
      modeChip.textContent = quickMode === 'chat' ? '微信会话' : '条目';
      wrap.classList.toggle('is-chat', quickMode === 'chat');
    };
    modeChip.addEventListener('click', (e) => { e.stopPropagation(); toggleMode(); });
    const input = wrap.querySelector('input');""")

# 2) Tab 复用 toggleMode
s = s.replace("""      if (ev.key === 'Tab') {
        ev.preventDefault();
        quickMode = quickMode === 'auto' ? 'chat' : 'auto';
        wrap.querySelector('.quick-mode').textContent = quickMode === 'chat' ? '微信会话' : '条目';
        wrap.classList.toggle('is-chat', quickMode === 'chat');
        return;
      }""",
"""      if (ev.key === 'Tab') {
        ev.preventDefault();
        toggleMode();
        return;
      }""")

# 3) 裸名字自动当会话
s = s.replace("""      const payload = list.map((target) => (quickMode === 'chat'
        ? { type: 'chat', name: target, query: target, target: '' }
        : { target }));""",
"""      const looksLikePath = (t) => /[\\\\/:]/.test(t) || /\\.[a-z0-9]{2,5}$/i.test(t);
      const payload = list.map((target) => {
        const asChat = quickMode === 'chat' || (!looksLikePath(target) && !fsExists(target));
        return asChat
          ? { type: 'chat', name: target, query: target, target: '' }
          : { target };
      });""")

# 4) 本地存在性判断（渲染层没有 fs，用是否含盘符/分隔符替代）
s = s.replace("""  let quickBox = null;""",
"""  function fsExists() { return false; }   // 渲染层不碰文件系统；裸名字一律按会话处理

  let quickBox = null;""")
w.write_text(s, encoding="utf-8")
print("ok")
