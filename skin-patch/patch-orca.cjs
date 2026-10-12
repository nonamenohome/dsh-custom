/**
 * 给虎鲸链路（orca-link）皮肤：
 *   1) 「代码块不透明度」设置
 *   2) 「浅色模式背景亮度」设置   ← 浅色系看深色图偏暗，需要能提亮
 *   3) 可选：对调浅色/深色模式的场景背景图
 *
 * ── 为什么不能照搬女仆皮肤 ────────────────────────────────────────────────
 * orca-link 没有 AI 消息气泡（那个白色卡片是女仆皮肤自己的设计），
 * 宿主也不给 assistant 消息画背景 → 气泡项无从做起，只做代码块。
 * 它未覆盖 --dsw-alias-markdown-code-block，代码块用宿主默认（不透明）
 * → 需要新增规则。它用 SkinAttributeProjector 设属性、没有变量投影器
 * → 直接往 documentElement 写内联自定义属性。
 *
 * ── 亮度为什么上限 200% ──────────────────────────────────────────────────
 * CSS 的 brightness() 里 100% 就是原样。上限若设 100，就只能压暗、
 * 无法提亮，与「调亮一点」的需求相反。故 0–200，默认 100。
 * 5 处浅色滤镜声明共享子串 filter:saturate(.9)contrast(.98)，
 * 一次性插入 brightness(var(--orca-light-brightness,100%))；
 * 深色系用的是 brightness(.88)saturate(.74)contrast(1.05)，不受影响。
 *
 * ── 关于 --swap-art ──────────────────────────────────────────────────────
 * 只对调图片资源，不动各自底色、蒙版、滤镜与文字色。
 * 原因：浅色主题文字是深色（--orca-ink:#11151b）、底色 #f6f1e7；
 * 深色主题文字浅、底色 #090d14。连底色蒙版一起换会深底配深字，可读性崩掉。
 *
 * 用法: node patch-orca.cjs <输出路径> [--swap-art]
 */
const fs = require('node:fs');

const SRC = 'D:/QYD/dsh-file/skin-patch/orca-client.js.orig';
const DST = process.argv[2];
const SWAP_ART = process.argv.includes('--swap-art');
if (!DST) {
  console.error('用法: node patch-orca.cjs <输出路径> [--swap-art]');
  process.exit(1);
}

const NL = '\r\n';
let s = fs.readFileSync(SRC, 'utf8');
const log = [];

function rep(from, to, expect) {
  const n = s.split(from).length - 1;
  if (n !== expect) throw new Error(`断言失败：期望 ${expect} 处，实际 ${n} 处 → ${JSON.stringify(from.slice(0, 70))}`);
  s = s.split(from).join(to);
  log.push(`替换 ${n} 处: ${JSON.stringify(from.slice(0, 56))}`);
}

// ── 1. 常量 + 辅助函数（插在 installOrcaCustomization 之前） ──────────────
const fnAnchor = 'function installOrcaCustomization(root = document.documentElement) {';
rep(
  fnAnchor,
  'const ORCA_CODE_ALPHA_PROPERTY = "--orca-code-alpha";' + NL +
  '\t\tconst ORCA_CODE_ALPHA_DEFAULT = 100;' + NL +
  '\t\tconst ORCA_LIGHT_BRIGHTNESS_PROPERTY = "--orca-light-brightness";' + NL +
  '\t\tconst ORCA_LIGHT_BRIGHTNESS_DEFAULT = 100;' + NL +
  '\t\t/** Clamp a 0-max percentage and render it as a CSS percentage token. */' + NL +
  '\t\tfunction orcaPercent(value, fallback, max) {' + NL +
  '\t\t\tif (typeof value !== "number" || !Number.isFinite(value)) return `${fallback}%`;' + NL +
  '\t\t\treturn `${Math.min(max, Math.max(0, Math.round(value)))}%`;' + NL +
  '\t\t}' + NL +
  '\t\t' + fnAnchor,
  1
);

// ── 2. state === null 时清理两个属性 ─────────────────────────────────────
const nullAnchor = [
  '\t\t\tconst apply = (state) => {',
  '\t\t\t\tif (state === null) {',
  '\t\t\t\t\tprojector.release();',
  '\t\t\t\t\treturn;',
  '\t\t\t\t}',
].join(NL);
rep(
  nullAnchor,
  [
    '\t\t\tconst apply = (state) => {',
    '\t\t\t\tif (state === null) {',
    '\t\t\t\t\tprojector.release();',
    '\t\t\t\t\troot.style.removeProperty(ORCA_CODE_ALPHA_PROPERTY);',
    '\t\t\t\t\troot.style.removeProperty(ORCA_LIGHT_BRIGHTNESS_PROPERTY);',
    '\t\t\t\t\treturn;',
    '\t\t\t\t}',
  ].join(NL),
  1
);

// ── 3. 写入两个自定义属性 ────────────────────────────────────────────────
const lastSet = 'projector.set(HEADLINE_TYPEWRITER_ATTRIBUTE, state.values.headlineTypewriter === false ? "off" : "on");';
rep(
  lastSet,
  lastSet + NL +
  '\t\t\t\troot.style.setProperty(ORCA_CODE_ALPHA_PROPERTY, orcaPercent(state.values.codeOpacity, ORCA_CODE_ALPHA_DEFAULT, 100));' + NL +
  '\t\t\t\troot.style.setProperty(ORCA_LIGHT_BRIGHTNESS_PROPERTY, orcaPercent(state.values.lightBrightness, ORCA_LIGHT_BRIGHTNESS_DEFAULT, 200));',
  1
);

