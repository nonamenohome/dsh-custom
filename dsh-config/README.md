# DSH 配置快照

这里存的是 `~/.dsh` 下**可迁移的配置**，按 profile 分组。凭据、会话、缓存、日志一律不在仓库里。

| 目录 | 对应线上位置 | 说明 |
|---|---|---|
| `profile/` | `~/.dsh/profiles/web/` | **旧的 web profile**，2026-10 前用 `dsh web` 时的配置，留档 |
| `profile-desktop/` | `~/.dsh/profiles/desktop/` | **当前实际使用的 desktop profile**（官方 Electron 客户端） |
| `home/` | `~/.dsh/` 根目录 | 家目录层补丁、插件管理器偏好、皮肤中心、StudyMate |

## 当前生效的是 desktop profile

官方桌面客户端读的是 `~/.dsh/profiles/desktop/`，而且 **CLI 拒绝管理它**：

```
error: profile "desktop" is managed exclusively by the Electron application
```

所以 `dsh plugin --profile desktop …` 这条命令用不了。当前这套是这么装的：

1. 把插件目录放到 `D:\QYD\dsh-file\vendor\<包名>`（或 npm 装到 profile）；
2. 在 `profile-desktop/package.json` 的 `dependencies` 里写 `link:D:/QYD/dsh-file/vendor/<包名>`；
3. 把包名加进 `dsh.profile.bundles`；
4. 在 `~\.dsh\profiles\desktop\node_modules\` 下建目录联接（junction）指向同一个目录；
5. 完全退出 DSH 再打开。

`package.json` 里的 `link:` 是**绝对路径**——新机器上仓库要放在同一个位置（`D:\QYD\dsh-file`），否则要自己改路径。

## 已装插件（桌面 profile）

| 包 | 版本/来源 | 装法 |
|---|---|---|
| `@liustack/modlens` | npm `^3.26.6` | npm |
| `@linxin666/dsh-client-ui-skin-center` | npm `^0.4.7` | npm（皮肤中心） |
| `@smalltailqwq/dsh-client-ui-skin-deep-whale-manager` | npm `^0.1.6` | npm |
| `@smalltailqwq/dsh-client-ui-skin-maid-atelier` | npm `^0.1.7` | npm |
| `@smalltailqwq/dsh-client-ui-skin-orca-link` | npm `^0.1.7` | npm |
| `@yunmiao/studymate` | npm `^1.0.0` | npm |
| `dsh-claude-style` | npm `^0.16.2` | npm（Claude 风格皮肤） |
| `dsh-plugin-wallpaper-engine` | npm `^1.3.3` | npm（壁纸引擎，已打补丁，见 `plugin-patches/`） |
| `dsh-client-liang-intensity-skin` | `link:D:/QYD/dsh-file/dsh-liang-skin` | 本仓库自带目录 |
| `dsh-plugins-catalog` | `link:D:/QYD/dsh-file/vendor/dsh-plugins-catalog` | 第三方（Sakana-yuyu/dsh-plugins），已打标题栏补丁 |
| `dsh-boot-animation-pro` | `link:…/vendor/dsh-boot-animation-pro` | 第三方（Yiheng-guo/dsh-boot-animation-pro） |
| `dsh-boot-animation-settings` | `link:…/vendor/dsh-boot-animation-settings` | **本仓库 `plugins/` 自带** |
| `dsh-plugin-smooth-stream` | `link:…/vendor/dsh-plugin-smooth-stream` | 第三方（SpookySandwich/dsh-plugin-smooth-stream） |
| `dsh-whale-girl` | `link:…/vendor/dsh-whale-girl` | 第三方（nickkkkkk123123/dsh-whale-girl） |
| `dsh-whale-widget` | `link:…/vendor/dsh-whale-widget` | 第三方（MeteorNOX），**已不在 bundles 里**，留作备选 |

第三方 `vendor/` 目录不在本仓库（体积大、版权归原作者），按上表从 GitHub 重新 clone 到 `D:\QYD\dsh-file\vendor\` 即可；本仓库只自带我们自己的 `dsh-boot-animation-settings`。

## 运行时设置

| 文件 | 内容 |
|---|---|
| `home/settings.yaml.imported` | DSH 归档的旧设置（主题、默认模型），活动值以 `profile-desktop/cordis.patch.yml` 为准 |
| `home/dsh-plugins-prefs.json` | 插件库偏好（侧栏、封面大小、自动更新） |
| `home/skin-center-active.json` | 皮肤中心当前皮肤：`whale-fantasy` |
| `home/studymate-config.yaml` | StudyMate 工作区 |
| `home/cordis.patch.yml` | 家目录层补丁（当前是空数组） |

## 片头动画（不在仓库里）

`~/.dsh/boot-animation-pro/videos/` 下是 6 段自己收集的片头（约 78 MB），**不入库**。当前选中 `片头-lxj-1.mp4`，触发规则 `startup-only`（每次启动播一次），静音起播。

重新收集：把任意 mp4 丢进该目录，在 **设置 → 开机动画** 或侧栏 🎛 里点「刷新」再选。

## 千万不要提交

`~/.dsh/.credentials.yaml`（登录凭据）、`sessions/`、`cache/`、`attachments/`、`logs/`、`storages/`。
