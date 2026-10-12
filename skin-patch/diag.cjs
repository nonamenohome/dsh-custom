const fs = require('node:fs');
const s = fs.readFileSync('D:/QYD/dsh-file/skin-patch/client.js.orig', 'utf8');

const crlf = (s.match(/\r\n/g) || []).length;
const lf = (s.match(/\n/g) || []).length;
console.log(`换行: CRLF=${crlf}  LF总数=${lf}  → ${crlf === lf ? 'CRLF 文件' : (crlf === 0 ? 'LF 文件' : '混合')}`);

const i = s.indexOf('function workspaceRowHeight');
console.log('\n=== workspaceRowHeight 原文（JSON 转义，看真实字符） ===');
console.log(JSON.stringify(s.slice(i - 10, i + 260)));

const j = s.indexOf('const WORKSPACE_ROW_HEIGHT_PROPERTY');
console.log('\n=== 常量原文 ===');
console.log(JSON.stringify(s.slice(j - 60, j + 90)));

const k = s.indexOf('properties.set(WORKSPACE_ROW_HEIGHT_PROPERTY');
console.log('\n=== 接线行原文 ===');
console.log(JSON.stringify(s.slice(k - 120, k + 130)));

const m = s.indexOf('key: "workspaceRowHeight"');
console.log('\n=== 设置项原文 ===');
console.log(JSON.stringify(s.slice(m - 60, m + 60)));
