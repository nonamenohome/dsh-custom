# DSH 环境迁移清单

> 目标：把本仓库收录的 DSH 定制（插件、皮肤补丁、技能、配置）部署到一台新电脑。
> 仓库：`https://github.com/nonamenohome/dsh-custom` （分支 `main`）
> **内容就在仓库根目录**，clone 下来直接照下面的步骤做即可。

---

## 一、先说两个致命坑

### 坑 1：插件依赖里有绝对路径

`~/.dsh/profiles/web/package.json` 里有这一行：

```json
"dsh-client-liang-intensity-skin": "link:D:/QYD/dsh-file/dsh-liang-skin"
```

**这是写死的绝对路径。** 新电脑上工作区不在 `D:\QYD\dsh-file` 就加载不起来。

| 解法 | 做法 |
|---|---|
| **A. 保持路径一致**（推荐） | 新电脑也放在 `D:\QYD\dsh-file`，clone 后直接可用 |
| **B. 重新 link** | 放到别处，然后 `dsh plugin --profile web add <新绝对路径>/dsh-liang-skin` |

### 坑 2：`.patch` / `.orig` 不能被转换换行符

`dsh/.gitattributes` 已写入 `* -text`——**不要删它**。原因：

- `deep-sea-theme.patch` 一旦被转成 CRLF，`git apply` 就会失败
- 皮肤补丁脚本（`skin-patch/*.cjs`）的锚点里**内嵌了字面 CRLF**，`client.js.orig` 被转换后就永久匹配不上

---

## 二、必迁清单

### 1. DSH 配置（6 个文件，分两组）

**`dsh/dsh-config/profile/`** —— web profile 的活动配置

| 文件 | 说明 |
|---|---|
| `package.json` | **插件依赖清单 + bundles 顺序**——最关键的一个 |
| `cordis.patch.yml` | 皮肤启用状态、默认模型、主题偏好 |

**`dsh/dsh-config/home/`** —— `~/.dsh` 根目录的配置

| 文件 | 说明 |
|---|---|
| `cordis.patch.yml` | 家目录层补丁（优先级高于 profile 层） |
| `settings.yaml.imported` | **已归档的旧设置文件**（见下方说明） |
| `dsh-plugins-prefs.json` | 插件管理器偏好 |
| `studymate-config.yaml` | StudyMate 配置 |

> **关于 `settings.yaml`**：迁移时发现它**已被 DSH 改名为 `settings.yaml.imported`**——DSH 把设置迁移进了 profile 的 `cordis.patch.yml`，原文件留作归档。
> 所以**活动设置以 `profile/cordis.patch.yml` 为准**，`settings.yaml.imported` 只是历史参考。

### 2. 已装插件（7 个）

| 包名 | 来源 | 新机器怎么装 |
|---|---|---|
| `@liustack/modlens` | npm `^3.26.6` | `dsh plugin --profile web add @liustack/modlens` |
| `@smalltailqwq/dsh-client-ui-skin-deep-whale-manager` | npm `^0.1.6` | 同上 |
| `@smalltailqwq/dsh-client-ui-skin-maid-atelier` | npm `^0.1.7` | 同上 |
| `@smalltailqwq/dsh-client-ui-skin-orca-link` | npm `^0.1.7` | 同上 |
| `@yunmiao/studymate` | npm `^1.0.0` | 同上（**要求 DSH ≥0.1.7-alpha.1，当前 0.1.0-rc.5 会被静默跳过**） |
| `dsh-client-liang-intensity-skin` | `link:` 本地目录 | 见坑 1 |
| `dsh-plugins-catalog` | `github:Sakana-yuyu/dsh-plugins` | **无版本锁定**，装到的是当时的 main |

### 3. 技能（`dsh/skills/`）

| 技能 | 来源 |
|---|---|
| `archify` | 第三方（架构图生成） |
| `dws` | 第三方（钉钉能力集成） |
| `find-skills` | `vercel-labs/skills`（MIT） |

放到新机器的 `~/.agents/skills/<名称>/SKILL.md` 即可（DSH 扫描 rank 500，**本机已验证可用**）。

### 4. 工作区项目

| 目录 | 说明 |
|---|---|
| `dsh-liang-skin/` | 你本地的皮肤插件（被 `link:` 引用） |
| `dshscan/` | 插件安全扫描器 |
| `skin-patch/` | **皮肤补丁全套**：原版备份、改好的产物、带断言的可重复执行补丁脚本 |
| `dsh-backup/` | `deep-sea-theme.patch`（源码 CSS 深色主题定制） |
| `skin-analysis/` | 皮肤 CSS 逆向分析脚本与输出 |
| `dsh-rank/` | TOP200 插件榜单数据 |
| `skills-research/` | 技能清单与调研脚本 |
| `wx-avatar/` | 透明 PNG 生成 |
| `plugin-check/` | 插件核查脚本 |
| `harness-custom/` | **Web 界面定制**：壁纸透明 + 白天/黑夜配色 + 右下角浮动设置控件。属**源码级改动**，需手动应用到 checkout 的 `apps/web` |
| `games2.html` | — |
| `MIGRATION.md` | 本文件 |

