import pathlib

# ---------- index.html：加「分组」类型 + 子项区域 ----------
h = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\index.html")
s = h.read_text(encoding="utf-8")
s = s.replace("""                <button type="button" data-type="file">文件</button>""",
"""                <button type="button" data-type="file">文件</button>
                <button type="button" data-type="group">分组</button>""")
s = s.replace("""            <label class="field" id="argsField">""",
"""            <div class="field" id="childField" hidden>
              <span>二级条目 <em>悬停分组时在轮盘外侧展开</em></span>
              <div class="child-list" id="childList"></div>
              <div class="child-hint">把左边列表里的条目<b>拖到这个分组上</b>即可变成二级条目</div>
            </div>

            <label class="field" id="argsField">""")
h.write_text(s, encoding="utf-8")
print("html ok")