// ── 4. 两个设置项：插到 sfwMode 那个对象之前 ─────────────────────────────
const keyAnchor = 'key: "sfwMode",';
const keyAt = s.indexOf(keyAnchor);
if (keyAt === -1) throw new Error('找不到 sfwMode 设置项');
const objStart = s.lastIndexOf('{', keyAt);
if (objStart === -1) throw new Error('找不到设置项起始花括号');
const entry = [
  '{',
  '\t\t\t\t\t\tkey: "codeOpacity",',
  '\t\t\t\t\t\ttype: "range",',
  '\t\t\t\t\t\tcontrol: "slider",',
  '\t\t\t\t\t\tlabel: "代码块不透明度",',
  '\t\t\t\t\t\tlabelEn: "Code block opacity",',
  '\t\t\t\t\t\tdescription: "同时影响 md 代码块、read/diff 工具结果块与终端块；100% 为原样。",',
  '\t\t\t\t\t\tdescriptionEn: "Also affects read/diff tool-result blocks and terminal blocks; 100% is the original look.",',
  '\t\t\t\t\t\tdefaultValue: ORCA_CODE_ALPHA_DEFAULT,',
  '\t\t\t\t\t\tmin: 0,',
  '\t\t\t\t\t\tmax: 100,',
  '\t\t\t\t\t\tstep: 1,',
  '\t\t\t\t\t\tunit: "%"',
  '\t\t\t\t\t},',
  '\t\t\t\t\t{',
  '\t\t\t\t\t\tkey: "lightBrightness",',
  '\t\t\t\t\t\ttype: "range",',
  '\t\t\t\t\t\tcontrol: "slider",',
  '\t\t\t\t\t\tlabel: "浅色模式背景亮度",',
  '\t\t\t\t\t\tlabelEn: "Light-mode background brightness",',
  '\t\t\t\t\t\tdescription: "只影响浅色模式的全屏背景图；100% 为原样，可上调增亮（最高 200%）。",',
  '\t\t\t\t\t\tdescriptionEn: "Only affects the full-screen background artwork in light mode; 100% is the original look, up to 200% to brighten.",',
  '\t\t\t\t\t\tdefaultValue: ORCA_LIGHT_BRIGHTNESS_DEFAULT,',
  '\t\t\t\t\t\tmin: 0,',
  '\t\t\t\t\t\tmax: 200,',
  '\t\t\t\t\t\tstep: 1,',
  '\t\t\t\t\t\tunit: "%"',
  '\t\t\t\t\t},',
  '\t\t\t\t\t',
].join(NL);
s = s.slice(0, objStart) + entry + s.slice(objStart);
log.push('插入设置项 codeOpacity + lightBrightness（插在 sfwMode 之前）');

// ── 5. 主 CSS 串末尾追加代码块规则 ───────────────────────────────────────
const cssTail = '[class$=_cardId]{color:var(--orca-muted)}';
const rule =
  'body[data-dsh-orca-link]{--orca-code-base:var(--dsw-static-neutral-bluish-50)}' +
  'body[data-dsh-orca-link][data-ds-dark-theme]{--orca-code-base:var(--dsw-static-neutral-bluish-900)}' +
  'body[data-dsh-orca-link] :is([data-read],[data-diff],[class~=md-code-block]),' +
  'body[data-dsh-orca-link] [data-terminal]{' +
  '--dsw-alias-markdown-code-block:color-mix(in srgb,var(--orca-code-base) var(--orca-code-alpha,100%),transparent)}';
rep(cssTail, cssTail + rule, 1);

// ── 6. 浅色系滤镜插入亮度变量（5 处共享同一子串） ────────────────────────
rep(
  'filter:saturate(.9)contrast(.98)',
  'filter:brightness(var(--orca-light-brightness,100%))saturate(.9)contrast(.98)',
  5
);

// ── 7.（可选）对调浅色/深色场景图 ────────────────────────────────────────
if (SWAP_ART) {
  const LIGHT_HERO = 'd5fdfd91306d2f3aaa766674d5994be4a014c4dd083d6afd7f90b4947bba6802.webp';
  const LIGHT_ACTIVE = '3605bdd7ccfcc75ca78558f2c958bb3bb35e544cc705f5c15c3653ca21a274d5.webp';
  const DARK_HERO = '5affe6ca90a22227bc020914e4b9d4dc8913a336ffc4a76e17f5b715fa2e0086.webp';
  const DARK_ACTIVE = '905f86159587cb4f168fdc78dac8ac8b53e3271d829f78878ddb0c81d0e33747.webp';

  // 先落成占位符，再回填，避免链式替换互相污染
  const plan = [
    [`const ORCA_LINK_LIGHT_HERO_ART = skinAssetUrl("${LIGHT_HERO}");`, '@@A@@', DARK_HERO],
    [`const ORCA_LINK_LIGHT_ACTIVE_ART = skinAssetUrl("${LIGHT_ACTIVE}");`, '@@B@@', DARK_ACTIVE],
    [`const ORCA_LINK_DARK_HERO_ART = skinAssetUrl("${DARK_HERO}");`, '@@C@@', LIGHT_HERO],
    [`const ORCA_LINK_DARK_ACTIVE_ART = skinAssetUrl("${DARK_ACTIVE}");`, '@@D@@', LIGHT_ACTIVE],
  ];
  for (const [line, token] of plan) rep(line, token, 1);
  for (const [line, token, url] of plan) {
    const name = line.match(/const (\w+)/)[1];
    rep(token, `const ${name} = skinAssetUrl("${url}");`, 1);
  }
  log.push('对调浅色/深色场景图（4 个资源常量）');
}

fs.writeFileSync(DST, s, 'utf8');
console.log(log.join('\n'));
console.log(`\n原始 ${fs.statSync(SRC).size} bytes → 输出 ${fs.statSync(DST).size} bytes`);
console.log('--swap-art:', SWAP_ART);
console.log('输出:', DST);
