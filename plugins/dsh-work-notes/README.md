# 工作便签（dsh-work-notes）

DeepSeek Harness 桌面端的工作便签板。点侧边栏底部的「便签」，或按 `Ctrl+Alt+N`，窗口右侧滑出一块便签板。

## 能做什么

- **随手记**：顶部输入框写一句话，`Enter` 添加，`Shift+Enter` 换行。
- **待办视图**：默认只看未完成；`全部`、`完成` 两个视图随时切换，带数量。
- **置顶**：重要的先钉在顶部。
- **勾完成**：点左侧圆圈即可勾掉，完成项自动沉底、划线。
- **换颜色**：每张便签 6 种颜色，颜色保留在数据里。
- **改内容**：双击便签文字，或点铅笔；`Enter` 保存，`Esc` 取消。
- **删除可撤销**：删掉后 8 秒内点「撤销」能找回来。
- **搜索**：按关键词过滤。
- **复制待办**：一键把未完成便签复制成文本清单，方便贴到邮件或群里。
- **清理已完成**：需要点两次确认，避免误删。

## 数据存在哪

`%USERPROFILE%\.dsh\work-notes.json`（即 `<DSH_HOME>/work-notes.json`）。

- 由 Host 侧写盘，采用「临时文件 + rename」的原子替换，重启、换端口、升级插件都不会丢。
- 浏览器 localStorage 只作缓存：Host 暂时不可用时先存本机，恢复后自动合并回写。
- 合并按每条便签的 `updatedAt` 取新，删除用墓碑记录，避免旧副本把删掉的便签复活。

## 结构

| 文件 | 作用 |
| --- | --- |
| `index.js` | Host 半：读写 `work-notes.json`，注册 `GET/PUT /api/work-notes` |
| `client.js` | 客户端半：`shell.overlay` 右侧便签板 + `sidebar.footer.action` 入口 |
| `cordis.patch.yml` | 插入 `work-notes` 这一行插件 |
| `locale/zh.json`、`locale/en.json` | 插件管理页显示的名称与描述 |
| `icon.svg` | 插件图标 |

## 卸载

在设置 → 插件里关闭或移除本 bundle；数据文件不会被自动删除，确认不要了可手动删 `work-notes.json`。
