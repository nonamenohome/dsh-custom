import pathlib
p = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\wheel.js")
s = p.read_text(encoding="utf-8")
# render() 里先清掉旧胶囊
s = s.replace("""  function render() {
    const total = S.items.length;""",
"""  function render() {
    clearChips();
    const total = S.items.length;""")
# 打开轮盘时清空
s = s.replace("""    S.hot = -1;
    await reload();""",
"""    S.hot = -1;
    clearChips();
    await reload();""")
p.write_text(s, encoding="utf-8")

# CSS：外环胶囊
c = pathlib.Path(r"D:\QYD\dsh-file\apps\quickpie\app\styles.css")
cs = c.read_text(encoding="utf-8")
addition = """
/* 外环：该应用的窗口胶囊 */
.wheel-chips {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.chip {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 208px;
  height: 34px;
  margin: -17px 0 0 -104px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid var(--line-2);
  background: rgba(255, 253, 248, .97);
  color: var(--ink-2);
  font-size: 11.5px;
  font-weight: 500;
  line-height: 32px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: 0 8px 20px rgba(40, 30, 16, .12);
  cursor: pointer;
  pointer-events: auto;
  transform:
    rotate(var(--a, 0deg))
    translateY(calc(var(--r, 300px) * -1))
    rotate(calc(var(--a, 0deg) * -1));
  transform-origin: 50% 50%;
  transition: transform .2s var(--ease), background .15s ease, color .15s ease;
  animation: chipIn .22s var(--ease) both;
}
.chip:hover {
  background: #fff;
  color: var(--ink);
  transform:
    rotate(var(--a, 0deg))
    translateY(calc(var(--r, 300px) * -1))
    rotate(calc(var(--a, 0deg) * -1))
    scale(1.03);
}
@keyframes chipIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
"""
cs = cs + addition
c.write_text(cs, encoding="utf-8")
print("patched")