### 5. DSH 源码 checkout

**不在仓库里**（几十万文件），新机器重新 clone：

```powershell
git clone https://github.com/deepseek-ai/deepseek-harness
cd deepseek-harness
git checkout 47f943859b        # 当前机器所在的提交
pnpm install
```

然后重新应用深色主题定制：

```powershell
git apply <仓库>\dsh\dsh-backup\deep-sea-theme.patch
```

---

## 三、**绝对不要**迁的东西

| 东西 | 原因 |
|---|---|
| `downloads/lolPing-Setup-0.5.0.exe` | **158 MB，超 GitHub 单文件 100 MB 硬限制**（推送脚本会硬拦）。第三方安装包，重新下载即可 |
| `node_modules/` | 体积巨大，`pnpm install` 重建 |
| `~/.dsh/.credentials.yaml` | **含登录凭据** |
| `~/.dsh/sessions/`、`cache/`、`attachments/`、`logs/`、`storages/` | 体积大且含隐私 |

---

## 四、嵌套 git 仓库：**不需要做任何处理**（已更正）

`dsh-liang-skin/` 和 `dshscan/` 各自是独立 git 仓库，但**推送脚本用 `robocopy /XD .git` 排除了它们的 `.git`**，文件是作为**普通文件**入库的——已验证：这两个目录的文件正常进了提交。

所以：

- ❌ **不要**为了推送去删工作区里的 `.git`（那是没必要的破坏性操作）
- ✅ 如果希望它们在新机器上仍保留独立提交历史，那是**另一件事**（`git submodule` 或单独 clone），与本次迁移无关

---

## 五、新电脑上的恢复步骤

```powershell
$H = "$env:USERPROFILE\.dsh"

# 1. 装 DSH 本体（Node 24 + pnpm，clone deepseek-harness 并 build，见其 README）

# 2. 恢复工作区（保持同样的绝对路径，见坑 1）
git clone https://github.com/nonamenohome/dsh-custom D:\QYD\dsh-file
cd D:\QYD\dsh-file

# 3. 恢复 DSH 配置
New-Item -ItemType Directory -Force "$H\profiles\web" | Out-Null
Copy-Item .\dsh-config\profile\package.json     "$H\profiles\web\package.json"     -Force
Copy-Item .\dsh-config\profile\cordis.patch.yml "$H\profiles\web\cordis.patch.yml" -Force
Copy-Item .\dsh-config\home\cordis.patch.yml    "$H\cordis.patch.yml"              -Force
Copy-Item .\dsh-config\home\dsh-plugins-prefs.json "$H\"                            -Force
Copy-Item .\dsh-config\home\studymate-config.yaml  "$H\"                            -Force
#    settings.yaml.imported 是归档件，按需复制，不是必需

# 4. 恢复技能
New-Item -ItemType Directory -Force "$env:USERPROFILE\.agents\skills" | Out-Null
Copy-Item .\skills\* "$env:USERPROFILE\.agents\skills\" -Recurse -Force

# 5. 重装插件依赖
cd D:\SQL_ABT\deepseek-harness
node --import tsx/esm apps/cli/src/bin.ts plugin --profile web install

# 6. 重新应用皮肤补丁（npm 装的是干净版本，补丁必须重打）
$W = "$H\profiles\web\node_modules\@smalltailqwq"
node D:\QYD\dsh-file\skin-patch\patch.cjs      "$W\dsh-client-ui-skin-maid-atelier\lib\client.js"
node D:\QYD\dsh-file\skin-patch\patch-orca.cjs "$W\dsh-client-ui-skin-orca-link\lib\client.js" --swap-art
```

### 如何更新本仓库

```powershell
cd D:\QYD\dsh-file        # 或任何你 clone 本仓库的位置
git add -A
git commit -m "feat: ..."
git push origin main
```

> `.gitattributes` 的 `* -text` 会阻止换行符转换，这是**故意**的（见开头「坑 2」）。

> 生成/分发本仓库内容的推送脚本留在**私有的 DYQ 仓库**里，不随本仓库分发。它做的事很简单：`robocopy` 收集文件 → 大文件闸门 → `git add/commit/push`，并额外带上 `dsh-config/` 与 `skills/`。

---

## 六、当前已知的待办（迁移前值得知道）

1. **DSH 版本偏旧**：当前 `0.1.0-rc.5`，npm 上已到 `0.2.1-alpha.2`。`@yunmiao/studymate` 因版本不足**被静默跳过**；深色皮肤同理可能未生效。上游有 tag 可切：`dsh-v0.2.0-rc.2`。
2. **两个皮肤补丁改的是 `node_modules`**：`dsh plugin update` 会覆盖，需重跑补丁脚本（脚本带断言，可重复执行）。
3. **管理器会把改过的皮肤标为「已修改」**：指纹校验包含 `lib/client.js`。不影响使用。
4. **深色/浅色模式的两张背景图是不同资源**（orca-link 共 4 张场景图 + 1 个状态图集），调透明度时两边观感可能不同，必要时可拆成两个设置值。
