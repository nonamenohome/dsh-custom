# 第三方插件的本地补丁

这里放的是**对装好的第三方插件做的小改动**，不是插件源码。每个脚本：

- 只做精确字符串替换，匹配数不是 1 就报错退出，不会写坏文件；
- 第一次运行会把原文件备份到脚本同级的 `backup/`；
- 插件更新/`dsh plugin update` 会覆盖 `node_modules`，**升级后要重跑一次**。

## `catalog-titlebar.mjs` — 插件库全屏页让出 Windows 标题栏

插件：`dsh-plugins-catalog`

问题：从侧边栏进入插件库后，全屏面板的「关闭」按钮正好压在 Windows 原生
最小化/最大化/关闭按钮下面，鼠标点不到，退不回会话。

改法：面板加 `padding-top: var(--dsh-windows-titlebar-height)`；全屏
（`html[data-fullscreen]`）时再清零；补 `Esc` 关闭；头部左侧加「← 返回会话」。

```powershell
node plugin-patches\catalog-titlebar.mjs
```

脚本默认改两处：`D:\QYD\dsh-file\vendor\dsh-plugins-catalog\client-parts`
（桌面版实际加载的那份）和 `~/.dsh/profiles/web/node_modules/dsh-plugins-catalog`
（web profile 那份）。

## `wallpaper-engine-disable-notice.mjs` — 去掉开机时的更新公告

插件：`dsh-plugin-wallpaper-engine`

问题：双击启动后先黑屏几秒，然后弹出一张「更新：头像导入大升级…」的大图，
之后才播开机动画。

改法：把客户端 bundle 里两个弹窗的 `eligible` 门直接置为 `false` ——
「更新公告」和紧随其后的「作者自用预设」提示都不会再出现。

```powershell
node plugin-patches\wallpaper-engine-disable-notice.mjs
```

备份在 `balance-research\wallpaper-backup\client.js`（脚本第一次运行时写入），
还原就把备份拷回
`~/.dsh/profiles/desktop/node_modules/dsh-plugin-wallpaper-engine/lib/client.js`。
