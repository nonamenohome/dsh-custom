# DSH 定制与插件

本仓库收录对 **DeepSeek Harness (DSH)** 的定制：插件补丁、技能、配置与迁移脚本。

DSH 本体是开源项目 —— [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)。
本仓库**只保存增量定制**，不含上游源码。

---

## 目录

| 目录 | 内容 |
|---|---|
| `MIGRATION.md` | **迁移到新机器的完整步骤（先看这个）** |
| `dsh-config/` | DSH 配置快照：**web + desktop 两个 profile**、家目录设置、插件清单 —— 先看 [`dsh-config/README.md`](./dsh-config/README.md) |
| `plugins/dsh-boot-animation-settings/` | 自研插件：**设置页里选开机动画** + 启动黑幕遮挡 + 动画结束回对话 |
| `plugin-patches/` | 第三方插件的本地补丁脚本：插件库标题栏、壁纸引擎启动公告 |
| `skills/` | Agent 技能：`archify` / `dws` / `find-skills` |
| `skin-patch/` | 皮肤透明度补丁全套：原版备份 + 改好的产物 + 带断言、可重复执行的补丁脚本 |
| `dsh-backup/` | 源码 CSS 深色主题定制（`deep-sea-theme.patch`） |
| `skin-analysis/` | 皮肤 CSS 逆向分析脚本与输出 |
| `dsh-liang-skin/` | 「滑动变阻器」皮肤插件（以本地 `link:` 方式安装） |
| `dshscan/` | 插件安全扫描器 |
| `harness-custom/` | Web 界面定制：壁纸透明 + 白天/黑夜配色 + 右下角浮动设置控件 |
| `dsh-rank/` | DSH 插件 star 榜单数据（Top 200） |
| `skills-research/` | 技能生态调研脚本与清单 |
| `wx-avatar/` | 透明 PNG 头像生成脚本 |
| `plugin-check/` | 插件仓库可用性核查脚本 |
| `games2.html` | — |

---

## 快速开始

1. 新机器上装好 DSH 本体（官方桌面版，当前 `0.2.1-rc.2`）
2. 照 [`dsh-config/README.md`](./dsh-config/README.md) 恢复 **desktop profile**（当前实际使用）
3. 旧版 `dsh web` 环境的恢复步骤仍见 [`MIGRATION.md`](./MIGRATION.md)
4. 第三方插件装好后，跑一遍 [`plugin-patches/`](./plugin-patches/README.md) 里的补丁脚本

---

## 两个不要动的地方

### 1. `.gitattributes` 里的 `* -text`

**不要删。** 原因：

- `dsh-backup/deep-sea-theme.patch` 一旦被转成 CRLF，`git apply` 就会失败
- `skin-patch/*.cjs` 的锚点里**内嵌了字面 CRLF**，`client.js.orig` 被转换后就永久匹配不上

### 2. `dsh-config/` 里没有凭据

`~/.dsh/.credentials.yaml` **从未被收录**（含登录凭据）。新机器上重新登录即可。

---

## 许可

- 本仓库自有脚本与文档：见 [LICENSE](./LICENSE)（如无则为作者保留）
- `skills/` 与 `harness-custom/` 下含第三方内容，各自保留原有许可 —— 见各目录内的 `LICENSE` / `NOTICE`
- 皮肤补丁针对的第三方皮肤包（`@smalltailqwq/dsh-client-ui-skin-*`）版权归原作者，本仓库只存放**补丁脚本**与改动说明，不再分发原始产物
