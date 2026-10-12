# harness-custom

本目录收录对 **DeepSeek Harness** Web 界面做的定制改动，方便日后在新环境里重新应用。DeepSeek Harness 本身是一个开源项目（[deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)），这里只保存我们的增量修改，不包含上游完整源码。

## 内容

### `web-interface/` — 壁纸透明 + 页面风格
针对 Harness web 前端（`apps/web`）的界面定制：

| 文件 | 说明 |
| ---- | ---- |
| `wallpaper.css` | 把桌面壁纸作为页面背景，并让所有界面表面半透明（"透明显示"风格）；支持白天/黑夜两套配色。 |
| `wallpaper-widget.ts` | 右下角浮动的页面风格设置控件：白天/黑夜切换 + 壁纸透明度滑块。设置存于浏览器 localStorage。 |
| `main.ts.sample` | 修改后的 `apps/web/src/main.ts` 示例——把上面两个文件 import 进入口。 |

> 壁纸图片（`apps/web/public/wallpaper.jpg`）大小较大、因人而异，未收录在仓库内；把你要用的壁纸复制到 web 前端的 `public/` 下并命名为 `wallpaper.jpg` 即可让 `wallpaper.css` 的 `url('/wallpaper.jpg')` 生效。

### `liang-skin-plugin/`（目录预留）
你安装的 **dsh-client-liang-intensity-skin**（"滑动变祖"皮肤插件）安装于 Harness profile 目录：
`C:\Users\16789\.dsh\profiles\web\node_modules\dsh-client-liang-intensity-skin`

> 该插件源自第三方仓库 [kingOfSoySauce/dsh-liang-skin](https://github.com/kingOfSoySauce/dsh-liang-skin)（含人物立绘与视频素材）。是否在本仓库保留副本取决于素材的使用与分发约定，故暂未收录；需要时可通过 `dsh plugin` 重新安装。参见下方"安装"。

## 如何应用到新的 DSH 环境

1. 切入你的 DeepSeek Harness checkout：
   ```sh
   cd <你的 harness 仓库>/apps/web
   ```
2. 把 `web-interface/wallpaper.css` 与 `web-interface/wallpaper-widget.ts` 放到 `apps/web/src/`。
3. 按 `main.ts.sample` 修改 `apps/web/src/main.ts`，加入两行 import。
4. 复制壁纸为 `apps/web/public/wallpaper.jpg`。
5. 重新构建并重启：
   ```sh
   pnpm --filter @deepseek-ai/dsh-web-frontend run build
   # 重启 dsh web 后刷新浏览器
   ```

## liang-skin 皮肤插件安装

该皮肤通过 Harness 插件系统安装到 `~/.dsh/profiles/web`：
```sh
dsh plugin --profile web add 'github:kingOfSoySauce/dsh-liang-skin#v0.1.4'
# 或从 release 的 .tgz 安装
```
安装后可通过 设置 → 通用设置 → 外观皮肤 切换「滑动变祖 / 原生」。
