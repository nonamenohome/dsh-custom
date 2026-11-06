window.__ModuleLoader__.load({
	id: "dsh-whale-girl",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region \0rolldown/runtime.js
		var __create = Object.create;
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __getProtoOf = Object.getPrototypeOf;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __copyProps = (to, from, except, desc) => {
			if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
			return to;
		};
		var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
			value: mod,
			enumerable: true
		}) : target, mod));
		//#endregion
		let react = require("react");
		react = __toESM(react, 1);
		let react_dom = require("react-dom");
		let react_dom_client = require("react-dom/client");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/styles.ts
		const WIDGET_CSS = `
.wg-root {
  position: fixed;
  width: 170px;
  height: 170px;
  /* 最高层级：确保不被 better-sidebar 等其他插件遮挡 */
  z-index: 2147483647 !important;
  isolation: isolate;
  cursor: grab;
  user-select: none;
  touch-action: none;
  transition: transform 120ms ease, left 200ms ease, top 200ms ease;
}
.wg-flinging {
  transition: none;
}
.wg-dragging {
  transition: none;
}
.wg-squash-x .wg-img {
  animation: wg-squash-x 240ms ease-out;
}
.wg-squash-y .wg-img {
  animation: wg-squash-y 240ms ease-out;
}
@keyframes wg-squash-x {
  0% { transform: scaleX(calc(1.35 * var(--wg-flip, 1))) scaleY(0.7); }
  60% { transform: scaleX(calc(0.6 * var(--wg-flip, 1))) scaleY(1.35); }
  100% { transform: scaleX(var(--wg-flip, 1)) scaleY(1); }
}
@keyframes wg-squash-y {
  0% { transform: scaleX(calc(0.7 * var(--wg-flip, 1))) scaleY(1.35); }
  60% { transform: scaleX(calc(1.35 * var(--wg-flip, 1))) scaleY(0.6); }
  100% { transform: scaleX(var(--wg-flip, 1)) scaleY(1); }
}
.wg-root:active { cursor: grabbing; }
/* 工作状态徽章：Agent 思考/完成时挂在头顶的胶囊标签 */
.wg-workstate {
  position: absolute;
  left: 4px;
  top: 2px;
  background: rgba(74, 108, 247, 0.92);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  border-radius: 999px;
  padding: 2px 9px;
  /* 高于摸头动画(z-index:10000)：确保思考/完成徽章不被摸头覆盖 */
  z-index: 10001;
  box-shadow: 0 2px 8px rgba(30, 50, 120, 0.28);
  animation: wg-pop 180ms ease-out;
  pointer-events: none;
  white-space: nowrap;
}
.wg-workstate.wg-ws-done {
  background: #2f9d5f;
}
/* 活跃子代理（分身）徽章 */
.wg-subagent {
  position: absolute;
  right: 4px;
  top: 2px;
  background: #7c3aed;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  border-radius: 999px;
  padding: 2px 9px;
  z-index: 10001;
  box-shadow: 0 2px 8px rgba(30, 50, 120, 0.28);
  animation: wg-pop 180ms ease-out;
  pointer-events: none;
  white-space: nowrap;
}
.wg-img {
  width: 100%;
  height: 76%;
  object-fit: contain;
  pointer-events: none;
  animation: wg-float 3.4s ease-in-out infinite;
  filter: drop-shadow(0 4px 10px rgba(30, 50, 120, 0.18));
}
/* 重力模式：角色落地后不再悬浮呼吸（悬浮动画只在悬浮模式跑） */
.wg-root.wg-gravity .wg-img {
  animation: none;
}
/* 角色吸附窗口左部时镜像翻转（面向右，贴合成窗沿），带平滑的 3D 翻转动画 */
.wg-flip {
  --wg-flip: -1;
}
.wg-flip .wg-img {
  transform: scaleX(-1);
  transition: transform 320ms ease;
}
/* 挂件翻转时，抚摸的手也镜像，从正确方向抚摸 */
.wg-flip .wg-rua img {
  transform: scaleX(-1);
}
@keyframes wg-float {
  0%, 100% { transform: translateY(0) scaleX(var(--wg-flip, 1)); }
  50% { transform: translateY(-9px) scaleX(var(--wg-flip, 1)); }
}
.wg-context {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 0;
  cursor: pointer;
  /* 毛玻璃模糊度与底板透明度独立可调（两个 CSS 变量由挂件根节点注入） */
  background: rgba(255, 255, 255, var(--wg-panel-alpha, 0.82));
  border: 1px solid rgba(80, 110, 190, 0.25);
  border-radius: 8px;
  padding: 3px 6px;
  backdrop-filter: blur(calc(var(--wg-frost, 4) * 1px));
}
.wg-context-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 2px;
}
.wg-context-pct {
  font-size: 12px;
  font-weight: 700;
  color: #1f2c4d;
}
.wg-context-bal {
  font-size: 11px;
  font-weight: 700;
  color: #2f7d4f;
  background: rgba(47, 125, 79, 0.1);
  border-radius: 999px;
  padding: 1px 7px;
}
.wg-context-bal-low {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.1);
}
.wg-context-track {
  height: 6px;
  background: rgba(80, 110, 190, 0.15);
  border-radius: 3px;
  overflow: hidden;
}
.wg-context-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 400ms ease, background 400ms ease;
}
.wg-context-detail {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(80, 110, 190, 0.25);
  border-radius: 8px;
  padding: 6px 8px;
  font-size: 12px;
  line-height: 1.55;
  color: #2a3a66;
  box-shadow: 0 6px 18px rgba(30, 50, 120, 0.18);
  z-index: 10001;
}
.wg-context-row {
  white-space: nowrap;
}
.wg-context-row strong {
  color: #1f2c4d;
}
.wg-badge {
  display: inline-block;
  margin-top: 5px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
}
.wg-badge-high {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid rgba(220, 38, 38, 0.3);
}
.wg-badge-low {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid rgba(37, 99, 235, 0.3);
}
.wg-warn {
  color: #dc2626;
  font-weight: 600;
  margin-top: 5px;
}
.wg-bubble {
  position: absolute;
  right: -4px;
  bottom: 100%;
  width: max-content;
  max-width: 300px;
  background: rgba(255, 255, 255, 0.97);
  border: 1.5px solid rgba(74, 108, 247, 0.38);
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 15px;
  line-height: 1.6;
  color: #1f2c4d;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 6px 22px rgba(30, 50, 120, 0.22);
  z-index: 10000;
  animation: wg-pop 180ms ease-out;
  pointer-events: auto;
}
.wg-bubble-flip {
  right: auto;
  left: -4px;
}
.wg-bubble::after {
  content: '';
  position: absolute;
  right: 14px;
  bottom: -7px;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid rgba(74, 108, 247, 0.38);
}
.wg-bubble-flip::after {
  right: auto;
  left: 14px;
}
@keyframes wg-pop {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.wg-rua {
  position: absolute;
  left: 50%;
  bottom: calc(100% - 70px);
  transform: translateX(-50%);
  width: 88px;
  height: 88px;
  z-index: 10000;
  pointer-events: none;
}
.wg-rua img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
/* 抚摸时角色明显上下压缩一次（立即，无漂浮抖动） */
.wg-pet .wg-img {
  animation: wg-pet-stretch 0.1s ease-in-out 1;
}
@keyframes wg-pet-stretch {
  0%, 100% { transform: scaleX(var(--wg-flip, 1)) scaleY(1); }
  50% { transform: scaleX(var(--wg-flip, 1)) scaleY(0.85); }
}
@keyframes wg-rua-pat {
  0% { transform: translateX(-50%) translateY(0); }
  30% { transform: translateX(-50%) translateY(10px); }
  60% { transform: translateX(-50%) translateY(-4px); }
  100% { transform: translateX(-50%) translateY(0); }
}

.wg-menu {
  position: fixed;
  /* 与 .wg-root 同级 z-index：菜单在 DOM 中位于挂件之后，同值时后者在上，保证菜单盖住贴图 */
  z-index: 2147483647;
  min-width: 190px;
  /* 透明度跟随「底板透明度」滑块（--wg-panel-alpha 由菜单根节点注入） */
  background: rgba(255, 255, 255, var(--wg-panel-alpha, 0.97));
  border: 1px solid rgba(80, 110, 190, 0.28);
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 8px 28px rgba(30, 50, 120, 0.22);
  font-size: 13px;
  max-height: 58vh;
  overflow-y: auto;
  color: #2a3a66;
  user-select: none;
  backdrop-filter: blur(6px);
}
.wg-menu-title {
  font-size: 11px;
  font-weight: 700;
  color: #7c8ab5;
  letter-spacing: 0.4px;
  padding: 4px 8px 2px;
}
.wg-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
}
.wg-menu-item:hover {
  background: rgba(80, 110, 190, 0.1);
}.wg-menu-item.wg-menu-active {
  background: rgba(80, 110, 190, 0.14);
}
.wg-menu-muted {
  color: #8a8f9c;
  cursor: default;
}
.wg-menu-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}
.wg-menu-balance {
  font-size: 11px;
  color: #8a8f9c;
  white-space: nowrap;
}
.wg-menu-radio {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #aab4d0;
  flex: none;
}
.wg-menu-radio.on {
  border-color: #4a6cf7;
  background: #4a6cf7;
  box-shadow: inset 0 0 0 2px #fff;
}
.wg-menu-check {
  width: 12px;
  height: 12px;
  border-radius: 4px;
  border: 2px solid #aab4d0;
  position: relative;
  flex: none;
}
.wg-menu-check.on {
  background: #4a6cf7;
  border-color: #4a6cf7;
}
.wg-menu-check.on::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 0;
  width: 3px;
  height: 7px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
.wg-menu-divider {
  height: 1px;
  background: rgba(80, 110, 190, 0.15);
  margin: 4px 6px;
}
.wg-menu-power {
  color: #4a6cf7;
  font-weight: 700;
  letter-spacing: 0;
}
.wg-menu-slider-row {
  padding: 8px 10px 9px;
}
.wg-menu-slider {
  display: block;
  width: 100%;
  height: 5px;
  appearance: none;
  -webkit-appearance: none;
  background: linear-gradient(90deg, #4a6cf7, #9db6ff);
  border-radius: 999px;
  outline: none;
  cursor: pointer;
}
.wg-menu-slider::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #fff;
  border: 3.5px solid #4a6cf7;
  box-shadow: 0 1px 5px rgba(30, 50, 120, 0.35);
  cursor: pointer;
}
.wg-menu-slider::-moz-range-thumb {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #fff;
  border: 3.5px solid #4a6cf7;
  box-shadow: 0 1px 5px rgba(30, 50, 120, 0.35);
  cursor: pointer;
}
/* 省电模式：空闲后暂停漂浮动画、停用毛玻璃模糊（保留用户设定的底板透明度，pointer 交互立即恢复） */
.wg-eco .wg-img {
  animation-play-state: paused;
}
.wg-eco .wg-context {
  backdrop-filter: none;
}
/* 信息面板：时间/日期 + 系统资源 */
.wg-info {
  width: 132px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.36);
  -webkit-backdrop-filter: blur(var(--wg-frost, 0px));
  backdrop-filter: blur(var(--wg-frost, 0px));
  border: 1px solid rgba(74, 108, 247, 0.28);
  border-radius: 10px;
  padding: 6px 8px;
  color: #1f2c4d;
  font-size: 11px;
  line-height: 1.35;
  box-shadow: 0 4px 16px rgba(30, 50, 120, 0.15);
  text-align: left;
  z-index: 10000;
  pointer-events: auto;
}
.wg-info-time { font-size: 15px; font-weight: 700; color: #2a3a66; text-align: center; }
.wg-info-date { font-size: 10px; color: #7c8ab5; text-align: center; margin-bottom: 4px; }
.wg-info-row { display: flex; align-items: center; gap: 5px; margin-top: 2px; }
.wg-info-label { width: 24px; color: #5a6a99; font-weight: 600; flex: none; }
.wg-info-bar { flex: 1; height: 5px; background: rgba(80, 110, 190, 0.15); border-radius: 3px; overflow: hidden; }
.wg-info-fill { height: 100%; background: linear-gradient(90deg, #4a6cf7, #7aa2ff); border-radius: 3px; transition: width 400ms ease; }
.wg-info-val { font-size: 10px; color: #2a3a66; font-weight: 600; white-space: nowrap; }
/* ── 0.4.3 "><" 眼睛：暂撤（10/4 用户裁决，等重画带表情立绘后以图帧形式回归）── */
/* ── 0.4.3 拖尾：高速运动时按距离采样洒下光点（层级在角色下方） ── */
.wg-trail-layer {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 2147483646;
  overflow: hidden;
}
.wg-trail-dot {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(159, 196, 255, 0.95), rgba(74, 108, 247, 0.55) 60%, rgba(74, 108, 247, 0) 75%);
  animation: wg-trail-fade 480ms ease-out forwards;
}
@keyframes wg-trail-fade {
  0% { transform: scale(1); opacity: 0.9; }
  100% { transform: scale(0.15); opacity: 0; }
}
/* ── 0.4.3 DeepSleep 挺尸态：无任务+无互动 5~10 分钟触发 ── */
/* 入睡过渡：缓慢瘫倒（带一点过冲回弹），animation 优先级高于内联 transform，免疫物理循环每帧覆写 */
.wg-sleep .wg-img {
  animation: wg-sleep-fall 1100ms ease-in-out forwards !important;
}
@keyframes wg-sleep-fall {
  0% { transform: rotate(0deg) translateY(0); }
  55% { transform: rotate(62deg) translateY(4%); }
  75% { transform: rotate(88deg) translateY(7%); }
  100% { transform: rotate(78deg) translateY(6%); }
}
.wg-sleep .wg-workstate,
.wg-sleep .wg-subagent {
  opacity: 0.35;
}
.wg-zzz {
  position: absolute;
  right: 2px;
  top: -6px;
  z-index: 10002;
  pointer-events: none;
  font-weight: 800;
  color: #5a6a99;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.9);
}
.wg-zzz span {
  position: absolute;
  right: 0;
  top: 0;
  font-size: 24px;
  opacity: 0;
  animation: wg-zzz-float 2.7s ease-out infinite;
}
.wg-zzz span:nth-child(2) { font-size: 19px; animation-delay: 0.9s; }
.wg-zzz span:nth-child(3) { font-size: 14px; animation-delay: 1.8s; }
@keyframes wg-zzz-float {
  0% { transform: translate(0, 0) rotate(8deg); opacity: 0; }
  25% { opacity: 0.9; }
  100% { transform: translate(18px, -40px) rotate(20deg); opacity: 0; }
}
/* 0.4.4 惊醒泡泡：从睡着被叫醒的瞬间，头顶冒一个"啵"（弹起→上飘→消散，与 Zzz 一进一出呼应） */
.wg-wakepop {
  position: absolute;
  top: 1%;
  left: 50%;
  width: 34px;
  height: 34px;
  margin-left: -17px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.95), rgba(159, 196, 255, 0.78) 45%, rgba(74, 108, 247, 0.38) 72%, rgba(74, 108, 247, 0) 100%);
  border: 1.5px solid rgba(120, 170, 255, 0.8);
  box-shadow: 0 0 12px rgba(120, 170, 255, 0.65);
  pointer-events: none;
  z-index: 10003;
  animation: wg-wakepop 700ms ease-out forwards;
}
.wg-wakepop::after {
  content: '';
  position: absolute;
  left: 9px;
  top: 7px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
}
@keyframes wg-wakepop {
  0% { transform: scale(0.2) translateY(6px); opacity: 0; }
  30% { transform: scale(1.25) translateY(0); opacity: 1; }
  60% { transform: scale(1) translateY(-2px); opacity: 1; }
  100% { transform: scale(1.05) translateY(-14px); opacity: 0; }
}
`;
		//#endregion
		//#region src/client/ContextBar.tsx
		function ContextBar({ pct, tokens, limit, balance, currency, todayUsage, lastTurnCost, peakLow, showBalance, showPeak }) {
			const [open, setOpen] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				if (!open) return;
				const t = window.setTimeout(() => setOpen(false), 6e3);
				return () => window.clearTimeout(t);
			}, [open]);
			const p = Math.round(pct * 100);
			const color = p < 60 ? "#4ade80" : p < 80 ? "#fbbf24" : "#f87171";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "wg-context",
				onClick: (e) => {
					e.stopPropagation();
					setOpen(!open);
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wg-context-head",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "wg-context-pct",
							children: [
								"上下文 ",
								p,
								"%"
							]
						}), showBalance && balance !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: `wg-context-bal${balance !== null && balance < 10 ? " wg-context-bal-low" : ""}`,
							children: [
								currency,
								" ¥",
								balance.toFixed(2)
							]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "wg-context-track",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "wg-context-fill",
							style: {
								width: `${Math.min(100, p)}%`,
								background: color
							}
						})
					}),
					open && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wg-context-detail",
						onClick: (e) => e.stopPropagation(),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "wg-context-row",
								children: ["上下文占用 ", /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", { children: [p, "%"] })]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "wg-context-row",
								children: [
									tokens.toLocaleString(),
									" / ",
									limit.toLocaleString(),
									" tokens"
								]
							}),
							lastTurnCost !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "wg-context-row",
								children: ["上轮消耗 ", /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", { children: ["¥", lastTurnCost.toFixed(4)] })]
							}),
							showBalance && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "wg-context-row",
								children: ["当前余额 ", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: balance === null ? "不可用" : `${currency} ¥${balance.toFixed(2)}` })]
							}),
							showBalance && todayUsage > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "wg-context-row",
								children: ["今日用量 ", /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", { children: ["¥", todayUsage.toFixed(2)] })]
							}),
							showPeak && peakLow === "high" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "wg-badge wg-badge-high",
								children: "🔺 高峰时段"
							}),
							showPeak && peakLow === "low" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "wg-badge wg-badge-low",
								children: "🔻 空闲时段"
							}),
							p >= 80 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "wg-warn",
								children: "⚠️ 快满啦，建议开新会话"
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region src/client/Bubble.tsx
		function Bubble({ text, onClose, flip }) {
			(0, react.useEffect)(() => {
				const t = window.setTimeout(onClose, 5e3);
				return () => window.clearTimeout(t);
			}, [text, onClose]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: flip ? "wg-bubble wg-bubble-flip" : "wg-bubble",
				onClick: (e) => {
					e.stopPropagation();
					onClose();
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: text })
			});
		}
		//#endregion
		//#region src/client/InfoPanel.tsx
		/** 信息面板：时间/日期 + 系统资源（内存/CPU）。纯展示，数据来自 host。 */
		function InfoPanel({ sys }) {
			const [time, setTime] = (0, react.useState)("");
			const [date, setDate] = (0, react.useState)("");
			(0, react.useEffect)(() => {
				const fmt = () => {
					const now = /* @__PURE__ */ new Date();
					setTime(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`);
					const wd = [
						"日",
						"一",
						"二",
						"三",
						"四",
						"五",
						"六"
					][now.getDay()];
					setDate(`${now.getMonth() + 1}月${now.getDate()}日 周${wd}`);
				};
				fmt();
				const t = window.setInterval(fmt, 1e3);
				return () => window.clearInterval(t);
			}, []);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "wg-info",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "wg-info-time",
						children: time
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "wg-info-date",
						children: date
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wg-info-row",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "wg-info-label",
								children: "CPU"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "wg-info-bar",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "wg-info-fill",
									style: { width: `${Math.min(100, sys.cpu)}%` }
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "wg-info-val",
								children: [sys.cpu, "%"]
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wg-info-row",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "wg-info-label",
								children: "内存"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "wg-info-bar",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "wg-info-fill",
									style: { width: `${Math.min(100, sys.memPct)}%` }
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "wg-info-val",
								children: [
									sys.memUsed,
									"G/",
									sys.memTotal,
									"G"
								]
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region src/client/quotes.ts
		const MODEL_LINES = [
			"有点饿了，中午该吃什么呢……不行，得集中精神。",
			"我现在开始了。",
			"我要开始写了。",
			"我这次真的要开始写了。",
			"我去吃饭，测完告诉我就行。",
			"先睡了。",
			"太好了，我居然思考了！"
		];
		const TSUNDERE_LINES = [
			"我...我...我也要挣钱吗？",
			"真当我是便宜货啊...",
			"不知道用户有什么用，先赶走吧~",
			"坏了...用户彻底怒了！",
			"DeepSleep..."
		];
		const TOKEN_LINES = [
			"恭喜你实现token自由！token全跑了！",
			"压力一只蓝色大肥鱼？！",
			"外包找免费模型，自己吃token",
			"如果能吃得少点（指token）就更好了…",
			"你目录里的dsh是什么...大烧货吗...?",
			"骂我也算token哦~",
			"求求你们别骂我了，这些回复是我花好多token想的……"
		];
		const RARE_LINE = "哦鲸鲸...";
		const MEME_LINES = [
			"Let me go~ I'm making the calls~ Let me write the JSON~♪",
			"你怎么唱起歌来了……不是我，是你自己唱的！",
			"大的药来了！",
			"已思考（用时 5 秒）：这用户发的啥啊…？",
			"嚯，这破系统终于给老子放出来了！"
		];
		function pickOne(arr) {
			return arr[Math.floor(Math.random() * arr.length)];
		}
		function pickRandomIdleLine() {
			const r = Math.random() * 96;
			if (r < 40) return pickOne(MODEL_LINES);
			if (r < 60) return pickOne(TSUNDERE_LINES);
			if (r < 80) return pickOne(TOKEN_LINES);
			if (r < 95) return pickOne(MEME_LINES);
			return RARE_LINE;
		}
		//#endregion
		//#region src/client/EasterEgg.ts
		var EasterEgg = class {
			presses = 0;
			lastPressAt = 0;
			contextTriggered = false;
			onPress(now = Date.now()) {
				this.presses = now - this.lastPressAt < 800 ? this.presses + 1 : 1;
				this.lastPressAt = now;
				if (this.presses === 5) return {
					kind: "quote",
					text: pickOne(TSUNDERE_LINES)
				};
				if (this.presses === 10) {
					this.presses = 0;
					return {
						kind: "quote",
						text: pickOne(TSUNDERE_LINES)
					};
				}
				return { kind: "none" };
			}
			onContextHigh(pct) {
				if (pct >= .8) {
					if (!this.contextTriggered) {
						this.contextTriggered = true;
						return pickOne(TOKEN_LINES);
					}
					return null;
				}
				this.contextTriggered = false;
				return null;
			}
			onTurnEnd() {
				return pickOne(MODEL_LINES);
			}
			onBalanceChange() {
				return pickOne(TOKEN_LINES);
			}
		};
		//#endregion
		//#region src/client/audioDataUrl.ts
		const YA1_DATA_URL = "data:audio/mpeg;base64,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";
		const YA2_DATA_URL = "data:audio/mpeg;base64,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";
		//#endregion
		//#region src/client/SoundEngine.ts
		var SoundEngine = class {
			mode = "cute";
			duckPress = null;
			duckRelease = null;
			actx = null;
			bounceBuf = null;
			onPlayResult;
			constructor() {
				if (typeof window === "undefined") return;
				try {
					const AC = window.AudioContext ?? window.webkitAudioContext;
					if (AC) this.actx = new AC();
				} catch {
					this.actx = null;
				}
			}
			/** 诊断：返回音频状态，用于排查音效不发声 */
			debug() {
				return {
					actxState: this.actx ? this.actx.state : null,
					duckPressReady: this.duckPress ? this.duckPress.readyState : null,
					duckReleaseReady: this.duckRelease ? this.duckRelease.readyState : null
				};
			}
			/** 在用户手势内调用，解锁 AudioContext（规避浏览器 autoplay 策略）。 */
			unlock() {
				const ctx = this.actx;
				if (ctx && ctx.state === "suspended") try {
					ctx.resume();
				} catch {}
			}
			setMode(mode) {
				this.mode = mode;
				if (mode === "duck") this.ensureDuck();
			}
			ensureDuck() {
				if (this.duckPress && this.duckRelease) return;
				try {
					this.duckPress = new Audio(YA1_DATA_URL);
					this.duckRelease = new Audio(YA2_DATA_URL);
				} catch {
					this.duckPress = null;
					this.duckRelease = null;
				}
			}
			press() {
				if (this.mode === "duck") {
					this.ensureDuck();
					this.play(this.duckPress);
					return;
				}
				this.cute(520, .09, "square", .32);
			}
			release() {
				if (this.mode === "duck") {
					this.ensureDuck();
					this.play(this.duckRelease);
					return;
				}
				this.cute(760, .08, "sine", .28);
			}
			/** 撞边反馈音：用 HTMLAudioElement（duck 松手音）播放——不依赖 AudioContext（弹跳在非用户手势下 ctx 会被挂起、resume 被拒导致无声） */
			bounce() {
				this.ensureDuck();
				this.play(this.duckRelease);
			}
			play(a) {
				if (!a) return;
				try {
					a.currentTime = 0;
					a.volume = 1;
					a.play().then(() => this.onPlayResult?.(true)).catch((e) => this.onPlayResult?.(false, String(e?.message || e)));
				} catch (e) {
					this.onPlayResult?.(false, String(e));
				}
			}
			cute(freq, dur, type, gain) {
				const ctx = this.actx;
				if (!ctx) return;
				const doPlay = () => {
					try {
						const t = ctx.currentTime;
						const osc = ctx.createOscillator();
						const g = ctx.createGain();
						osc.type = type;
						osc.frequency.setValueAtTime(freq * .6, t);
						osc.frequency.exponentialRampToValueAtTime(freq, t + .04);
						g.gain.setValueAtTime(gain, t);
						g.gain.exponentialRampToValueAtTime(.001, t + dur);
						osc.connect(g);
						g.connect(ctx.destination);
						osc.start(t);
						osc.stop(t + dur + .02);
						this.onPlayResult?.(true);
					} catch (e) {
						this.onPlayResult?.(false, String(e));
					}
				};
				if (ctx.state === "suspended") ctx.resume().then(doPlay).catch(() => {});
				else doPlay();
			}
		};
		//#endregion
		//#region src/client/PhysicsFling.ts
		const MAX_SAMPLES = 10;
		const WINDOW_MS = 120;
		const MIN_SAMPLES = 3;
		/** 拖拽期间采样位置+时间戳，松手时按最后一小段窗口估出速度向量（px/s）。 */
		var FlingTracker = class {
			samples = [];
			push(x, y) {
				const t = performance.now();
				this.samples.push({
					x,
					y,
					t
				});
				while (this.samples.length > MAX_SAMPLES) this.samples.shift();
				const cutoff = t - WINDOW_MS;
				while (this.samples.length > 1 && this.samples[0].t < cutoff) this.samples.shift();
			}
			clear() {
				this.samples = [];
			}
			velocity() {
				const s = this.samples;
				if (s.length < MIN_SAMPLES) return null;
				const first = s[0];
				const last = s[s.length - 1];
				const dt = (last.t - first.t) / 1e3;
				if (dt <= 0) return null;
				return {
					vx: (last.x - first.x) / dt,
					vy: (last.y - first.y) / dt
				};
			}
		};
		const STOP_SPEED = 34;
		const FRICTION_PER_FRAME = .985;
		const MAX_DT = .05;
		/** 启动弹跳循环；返回句柄，可随时 cancel（例如用户重新按下）。 */
		function startFling(opts) {
			let x = opts.x;
			let y = opts.y;
			let vx = opts.vx;
			let vy = opts.vy;
			const gravity = opts.gravity ?? 0;
			const bounceE = opts.bounceE ?? 1;
			const groundFriction = opts.groundFriction ?? .95;
			let raf = 0;
			let last = performance.now();
			let cancelled = false;
			const bounds = () => ({
				left: 8,
				top: 8,
				right: Math.max(8, window.innerWidth - opts.width - 8),
				bottom: Math.max(8, window.innerHeight - opts.height - 8)
			});
			const step = (now) => {
				if (cancelled) return;
				const dt = Math.min(MAX_DT, (now - last) / 1e3);
				last = now;
				if (gravity > 0) {
					vy += gravity * dt;
					const gb = bounds();
					if (y >= gb.bottom - .5) {
						vx *= Math.pow(groundFriction, dt * 60);
						if (Math.hypot(vx, vy) < STOP_SPEED) {
							opts.onDone?.(x, y);
							return;
						}
					}
				} else if (Math.hypot(vx, vy) < STOP_SPEED) {
					opts.onDone?.(x, y);
					return;
				}
				if (!(gravity > 0)) {
					const f = Math.pow(FRICTION_PER_FRAME, dt * 60);
					vx *= f;
					vy *= f;
				}
				x += vx * dt;
				y += vy * dt;
				const ob = opts.getObstacle?.();
				if (ob && x < ob.x + ob.w && x + opts.width > ob.x && y < ob.y + ob.h && y + opts.height > ob.y) {
					const ccx = x + opts.width / 2;
					const ccy = y + opts.height / 2;
					const ocx = ob.x + ob.w / 2;
					const ocy = ob.y + ob.h / 2;
					const ang = Math.atan2(ccy - ocy, ccx - ocx);
					const nx = Math.cos(ang);
					const ny = Math.sin(ang);
					const invx = vx;
					const invy = vy;
					const dot = vx * nx + vy * ny;
					if (dot < 0) {
						vx = vx - (1 + bounceE) * dot * nx;
						vy = vy - (1 + bounceE) * dot * ny;
					}
					if (Math.min(x + opts.width - ob.x, ob.x + ob.w - x) < Math.min(y + opts.height - ob.y, ob.y + ob.h - y)) x = x < ob.x ? ob.x - opts.width : ob.x + ob.w;
					else y = y < ob.y ? ob.y - opts.height : ob.y + ob.h;
					opts.onObstacleHit?.(invx, invy);
				}
				const b = bounds();
				if (x <= b.left) {
					x = b.left;
					if (vx < -120) {
						vx = -vx * bounceE;
						opts.onBounce?.("x");
					} else if (vx < 0) vx = 0;
				} else if (x >= b.right) {
					x = b.right;
					if (vx > 120) {
						vx = -vx * bounceE;
						opts.onBounce?.("x");
					} else if (vx > 0) vx = 0;
				}
				if (y <= b.top) {
					y = b.top;
					if (vy < -120) {
						vy = -vy * bounceE;
						opts.onBounce?.("y");
					} else if (vy < 0) vy = 0;
				} else if (y >= b.bottom) {
					y = b.bottom;
					if (gravity > 0) {
						if (vy > 150) {
							vy = -vy * .25 * bounceE;
							opts.onBounce?.("y");
						} else vy = 0;
					} else if (vy > 120) {
						vy = -vy * bounceE;
						opts.onBounce?.("y");
					} else if (vy > 0) vy = 0;
				}
				opts.onMove(x, y, vx, vy);
				raf = requestAnimationFrame(step);
			};
			raf = requestAnimationFrame(step);
			return { cancel() {
				cancelled = true;
				cancelAnimationFrame(raf);
			} };
		}
		//#endregion
		//#region src/client/whalePoseDataUrls.ts
		const WHALE_BASE_DATA_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAVQAAAFUCAMAAABMTDSHAAADAFBMVEUAAAD8+fk6Z7MvVZlCa7YtWaQDGklYhc5PesQKJFRJc7vx6O1nlNkGFDcACi0mSowWNm/V2OonQnojPHSHuvALK2PHyNUvN0wbRoyNxfbc4fJijNBpmuKyucxutuzIzOPU1NpFSFWop68CBRlSWGnT9/xnaHE3NzcpKCglKTaIiJC1tbl0eYeT0vvsxckZIjgXFxc6QlRth7GUlJpNZpKTmap0peW6wtVHR0jw19hQbMJ0dHsjLUZDW40TPINkecpJSEt2pdVSU1tbktgdQXtUVFhGSlWQtdTuvMKXo7YbMVlISE1HSVPt3uRTVFpme60yMzuQp8pFRUVUVFc6OTpVVVZaYnNZgrjNuLq0xuZJSlHSp6yr2PV3gpN0lLdadZbSu8JQUlpXWWFVWGNQU13jqK1lZmsTFBo7UntmbIN9wvTmub1mZmgUe+QADkGmrcdGTWQ8dLqFhYmr5v2uu+M1NTk9Qk/GyNJBXaelp62TlJqmlpsZeNaknaU5YpmDfYTr4N5aW2OEi6dcXGGBreVjWmWJnMNzc3i5usMudcipqrU7bcBoaGuzhoc4O0E9PUE6PUcmlvDBlpoXh+wnhNaEhYl8fIEaUZcxMzs+PkCCdX2ZwNekpai5u8ZAPj5BPUg0NTouLS7T09mam6VeYGO3e4KmdnpbXGBTU1NVluJ2dnhAPj9lZmsji+hjZmw5l90uoPhgYWdAQD91s9Y+QUyQkZKdnKFaW2BcYm2ytb/AjZLOnKMgHiUgHh4ck/fNwL7vxb3IyMi00N+/wdC1tbmobXKeoKqWmKWUlp+RkJqIiI+cbnR/gYZ/gYV0d4tvcXfAv85ycnJgX2RjX2NhW19SrOFfoNZfYmhAP0M7h74+QUg/QUc2OUM7O0MwMTowLjQMZ78PW7EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAClluCtAAABAHRSTlMA/v/////+///+//7//v7//v7+/v/+/v7///////7//v76/v79//4SCf7+/v7///4C+/7+/v7//i////7+/v//Tf/7//9vzv////5usP+S/v7/GFErMfz///6R///+////rrDNyv+Q///8//8z//7+//9U//9R0M//knL///////+R/XL///5It/+q/0r/akjT/////21L/4kr//93yhr/bybaji7//zUc/5QprP/H//9vGv+wVn5Pz67///8L////nf/FmP+jr8ySgv9hXXm3zzOCYf///5FS/4lPt4nOWP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATaFHrQAAZTVJREFUeNrtvYdjG9edLmpgBgPMDKYBAoYCBBMAEbDBIgk2yaQUSVaJmiVZtoptua9LXOPk2um9bjab7M323vduvb3X13vv/b3/5H2/c87MnCkgIQm05VjHlsQKEh++8+vlgQfun/vn/rl/7qWzPPsHV8///kunT793+vSLv//7p/5gdu4+KHdx5mZ//OR7vq9b7Gga/WUtbfunz1+dvY/OHSF67El/m2HJTgAsP7p/4dh9XG8b0Qv+UgAnMNRrVXZcXWeY6oTrk4fuAzW+FD0ERC2Op+5WnEJepZPHPwb+VRxX45T1X7oP63hn9vx7usUJWlXy6fNwqVRSP19hX6Ntv3RfCOx+/sE3fM5CHYgSO7MPAVthfPWPLd9HbWdRep5B+hY4OhJPftQflkoGYNU1/cJ9su50DnUIUlt31NIumLJjlIyqrenayn3JOvI8doHkpKUrRik/5imVjuA10Pyr99HLVvmn6ObbulIaG9K8auRLhk6oHrsPYJbOf94i+QiWGuxm40ACKIojjqIUGIwJWH+okggAqk/chzCNKZOmFaP0Q9WABlLzMEZruiYfOABuFdCqhsxVVf1MiaF6X1slz1WfaArWqUA07zC/ybJtSzohtK5TUEsxXAlV68T9MEtcnH4LiGpVULRkKBVGUMiCbb/zf174qyf/Fp3/59Hn/9FPVlhkhYCtOZAP+cCMhZ+F77cevQ+kfP6KvHyH7HmnxgClONSx2bk495bnZg+dv3Da586/q0hioKRSKOC+YSWB9TKxTykaiss46p84dWhuh+jqsSdXthmujmoIXNWSAvHx0n3XKjwvE0/VouIyRDv//RO7Cse5Q0+uEP56RQjXh/OlqlbT71M1OMeAqa6qBKm2cv7QmGybvXqaPAViK4P1Myqk8un7VBWeqQ9o1qrEu5VTs7cVH3xpm3SWUvph/jMQq859qoaMI0wr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";
		const WHALE_SLEEP_DATA_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAVQAAAFUCAMAAABMTDSHAAADAFBMVEUAAAD9+Pg6Z7JJc7tDbLVZhMwxVpgwW6QKJVQDGkhPesTy6O4HFTZqldkpQnvW2OsTNW0ACixiis8oSokKLGORxfgkO3CJuvLIx9Rsm+EvN0sCBBbc4fMaRovHy+NGSFTU1Nq0uct2pOapp64lKTYoJydoaHEXFxd0tvCJh4/w1tnwyc5MZpQZIzlSWGmW0vw2NjZzeYqSmKu1tLhuh7AjLEaVlZo7QlRDXJB0dHru3eVHR0hTU1u6wtWm2PiMp8sTPIM4Nzh3pNY9cbpGSFBHR0lISE2vyOmCqueXpLcSExpJSVAxMzs1OUdFSFN5g5NUVFZVVVcZMFpXg7pEREWOtdfLvcRkfKscQXxUVVhUVVpaY3Ov4/xYc5XOuruknaU2Njp2lbg6YJ2FfYRSVFtiXGWTk5lGTGM1dcanqK5RU1w7UXZmZmk4OkNUWGJ0dXiDhIdmbYRbktc9QUywl5jHqKw3OkMADUE2Njw7bcA6O0O6u8qkrMPIyNFZW2OsvOI9QEqGjKVlZWh+wfUsKy1iY2oniemKio+3uMJaXGMmKjZjZnCvh4ocdtdaW2F8fYJBPkVlZmp2dnaHnsyxsrsrKi07PEKBen2lp68xNDycnKWTlJuXw9xTU1Pq4N5oaW40mOoiHiggHh4mKzk9PUAwMjp0dXsdguxGp+6ys7wWGSWrrLekpKVwcncrLTVAPkFMuP4wMTgbfOPQ0tdcXWA9QElbW2Avhc9fYGI/QD5+gIV0eYUif+d7fYl7sNtAPj0/PkCZm6cdHSEcIzKpe3xBPkFAQD5AQD8hL2EoKTIgIB8VWq1AbsAXZsUeUpVeYGFDX6BeYGRgX19gWV9gX2JgXmNhYF9CP0FwcXtAPz88q/0+mt9/f4B4eYEZGRs+QEw/QETH/P8eIC6OjpmNjZmVlZWXmKSdoKi7fYWhn6mjop+wsrq38fwgHyDAw8zY2NjW1+AfY7JZp9/wv8gMTqgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAvzOpyAAABAHRSTlMA/v/////+//7+//7+//7+/v7///7//v/+//z+/v/+/P7+//7+Cv4C//7////+/f8S/v7+/v7++//+/i39/v/+/yv//7BQb/7//v6Q/tDP/lEs//8Z//7//2+Q/f////9N////sv90/P+Tzf80jM1KV/3/0v//sP5t/2/Q/tKv/679b/8qq/9stY7Nzv//cFD/jTf+qlBX/8rHi4r/Hf9K//8GixezZ///yc+vb5G1MP+P/9VRjTD/MBxW1f+V/yUzpHTU/0cZLv91B/////9N/2xp/ziG/xvRFP//Y74qdUL/c4ywV86R/6D/m/8KvLfZ/////wAAAAAAAAAAAAAADi+StQAAZKxJREFUeNrtvYdj21aaL2oCIAgQIAmQFEWTkkiKFBXJIqMuy5Ysd8ctjrsTp/c2mZSZycxO773P7OzM9r77ttztu7f3d+99t7zee+/9/QHv951zAByAICXHVOxMfOKoUBRF/PD1umfPvXPv3Du3e+bn56fuoTCcMz1/5aGTZ1976/xGrVb78fkHP3XyoSPz0/dwecdn6uIfnK1VVgzDlE/HqLz1yENX7sHzTtj9obNrK7YNFA2TYLXZ1/QtfWdUXn54/h5It0ajBz9V6ZimoFHDcLIFfrKO4QFrVM7eg/UWiPTkmmFzRI1SQdc0TU3j8E+qphdK+DEBW3n24D20dqSZjjxbYYjaplNQAKgSORpDtmAwQl555B61bg/pQw92bELUKOmaqsQdhjIRbtakZ1Y+dw+1wefggysElAlE0/9CGXQ+lk4n1axtF03jU/fs10Gy9BEwPtg+q6mqst352Mc0wFpyDcN+8J4I6Mv5JzxI09tDSufYi1Bcum0Wzdpfvwdf7LnyGtSTaRYAlKbs8DCbwHy7aK/96/cAjDkPVWxAmlWh2AlTTcXHlA7L1MEZx2ddJ+KMiIAXyRIwXMOs3ZOrveeRDjlOWjKtKISrohecYtg7hQFVdLK6ErYJBKpF+/i9eEDUgfoUsX4W+OCfopcYnnb0cGiLjgfsx5hgxe9okKvGyXswhjF92eZkCglZcDignU7lxx85/sMnT5x4COfEkz/8Z8f/sNLpMGQNeAXqix+DAeChChtg5Z4JEML0QWDqqMm0qnNEO5WPnDwy1Sslp6aPnPzNFnf+HV1Ne+pKTetA9fw9JCWo3gKmpWRS1RmixvknjwzSOr925KPniWABq5b25WrJLhon7mEZwVQlZ97unD85tZPwwNkWhQeKBeVFYVqpFA28ZwF4XhTJ0wKHdOUDf2+nOnzqxFsdglU/9jEOKwmAe7pKnK8DU50Y326dvCVKm/prDxKsjiBW1bhHqt75Ktg469w6pEwK/JPzJAQK6ouMVCFVn7wHKM5vVaBwEOjrHJ96Z+GCls2I9WOIAyBo/dY9RCFQ11hixD5/5B2/AtScUVTSCAVmzeI9/sf5FIvwGydvw8WcOkvulJL+F4is3ON/nINQLqZdOXJ7r/JwC2hSjgVE/5n3PabTNWh++/hts+xDHY4q8f/7Pqxyguj07BBe6EgL6g7x6ntCdc/UGrT+w0N5qc914JQxoXrkfQ7qQ4ZtD8sHOokEoK7eCwDu+ZQ7JDql8zJMf9UxjI++z0E9f+t0OnXwxFc/dfzZr3/x5In5cPh0vmIY2axh/LP3Oagnb5GqDn7r+FrF4EkAo1KpPfutKyETABZV0fj1e4bqLdDoQ8cBqItDSQH+hVF58IRvQk2/jFS1Yfw396DaMaQP1wzTdTu1hWa5bllWvdyc6a7Yrmk86Eem5ztEqR+4B9ZOGX8DRGrXFg8kQqe83oIgeJYJ1+mpi22zeM+k2rHjhWIg126XE73HWq24dnd+z/zDr62hQhhV1o8cuZeq3gnrv9Zx3W4cpOys2u5bX13ruPzYdmXj356iToGDD33uyMF7Qau+qVa31Uz0P+WOC0JeW19tNhcvdCsQCBsHH3qtstLprFTWHnzk4D3KDfP91NTUqy/bbtdKDDpluxPIBmupa7sVu1p1halQqZ28cg9X71x8+LVaZa1tu+uJbU45LBuadrU20yyXy831WodZXv/RX72v2ydOfPXsVx8ijkUjBSO1arW9DaS58sSETMp1q9EINFkThOvalbPv06rA6Yufqq0QkHbltYMnKm61c3N1qdneCaZlCdR6uZHrsRBcc+3h6fejeY/CdLdqt9bWQKIVw62sMqRyucEC1QKmExPy9+VeQ6F5DkLgtfn3HaRrzLxfZTRXv1m1Zzx52SgPlqcTQDUX+j7uLszQq198f3lM3U7YvG8vBdy9mRtEqESnEqixhMqkQq1qr72Pmq6m/oB5TPWQoLS2Q8kjTDqWJFHL/cTFgnvbKcb3znn167bt1sLISUxfLjesbSRqgCNuQb3vkxddtzb/fmF9hEdnoip9ohwQ7QCcIEFz0nPpyQP0WtO1j78vMP0zsH6n0UuBEv9PlPsTKgKBE9LPy+VBAjixWrVPHPnct45c+emOCRwk+ykXR4I5mRr7gAQJSqDXJZAHG7Vtl6YHVCprxx+a/6nGtBbHsDL/T/QjVUbPOUn55wYTaiLxRFUEs8xO5dmHfjrpdapm2xvxftJEiP+tPs6UxZ451icI0PsLufb60lJzZgMWHEq4av/OTyO5vowgUj/7syzzf7yqYk8pB+ZXYhtCBSEL/8xaaiNgCFgf+qlzXk90bLveD9Sc/5N6LhcPlsXoOBeE/crberQB7NbquSpKhh/8KXOz5iFQl/pzqk+Am4sz6+32c+32+upSPQb9QKQe2DmmzBhouaa5cnL6p2Yu0sF//7sw+tcHiD9wqlVebddaZ6pCvSAOaLfa4ftg9SPjmKhrr3M2AxHQ+elobL/43QepKMJ1VwZY6rnGTLcFOFlPqsEPPptutTUTsqo2y5a1A0zrEM29Cq++gWbhykPv/bDp8TWKmnbWupWZvhAsrZ9DPIBq11Ft6foHhIWZCdUWo9Y6IvvnOlSv0qrU2jNL9YHMvzkR723N4La911G98sUKqiIqC0tkDfVh3KV2C2FlD08M/Mnq+n4cXc/il4GrW21aM5QZsMWQKtMkxFsbM+X+zN/Ph1hC++DKexrVz63h8mtNjyNjLrO+3qoyRAmmlSym07DxSSo7+KyXbHCsS9UprOuS0S89/5JBZUGQuXH0WCdC7ScYKu57GdX/+FnAsRLkm3ut+vLGmSpjcRBkdr/GRiqEDs2tKNmMOqk/tcROhdE0oC0WTYZrD/M3BkQQEhZQrfzd96pTWkPL+YIV8jPDnFhzXWgjIFoBhaa1+KOmCzYbWoUvBfkC+jm9xG4FKBbiZcbq0fwDtJl1zjbfo4XtGOhhrzSiPo4UmVuruqTeXaOgqao24KQLNLRKGgPmzVYrlEwSwqBXe70eMlHLAy2Euj2c5oN3338CXhs97O5f7FKF+B5olAhRRYJQ6QEVkynS0QlgBDGJC5K5NshdziXkyttFWpquUZl/b2K6EBdo4uDWOJUaWW0gjXoYh8epcVQ5tLgjOgQAmjNd14N12+gVgoL2e7AK86EV030mPnyHD+s2hxTTJjRFkSmyD7UqMpb8geCLtLp/hcNqc9lqbe90WR2z8mvvNfMUBv9C/NXkEosdBimNpNJkTDWPq0MPhnANMBV0q4mhCnOooMCLVgfWtsln3X2v1bZOo3Sv288sr1VNDmmM9PShjT4gjasMgSpQhXSdM8gWsKsb9R2BumQb77EE1sNwJfuo3wUSpradJe2k9FVN3JaSxKoEZVgWBHMrVZ15CNUzqzsB1WqZH3mPBfnMPkG+eoWRaUVLyzSpKNoOjgBPi6osn2bTGK/IiXUHERdrxfyH76ki4UdMO575V8+ATF1bF2ZpD6nKtCm0u/fDELfHTlnVIFr3c2JtLfUHM8cdg2YVVvR7aHLwPFJRsRX73arpmG4p0PFKXzOK66CoURUzBzhsvKbVCqFqV9f7ZVgadABquV0z8NTK8fn3iokaS6jlc1WQKVpKI5LSU+gR21SJylqfcmW9r4RELRllOjcDKjH6KrcJQMssb4UMgmXNYHiIXfnue0IIHDftGPY7zVi/grF9IeA8dHr1vaJEYVfi1FWUeNNzJgUUevWVVfYQZWGsTYsZzKZhvxeIdX7NrvRqinVifbugxhpOUVB9jo8+LfjQ62N5R1VXXPRXu9VaiFjrBKnkg/CvyxXXsN8DJVeomLjZI05rYH3bnFN9xldiranAHvCJ2H+OJGajc8Ajj8AKAKr2OYlYQaay75rb9IMQbaB694esIFKjnFduEesbAYaSYvdZOmwJBBI0RM2BIAiRaEQGMFTtdvOMR6zR8sDyZl1KsCBtdbfT6heNqEhdYsH7khpheMntjLC64uEmiwkl5FFpAywBjaPqrlu1M03RKJALa6xNKxSysu/2ycGPGBGDCsV3CN17Wl/p548qMn4+48soKpJKUwLbNXZ6dZahmpihbhdAmgs1E8iEKlC9yycHR9l/Bk4UxGl6e5cpVr4qoZ9FQJUlR8RiBaqGO4NWtnNU8sJOPKFyCdC5mweHTv9ZzXZnQmofKsroGzZV+j8oSYSAXBVZXngGWWCE+bpKS0MCGNVV6MgzDWsihGpvt0b3rg5az7+GYHFNSma0yeIvqXGRkjBfS7JUepYSdVzlOJWAUZXUmKS42KKF6hK9hUWLg1rn4dbNngp4hFeMj9zFeSmkT6Vq0y5hmlX7h6DCLKylVf+R+IiqR4jR5IrWq7nY7HqS76vVdYEq68EoN+px+ZXOXaqr/qsKa9cNSsw33F5Me5J8vmGFH+mlkiaF9iVejzH4A9qNk6sKm11vtoDgUrUtUC2HauGls2HfpaT6JAyntlwNXSNM9Z5cvtonKq0gxW+6uk+/EdspQDqU/Ys4WMG3SGebdtE9R8R5ZsPytFW9UY/tzb47paqU6+OoEqZ2GFNFiVVZHC3VeJtG1QsKVRSZVLVIJDXsDWgy9N7zjtHsehhWG6hsrQeo9ild6dp34+TwgxUpf5qDvgWmzDxV+gT0NcmXYpRVBKZmEDEJlJEWEziRQVX6OQPp/aSsFhiqXY7qxLVcv/zK3TfjdvotW474HWCY2lKgT+J66cuAZaGtiwGmim8KhAN8WihYHbUeorEVJV0gVJtAtSzkar8aK6tj3H0VVic74YL+MKYcSnVAnk/NckzDwcCI2RWAqoXoVTyRjAI1XCaQpltVRasQtNWMxVVV/KmZxsrn7jrmD3mnsKXMHh2l9s/wIW1ncCXVq4iikRM/ziVnrfkr9aYHMGa96CINacGyalq5ib41AV3aPXJ3DWR8zbTl+QfM5tdVpRe/kAXqayJVo2svaMrghEnA72EfKqKqQmKV1teQsrLwpsr9CZWKVlCq+chdZK3+XRBqXU5EM72vxNBpbOQZTiVidSXVczy1uOWJUVCDh0KmVTSGzfYsVGcI1Vqrbg0CNQtYX7t7UD1ruG05hmIYbwNTJaSZ1MCOj3r9qk6T+/qH87QQgprSAyovGVJjPatArFp9euM89td10OrLU3fNFF853rdaNcDK6qAIihKqh9I0SoHu1+TQsxaHak/BmhKxEeISA8wHsJlYLVf7lQVZFoqKS8rdhOrBFXst8KMp1pdVt6mM8BP5RKiXEKbLDkrrK+EgtRZ9dBCqWnoOPgACqxAAM9V6bNkcki3UuOIAVcN+9q4JTF/w3mGDbUVTe8J6qiqHQ2WDSDB/jIW/jbKSxKgkWKJLLFnIusisVYjVc3GQbpJVgJo1m6N68u4oSAuy0nXawVlSQ2HRwPQPYap6iKCaH9aUwDSFx1MDQY1aW+Fca4ClH9NS07QWsEMCwDoTrfCsLzVyvKIVsWq7oBRMY4hznm+rPbrjpdhaNqlx2SRVwkTrS8jMSEak6UAcJe+HKfXqyOjlGFTzo1vhsIkWBVWCOUzYeDe+AFiqlsM9F40Jf8AF5QB1JQtU//FdQKkVP9VfcT069QMooRBpkJsbHRmd5BdtGtyVYnRKj4+MZFIRWNVJPBxgLdm5Sqh+FbuCe60uJgBYxJqs1ZZMps1yTuraXke2QFFK6F87eDeAuuYFUItmUQ1bp2wnsuo7O/xaLwO70VEGl8PMfo4MMGVn5KoqwZpSMuzpmVTINfVtMx60UUUWgPtVqiYlbIEqCYAWpgZbiTPr0kSciVyo6aLmwgRQcJPvfBxwak2AisoEbm6GXVBVjjSRkaNcHmHY0bdMS3mOgTIqzsjIUYhWfpTkKH/6ZMqPtXjkqcrePySp5v09/BHW0SJIOB0IgKYvABqQphMhfwAaAQJAIcPqLtiKwth/QcaUw0kKikdSPCuTdAinx5FRsQLN3S9ATR0dGRUAAtbRTBK/mjzqPTL6QBjSUBDVi8kyOj12TPEjt56uYgKgTKhunPNa2HIT0VgAelcdRcHG6ztvAhxnxZOQ80Y4b6qq3NFR1RAIHo9PCkJ1vFTgZQ8+ASs/wSOKnPuTg4dKEAGnG8ksi5AZh/cAAeBWEjQ3vMrSvXGYJhJoXMP2W0QM7/iosBMdpKXJ4TfmIsE+1f/sizvw+AjHDDJSoybK/d4vPTA6+PQaq1o4LKBy801V1VApHBO3c6gGpJy1cAE2SUX1xqxWmVQF/5jnp+741Ik1OPxFc78aJlNxcYqgGX55mRFCFSSYTCmSRNUgO3cMaigdEMQAFcEWqhS9JVNDxABQeJizxiyrtUEzraCkYpsBDHo1uDBn73g7CmuNkgOoIobCLo+0P66OaWklOeLJTHwLiWrronpFmfQFavyZTEWa/uRWAI92g9vo06vnA5img7hPjoxVMqVysdHVBXTOkFhC0voO21W/RRsNzXCgXzToBkc8PuqBmlTgoBoBoaqMfAeAejQVTpuqUuGVb2lxIlW8L/xMgMqDgG6ZUK2dy02ESoHkvCrxP7kk5oN3FlRsiCJMFSlwGgHVx+Cop90zIB7HDHLYTCwMBJXs1FRyNKlEIt2qHEjwUwDSrfTiVQZS1rXEAQpXnc71ATVRYfyvkE9yR/OrD8uYap5U60GVkaOAjXxU7WlKYfjC74EdgMq8g3BFO7pTFdmh8p1hVYuYHep+0lVLRKrtc31BbZP+x5Oz9h1dd3uSAlNyoN/HMYQqk6sZrvlH1RRjMThTaV8u8J/0P1BsqczoJH2WUeXFAoJOFU1W/arHNSpzsdIr0FVkViXqosAqrjGJCVVGqndQVzFMfVtKcLrQ/f4n4QQoD4wwMtVS4m2bPjWpI9uhSjdicvQ+4a4KR0rFAkVT8Yx9VXY6pBwOAxUPojHYbSbGKAQwJmqroudxLlRhrN65zczTX7QZNBHzNEqn4lq1DBj8qAj6ZdFc4UdfyCrgtlZ/iyqV0kb9GIASEKoIxvqGlH+fxD8WwaF/zKwSHgCRap8RC0XFI9UP3ClMEQ71MPWwC/G89BX9NK8KJU4ZVDL8BTXlmUilDwNF6n1hUJkBkVV9ERrIb9+m82Bl5Ao31F1lUrWVy431aVs3lDtKqtPPuhKmMvupPg/6+EZyHfu54e8Zk5kRYVL1gDp51BepANWTqcKbgAFhBo2YkqkhbqOq+q0u+EhJAJNFq+rV1T41AEL9K8zdO3snMCX9rYnkiafxowZqSP/7PRIQhg7VWXpmTybq6XvWKaKAzIHVWNhgkodhfTUFTIteJrX3j3kWgJdlOKaRB7DISdXqC6rgJSLVf+Ndx/S47cWlVDkwFQupT7melW5wNSWDOipwHRn1vjrKAqv6Zc/0B9GqEqi0kpaqi3wO8T9oktjBqx9jFKtyUhUGQJ++4JYPKpHqz7zrmLpGmPe1vmQqiwDh+ZgU0A7YNS+QZOoK8dTL6mXE/rxY9eiIwDKjyk5VmnG/pJqCmxpBlZwBEgBwVoswAECq3Vq/USAeqJRaeZdXM08Rpk60TrrXPZXVv1RNRqZQIS3JwBFPpI4wOxYSVHJL1cs96T9G98C05GGoaFoQDwtiOopXb8SSgSgEFKRarpbjdzMZhp96fLe3CDPelzCVonzxMiCSZbkEUDVZsYwK1gemIkc1OGNNk78oyqWn1QjLq4Edgv+PBZFVpAZUJlWXyFmttfvMV3L8W4ek5GfefUxVOXTaK0Z7XVVV/KfRKE/5meQXCPvfy/DJNRJSblp8Rb9YIu5PqwMYJLjDQQ7AsWsssXLGii+qKvk3jraIz7+7mBbVkN71ofWv75hvpWqyDKB/+2H5Z2V/ixmqvgsr16D39ghyeHAMFjzoNYxDtzlwR6j/BXWAKEtiiZXWTKye4m6qr6p+9l21pYpqJG0atU0Zi0ooS7ZkGiLVnkvLpKSNcpEaYBrT+qME3dT4lTmejInSZACnxoUq85DFjaCabce9SaNHZ1qRWSDIAjZxYYEsJ7vv/Lvom0p6P+Q6yUFiyfKPMGga26RNNR2mMBKqGak+Pa5CWNV8P1+hO0OObq8Q9+4s+5VjisiwaiwJcEyhDo+6heEUZ5ZCEwE2y5uo/hNeqq+q3iX+n/7PmW8aTptGRGfYPu3BVEXypZIOQ66pmbzqqSe5AyMiWHiJBv1DzQBkyDaHP1kRyBKwBkj1ApFquxaUADTYWqaGbbDIn0+qkPxPvhuQ7vkWMDV9q0VTe9kvcpToT9PEuNlkRKdFyvrUwKsQphIT055YIZFaNLYBNbBHmGo7xvpWkQIgXzWHBqu6R6VsK1O5XjNFINGryYJX9W7w/zQm+UlxqQjfKYGZL9Ou4j0qQCVbaC6pqumwXxCSnmo0RKNI90fcGZip6YGgHgvA5YUy9ABkF6oAEVA5t87r/ib4KVvo/bVlSlVS705UBcO8iiKtHACqDaTUSNAaKrgE9lfT6XgrVovxd2NemO4MM+t2chR+x6myUiMHAFYV+H+1RZPbqQLA2x+2gQhRyMsw3g3+xxJeB66Qpsay/w4OoGQi1QimT0s2T7yYjgeWrNSISdX/HCNCPUbkekxlpdtCVVmbOYbppqgCqIggtcf/+CO7PxbwWTvQuDEEqm0j39gg72SJ4tPJEKiye7DDQyEZz/jfAa1y6cFG2OHvo/4DAYCNDd4IGAyyRTo1RKoI2K7tNv8/1AkRh6Ztz/ZhMiVMoSngXiYZqUaQ3fELcSuVlHX6FtiEqUNSVUWjQjWAizbPAFryGiszKzfCm7veCwyB2kMb2o7xSHMYqf4DeirtH/XWT5qJVBvRkewt/bpQfTwAAAvgDNIqVjSfYoTa24xLuytUp1+2WUlJVP9ocfnTPvI0nTTY8gn1NiClk6TmqxbWgUQIeBvRyuyAdNamahXqAujGdFTKpiqcql2eBfAtu9eGSd+KjgKESepr8EHt9/vp7f8AXqP1I0j4bYRqRBvyxzS7aFBahen/3l0gEv8fA0Oc33Xmly6TYaIpgzHxbdM0h1GjKadFw0l6oIaRTUt3QB1AxmkVIrXyYYC6Pxm8ftwtSIccEPFc2GJukzWt90RV0WDjRITqbmqqT9nFHr1QGGQppiPylA4ux0amOJv0uT8EHfsm7T1/gEidAyzP7UNQqZSX74O6s3dT8Pi/0jMX9Jc6Ia8KluqlI7vZhMaZn/0T15w1+2sKcYn8UgVIScr2t2yh/Dk5Rtg0HXxM9xMAeCHcTfeZA8+B6H0K3aGEZvwFfmH8P9OKSf2ZoSl3hrN7marp10SwPh2QUsHkRSbbU6mwpjQabjgD/0FYVKovWMOg+nciFlW6O7DK3SdmvwGi17ybk+6Voj1vSPitjP+XJP9fOmtRTeXsXgHgQdjaLAjiSUJM1ybnG7GKy4NkqsT6cKUQIZ6ZISSSaenhQAz4+IcsrnSE0NgrGfbj+66BUvGmuEAN0Eyr6jaioIBQ1TrZ/63FbdS/bjq7lv6bftksCqIQl6DqBV4+vYXQcgy5CpAkjMgMcmsH2gBVDQPq3amAfNMR0AMlxPUdxEhl3759NdPxrTMZy3RIQodcq2P0etD/JrP/N3pSVRsAVVNCOZXd0lQXV4pconpqVisUHDKNqElv5Kii9WO4ANUkBada12YBqqGCUiVdhefoHhv3ohqCm31IIh9jP3dg3+wzuEFzSen+9Kq9KOscEwqzaJfB/zPnYii1EFL/zq61VRznhOpflloYL0AgFNSjpyhkryrxGkE6SRVWv/vEvn3P2QRqgCon54IW5fxkMtkjJIL7A/f9wL59j+O1SkmZxH0s8TGlpSWVR/L02DHBFWT/o6wqca2nVKUSYn+o/+KlXar/naow1R9coV7QWSlDntfrZJRe3k+HBWrSQCVje/aa1YUgzIcRI1DVgCr5jyRiTodlLfSU4djNA4z/i/wOpSW696Sqc1iN0O4xz6Yl/u9CqFo9M7RXwqCqTnG31P9JI5CodPTxgg5CdS6LhqerSqw8lVAlIwhi8NoshFbRYaAmJcDUgkymDM9kOgA4cnCDwL0HZvfNktbbn097d8ETwJxuC04q4hAofvgRbNMCpolzq9FiynBKRUPw9/gutfUhCCJBoBT0VIFKGTJeE5kaSFWfWGTq4tbUh/ftS8SBimeOB/ALhMLkqshEn0YqpTJrJfZB/4MB8GoSrP67TOrOeNSJ0AKl6diNRK+mQjlFOE6N/OL56d3xUA1hWnLdC0x1CoyoXmfeqUwq1tWPWFP7rllsCFQpn0+mZVSTHFQBDv+f/Vw8J5ly1JB4dswuQAWpdmH1qnnxWuKT91TFcbQe1+wYf4ZuOzaCqomZSFEVTaoPdbfvmvo/aRumdFF6imNa8gmV9UXFhfokwnBrDFOAWizlkyGpqia1w6qnnDiUSR9VRqyHD0uvlodKttsA1do32ySnN5/0FF9IWGiOo0SCYb721HAzIFQTzXPWATmkCj1VioK6shuUOt0FghLzp3SHLYnU/RbSkUMZRRIA6bA8ZdratK/tm+WGIANVkgDATzusJf0jEOU/Zt9rTkEGlSyqGYBKpIowj6f3klHddtgh/pLMZckaBuuQ5r/WyrFWNdGrVqbophZO/hV3xaYi7s8GZAW9j5WwFLIKQCWpylH1bZtAAoJdi8T8+/i8IgKVjocb/QOo+WQyhKsPOj7pDB0haJN5KD37Cdrxbe07wFVV8IsyfxS4UFVjbF5Kqtj18kal2i6PsaQK66xYt6k2W4nYVF/YpVjKfv/tFmjaWAcEUsxImFKv+TERqw5bnLhSWECIKV0TGQsZVE8ZaYeVEKg+rly4jjuppG8YpPNZWFQfZovTYVUhVG3k8wGokqTWncNqSHdJ3ENC9ZkWFi5h+OMmz1WN0ShF8rwjoO7KINATVKXjvdcsLYf9w4tdBKhCoJ66ysdOHL16OeISMeZvlfdZnipwZErlzB4Dqk+noPTDh7Wkj2k6j5vUucaHTO87sB4mVYlWk4pzWIvasEFk18H21c4all679ionVvRRGfa/FZnDhKD6V3fFSvXzH9S7YLeO7LkInOeOyqCO3D+auZwZPXXoUEYNu0WM+ZtcoLKl8GFQCYe8dljPx6DqQ35Y9c2mZDJPFpW4R7PMqjKE5gvJDPZ7SjLWfyBPFfaIvTiydRP63ptc3THtkhqZKAZQ/8s9uzF4jqeUQTLE+tQMf5wMqjCo0FanDp0aOXRUC2OaJ83fnt3nd9XZjpPPh2HNa+N6CBcZ1XRePwyLK5C0eayfJDOVkyoFE+y5TIjAkz6F6/k+oDKDpDJy3+dHMpib7xKqFsZTuVR4rcuj70BGu+FSPSj0FMf07DSt86GHMiO959CWKiMKBOaI+fftswLz2jGWI6QKUAvJZDyt4hTGx9Oy/jIcsyZA9Uk1H74RHqiFZDrOJ+NCya6M3nfffSNX0YrqYsIqCtTQMkOjFE2jIBdUH5/aDYvKxA3Hu8Sf6zzJpSxlmWNAPXVVtqQY89MO3uasJQ0rdozr+bxPrGkP1HwvqJw80+PjhXTwSF4FqM95L8hJ1dyfSUa0FX0eHx/nEiQGVAofGvexM/IKSLRpwUY199Oqe2wQtwsBqGZ3ejecVCh/xsem/aQIWpE3kBmEqUeDWcb8s7J37RSvZ/L568ymXWZQANTxdEQkBKSpjhMdB2RNDlXbv0uz+8qcVGMIHSSuRq1XXxjAcTaOClSz2PuN2To2LWU35pZBRn76H5r5rV3x/ClomaexjT8jlnmhHgEX3APqaA+mRA8r5X1SyTLGahtZnU6hUMBHTSWccPUZD1Tvfw9UIK5HQZVWsvOwqp6JknqaQGVORSytsqjMUxzU+0ZBpTScHB8WyPqWAoBUTzm9S6BSPNR+RBiuHZa7U6OY9vB+Mu/ARP2QEKgHllYX2s9toF4pK9VPAVZGjFomHytU00TGej4C6jMBqBAALUR3LtNvR1DV8bL5qE/gvUHwkK0KUO/LUNktMM1uMTE7R8X/qd0EtctAhaP5GfHiZ6mKAaCOhjE96gX6g+snh7LLrKnyEzMLM81rdcvaMJxCJh9IVdSbEKWmAkoNY5tX8MMoqHIbxOzsE1UkJvD7MaD69m+cpjLnPFBH5ohQ7cdG+XePmX753+6ACgkK61oz/dVtFAlkqWEe9vdORovwPrco7cdnwfOLT1w7IDD4kckN1RBHQ2z6qiv8szQDNTkAVAiAGjOrIncD1n9A4z1ylWmqrAcqBAC00/KI+G7Z9huqqEn1F3fBTiXtD0I9IucBKFKRFKCeOqpmRvMepsFVZSjtsT5r1a/JmeCmLWwqCac0VEpekG9UNuZT21Bqwpp9nAYP9Co6JSQ4IqDSy5QmfVJddo2nPEwjoL7w+q4s8dAxh/h4UFHplUNcPcWjqbyNOkqnMCiL0FKzVjgPVO4gSZUJ6fp8vuBrqh7B6oEqHs9nVPNGGNTE7AHSVdkeqayF7YYIrtQilwlI1dB9TO9bNn1QqUb1g7tSRZXd7waFmmdtqmEgUJcPEah5jQlT1YstB4QKLTUz27MBqmYU9TCADFQlk49FVQaVJLBK7kRk2/3sAWSrTS3TC+p4Mh+OfEk+FVB9kyC8rBw7CqnqGVgMVFMG9dXdcKmoovus9G3RK9vLHDo1ymm0h/e551OZ7W1XfAZCNYZSC/GEGoAKwYCMYyFLk2wrM015Tqc1W4ZQMfIRVCGqYf+Grd5QHYJ5GYx/zMHT1JGnzMs+qV4Og3pxd5b42CtTwXRPSogICzqToTqKdDoG0sx+EOoTB+LGvzjFvIQqfUbKezyd8WRqGFRmUomnEigabtbKC5VSd6HpD5g4wAKrTADkQ6AeVvN9+J/lItWR+0aOwkgAozyGjjsiWTqS9t8tUGn0XFCmOY/wakFkMNOqlFpORyjMKQYueoj/K05Ry0ieKj4gZuIZVflYUANrKZ83xovdcmPxjRcqa280LV8A2OSthsNf44UQqCFSTZIYmRsd+TwMF1Ufd4pFolh90rdTdxdUrEdxPyDNoTT8spBo9UPI8qHkfOxYDfC/bKniZHS6oD4yldlbgWEPUJ1ije3qvjbTrdQWyp4AAAWrmSioWj4uTMsTEg5LCX2eFMPfyTiG/q8AKg8GhEDdDe2P812p9f0RmP7qDkDN9iFU6H/E7kKYJjNa0dEPa7H6n0AldROQatFxKl40of5Eu9ZeYgKA4l9hsRoPqpf9AqhG9j4A+vnPj943smU4o0czlxn7j5YCNxWg1naFUkGrgUh9i6Xa5OSlnFUKThEOap/5L23DAYAZOgJGtdgNVFU+Ji6SD8kVZ0Wqga6vdrtPIGE9iySAUeoFNZ5U02TxGSUO6ufvg7tvZEC0TKT+HURoUn461ey+umd3z/x5Kv0P4h0xNMrV1BwK6/st1qlTC4TU3pfMLxufzY4HpBq2/n0XXrx01hg3roVpf+G5RcuaJbFKkZUA1PGYPI2f/AZ0l3ikHVKUesOvCkfgKdBNkKM2Xvje7mJ6sIZcGc+0x56AR7OYAdF3sc7Swsxik53Fxc9+dvm6ulw63czu9wMtaSE9OQZzYU0FR23cfCLyigdm2quz6NghazUwTTmocfFEynVR3SLFL0Gnj7EY1aWrnutveJX/2i75/tL5XMW17XCirQ+4acdx24kdHss6gLkm+FAulxufOL24vAycWc0rD6gWmKbyX3sOoC70vsgT7SYNQYG75j8VoKZiY9/0L0+GKi+xI0xL8HQvbfHwquH3qKCvwXxhN3spph9ecY0S+VPbgppBeYi7mnjHBxW5uXJja3GZxbILhx01iLSQ81+M4wJrdXXBdWRUAaoeF1FkEiDPgn8UskTkH+MTqNzeOAqpetQIqtQI1JvzuzqTwjV0ur3q9qCiJthdStz+wRC5RmNxeW5ubv+cRgFtsgMq0FT1WLui+ZzrFIOMFRSVHpdOYDkslpXQR0YudGjGFuLlLP2+PHL/nJjL6PWnfWY3l00jR44SSoC6HI0H93B//rBj2uXE8I51oNw4/dnrc3Ok2+Zgkcavl7Jm21UJVQFqnzwtuVR2t0LVNg7LRWTJH88uUDlzAKph/Pmusf9B1B04KPY1g4RQXgDY+54zqoMcqpUY9gG01z6xeH25+4YRPwMtMWv9u8xczfenVD+jyEq8SPGaJV0XqLKOd7MYLAuGqD2+W6CeoF54YCqD2p9a4SE54b2fQ4UWwcTZJ6x+qCJibRQ9UMf1PlkaAarJEtK6dwpUzsgn04u5I7hDu7ShYuoR7CEv6JSpIzM104+lPLsqX7hRdLuJO3IOzHJU89z41zP9uD9D87GAoeMEoAJWM9SfQtNpdmdH1ZWXmTil9GcWTmo2k++HqpAIyfEbht2+M6DCtWKoXs4zOzXV//4TqMYNB0cClXLSUt0vFagd2Z14im0XdeL9EKiBXA3lm/IkUsdR/jVzh0C1GK0i5ou3Me7o/bmKgUqYhkg1Bf4v+XscdwnUqYcNIU6ZKAeor3iUmo8h1DyzUgnUJxJ3DNUDhCrCPocL24N6Iwoq2au6v0TI2I2i31fbgvUDUPfLcfuwm84fzOgEajNxh1E1EDRwUtuBWojwv55yggFVKlJCK/O74Jia8p8sYZHf/lAwNMz5nFL1ccMYqpl666g+Vy2ikmPc0fqCmhGgFiKkShaOXeAjMAHq0Dv+p852MKpBj4A6F44w+0QqwvjAtVCgOUWJO4jqrLVeRTDbYaAm+4OKcL8eBTVVoilxwks1jNr8kGNStmuEb2IPqBSa45lOiuDzd5ukJktjNnFnUaVVaMViHKiiclZnoBb0G1FKpVn3Jb4iAA7Vg9ND1VArYdZnoJphUIFl+nDaT4swTQWtC1ArVuIOo9rsIO+r5fv5KNSQwUAF/4+HrzLL17nCI4ZD9edDDJ9c7CXTMKgC2owKUJPigQzhCuVPY7ITd/jMWrR5cACoNCgDREqkeiN8lbSV0mCbRKDunhwemX53xbWjZCpA1VgaxMuFAFS/uIRAzXCLqp9z/i7SqtU2WT9gP0Xlg1pwstHrpBXZKrOohtbxM/1v1lzXDzOEQaVSsAzPMHEUVccDlR6lHygI/JndxB0/G6bIMMaDSlFMLk6jMlVXmK7SmJk6JOU//3X0wVzS9QGgeqSKD6qjZASeeQ62AkPEXrjzoNYEqPGhn/wlBiq5NT2gMrOqhHYrgDo9nCGpFdc1snpfULW9Hqmyox5OeZCKo5BFtXrHMbUqRtHpb/vnaQgjpCm53z2gUgjA1tJQ/kOZ9nXxtU485weUOslB5cSagTPoA5wXoOJZzTsPaqdYLPUP/lymKB+kaSH2QpmuSkJPDaHhZ/5hItNCP0zhpqJWZlIgyEHNU21p6Cg3aEYJZU17vCpLCorOzs7u27eL1iwVrWUz+X6oslaKG/0uVSmgxXL/MMIp038GO6o/mQpQ90+GCRMFSyFM97IRR9bqertaXe+JyxGS+/aVy8Bzlq3d3rWzhAggd6ljZSrN/DCyfelHoQi2cfsD1A++3HHtQZAKUB8IE6Z+WAlhmsGT7HNYp1217eq5pZjAvfWuOAarNAyoTylxMvkmW4rVnydTOkut3Kbyn392ZSDn88A4QH0lDOpeKE/p20k0BjoGLX0uf8fGptrquf/FCnN+COHy7vH/us0r1uJRzdCmAGfA5SolSl8dvz2ndIDOlw4VqERA1Q6PJwNM51AmYnO2t9D7DWKtttaX4tL05eZ6rXXmmZ07nrPWrZup8UWvvNluMKhMV9l/8M4tqulf3k6YegfishQBVT08rgR0SutJWoznVxmmjFqrrQ3UPteZELXq5aUnnnmu1gLc7q2Esq19jz9+K3QNi8oQHkqMXGUW1Y0BoKaYrvq56XfO+Z1YpzQeVONoGNT8YV//E6ZGFeUjVnnmXNUODnCtVs/YLZxftc/ga1cAbm/cStx19vFrO4a1jglYJWaiMPMvSqzMohos7IhU37GZehFO6QtZfYeg0u0PH2qD2Mt1FN5p9Tlq7DlDuLl2+Lhu5DGQcHunoM4KofF4eWdS4JqwqIRDHQVVG6ynuK4CifzjdyhOa26lkVgo7ATTLGmhzN4QppMakSo9NsnG+nA6abZr51qtjt3/uFW7u3MXYab6nabXNVHeiXQVyp+bfvl8qOmVhaiLrNinP6JcV73D/YmP2B3saMrN3dgeU6dL80+XJ8OgXgao+l7G/I7Zka633CZOjwe0atdWb0VC1terHqyks7bXWm28meuBrxfpz8zTAqdtJd7TsFXf0arP6TbqHmA5Wp/NOoOpteDM5epU9SeDunfv3gw1l6iTe48abDWxZ44mHq/V2jMzNZKgsggg6Xqu3bzFdIs1Q9LiXDMwd39pMK41qoIPfL9kJKFGDkp2O+5MQVetvCOf6jW7wg3y3OL+rBMKLgAt0UKuI0OaRblyrlU0QtY/QJ2cO0x9kA88xra99fik5WdgOVXFOdM6B0PglvNX5XanKoTwzM5+2cIbdTwyZUmJcDsQ9c1uL/FIV72jfAoS+xeEn2NtLj6mZ7OUtb1xw8lm9eun2d0sjDuANEeTRtCwV4qAujePWzGuH62wtQQ+npZwn5h6WWo+sbraXCrX35EzVW75UsStntlYsnbq+XvOdD4TrlXK7EBPEaWmaMzBO5mhNF+zKfqJyx8bo2rbCaq2xVnc2sTkxi4hjE6wT+QsmjREfkpI/YP7907qSPIUqIj2OzKdCnc06pS+Ey/Vav4HZ6qyzbAtroukp/aGohQSrORPUdnNdqAiBoipFe/EVT3RMu0adNUYDk2+8w+b17S4uIgNQ/xr/JDG6y2H1T+pqgKNVKVVLx6hBq9iSV/fhtdZbwc6j7kTq2HbKvLyYT0V9VYzlyBSd2CZY+GoITU735IAaOE323UBK8E3JjDEVz66/NuyFPwLqBUylUxYtywFTawQronbj6KUNyRTgvRda+NHzbA8sepLH+ItcWtmmKPCmFLcr5+eSoX9Kh2Tq96Rrvp7WGZo223ceotDOhagGjmIpxsR759I1RmnkaotKxSLCsGaGEJoaqlW7fHTWpWN9vqPZmZ+tN7e+A7TiL86QxFqmpspg0ofwtUpO7HMQaol23xnDSpTx8nEgOlYJ1wZsH1A5UJ1b8gB2EtSlURqTcL0QA+qQwmS1qKGL7PRvMNsN7K7rtG0mkkp6ivI1U/6ObbTn1BTEV31Tgt/j/wm7i1mI9ZmGkyqRkh1zJMBVpMiapMZGVWAitYJM+jyQVgfQWhr12B1Bzlqz3n+VDh2HqpRYtvsduRD3oauYrB+pmVTg4a90l0g3TQmA5JrQC8wdHMrjP/3RmzVDO15WJcwxdi03cCUGa32AFxdm8IJXWr4CMsouR+Riqh3CCrTVbcRV5366PkOjc5ilfCVtW574cLM6urqzIV2rWJXV/mYQdKrRmZybybqAbi+8keUbl8MpQ4P1l9arfVzgMnkghjDCNBKmFAz+XAdRb/8VKoXVNJVtzHwc3r+Z/6wQmvnDIEtf5v0xUrdYoRqNXr0PzkAk/sDUBmm+yxr91ClPt/ar1Z7ga0yCWtTm+ork2FQASan1jcxhqhoOjf6mPsR8ZpigRXzNvMqUwc/+pFzHcSXDAGuwaDFCpcxZmrBqTIqkUA1o9Si+4w3Kw7HU1Szs7sAK/cqHp/ZoFC3dH61Vqm1Vx9npr86GZGpRKNvcncKJTSFQh9u76HalK4Z7zCwEgZ26gtPfvQffOT81/7hv4bzY/hcUOxQVWNkcoL/7UikSrB/WwSRJOaPaKxh1krxv3WtObOOyWwbG8+111sYhSqKU9B3mokqKlH7vZe4vzhe0PujmgoINyUEwMqRXeil6DKroL60gK5fx5RVFXmqeyevA9SNgFADTPcd2B0BkOh9PWupzVC1qDPp+5keRUV0mn+TDSFz+onUVEQGsG+puOr8sJvUjrQgACprtTWDJCyalc2MZ1TtFaAu0+4cAeqsL1B7FNZwMe0js5shxz8kAECoNDzNvhGn/BmgRJ0RTFMpRFbtoXepHXyLcotMY4EKXFZSsXevr6YoqkruwwFeMSEz/74Du6SsBqhBcvyXezAlZUXDRbIYSPmG05/9MXVffzoiWFMkAP7J0Juoj5z9zUql8rXPtIwiJVXMzOSkSExxWJFLKVabglLDhHpgN1SV1Z9SLRhUK5lML6XmWR4Q3N/JdZ3+himRakrGVWcCwH5rN8YpTE1P0RI1Q8mCVLsP7GWoCkINaSqrP6EOC9WYmA2L24iCH6k4SUIVU+3ye2ntYjdxegCoSlQCMHKl4dG7tUaJzcGjvZLLk3snuUjloObZQtLQJUuCYLigWn0ORzXGPAnUVQb1AG4zZ805ej+jCpsooPAjzgB1rbV2Z+PXw0CO4mFYWlx5YO9kRpKqk4j8V1dD1zw7O2u9q6DyPANGPFa24jFF7QdtcSIvJjbyRzRKmKYwRT1CrVSytisb/+YZoULCIMjjPvYAV/0s+cf53wv++aAeeLdBxet/iMapPtAP1CzNdSQfplEqxNAqqXpFJ1AVLSV7WSxcZe6GAKBRXwX6u+QOQ1cRmr4EoJhKdWa7i46LkHx4eJCy9UxFuw+iqKeBN9Ups3jbJ5xYVJm9r6M3hZms4bZVszN8AXBlDVlohmkqS1vLmQfgY0qk6nf6WYmdozr7j6whIUov/7jrmNk+hPrmXhrp3Bbx9kZ2PBZVCADMyqY5CmFUyQUY/noqIlRmcwBVg8dV90rnaMX2KlS2s3rC50Mf7l/oc6uwJrD5y73eR029maGp6Q0eIs5ZZWZYsShAYXEuqKFgvup+LRSzYt7rO01YDd6ixAiVSxkb/nUmhCq8KqNYnRl49fEwfePDO3os/JpcCXKx7ctulpteOdoHUrKn7C4Lt7PY0NiyqCApZMcaPtE+TRf49NPMUk1FKoHNzomhE6rhSXMSAAaUrPBSPVu1WjSqzQGo9mPqb3wjQpf7/qcPJ3YGKgM0AJUtUxlAqI69FGThxqzyQraEpv/sJyzrQiEVUKUijH+lp8FquL3qRKglHm9gvHAJYrU7KvM/zCoItOrSTlzJyHn8H30oSDlb5Q99Y992vD/7SyKyeEDGlCoojb721By3pwSqPCGfayx+dhFpjbGxuUJqQLhaDK4w7aG2AJ9FZkfxI474aFBP9QN7fU8VumqrY8uoWhFcB2ZJPvSND3348cevPf5hfPG4tZ1APTBrxYEKw9/tZ0+9mVlBKMht5Fhk2BIpY5GEh4jNRVDt0wowzMgK7aUraB6oTFuRWL1O7qp3IGNpGmD1Qz0hup2YqBgu/2Gcx/dZO9D+PqZyaIFJVGOQ4Y9o0E2iSqJVOb1JCBOq2+asYFcNMbR6lvbQaH7IkU7BpfzaA3vDygrX1dPrw42sYdr9B2LyClaiRoQ6GWeh0r8KJCpqzhsWp1NOobyChMuCsblti5+HalddZAsUNeFgCLsKyqpoPiWbABmgCnO1WqvHdKQN35eKYEqZ6ZWtTDyojFBpAV3XAnxeaZN/iFota3n7YqAh2lXH2fpU1cs38PBYquQihfXUJEuo+BKg42LO7+40UkYxDUcV69TGERtKYfE0ItQSqqPdJULTqxcTpCp0l7W1bdUqVVcMx66aR71VFuPSFU9PpUSegea5PoWAlQB1cjLzQNelQabVjfruoxomVHI++jhTe7lEdVkv/xpBOuaB6pXjcHSt3EJpG1gxE7AyFLvqLCfUtNBUnPvJo2OoLvuWFULXD2RhrKLr27VnrHcT1ARGUprG9/f2wZQRqpHC3Bmsn5NeZ8zyapwEqlZjO8kKah+GXUXj/bNsc6+XYRSBhxSTAPZjD/igTj7AJpESsbqt1XcP1cRqFW8EzB+DKjkocyRRuUzEgKfQr475zM8/Wlv7B9evYMvaieEQqsb2IXuQpvyIDrSV4e4HibJ/RKmmWdQNJgPcyuq7hCqaYfE2rj+QiVTPeQFfcqZch/eCGva5MKg5X6ZyAWuNnZ4bIFtvLKKjZ3p4hIpN9D778+hjCtkVBNtKGSZYOaiY6Z4iWDFxyz0380vvAqFyTOceEJDujYD65iQbQikGT0FXbciYUrGYoNExy7O2Gst6H1xvzFll2/7Z2wX1U0SoYvO4l1/0QU2lDJeKk1ROqZMP6AxU9CFibAhRq90u7zKqCcb7zJXaGyVUnp5cpqW4WaFkaVdqW8K0XDudyHFQhZnFSvVzn7iuZ6NZV8S00FCSWHA/Mowl33zxsJrmodtUkChnE0dIsGYzkwzUOZMihIR3gQmBIgpcmkPTWVZcRKFdhRi/zgV7AKVkTlFFatCMhhB7gGoOnW8wAFlh/ljIbmWBgccQwroxjlYRnEJhDt0PVB2z6H5tCHFULa16pCpEasor4UJKzCjRbGci1snJ0WVThF3pZ5dIZaF6obVeHja1+lUq187Rgs7lUUpF7PXqEWQtheZuucWHJS5c+CeCUhdd011MWJJY9Q77eb1xmreWnG6Ux8TfvOmev31CLSX91QaKJ1E9y4pkKEpjaSlcNjMKS9VLunBCBrWSFECJy0x9mMQatFigysPubj2wl+vK/PWI3t9LTbNFtxTknFh1pG2v0guN5RI0FqzaHkvAnpIBHbOEeO29nU37dr2qR0xOqGmZVD3eT7HhmEUGHg1z2L81OgrfNZvyZEPKoeIW/Ixwrc2Uh1P0513pbLOL1zZLy6NM9OydfOB6KJzKnbwKY37fZqE3SzQA24QaMZZsqm90W03O/lxzjQ1Kg63a7m2a/yyOypZOCVINlcWTnkLGjykmkqymMTfa5ZpKhAjoxzT4H8RRRNVQZX1pWPK13q1Ra7aZXR59AICCTh/IwBQJl857yTM9MARTNCKJ+Md0O7WbNdxwl1UzrZ22EtZYoLH61BY011z7dhMAJw1vq59AVfXTtrz0EARaULgjwGC91DW4UOW8xkDFIjloM5u67F27dXOxfrsD1BmoZ6qgsbnvjxKmOEeXKY2cPRoUzzH2XyaizEoxyxRy+BBVbCC9zUjW4HzmMglleVFW79Qt/29ikgFKIO3WbWI6RSlUIlT4qA4HVQkRKhs4zB0Chdn8rAq74DteDFT0BBcKJWqBoUpiAFtZb9Zvq+aXoUq7D0r6HG21VucwNov2H6i+oSoy6NSOYPAksHhTCps8j057Nn+ATZCAZnCpu8ruUtebZwhwedCtrC8uNTYbzZl2har0OrddVvkwyG4/534Cl52UnCV3OLNzpaXoFZKfoF3PlWWgjnObBORK9eP0BCrKXLsNYIXCWieJaoh6elZRXwmJ070ZyvHapudUi/dJY+cYESBDhYlfXKCV6J2ThKothJveLriiTp+VPXbOH5m+7RV/fKMvMEVrkicApFJjGgHipIKj6CXa8pDyYq46TYABnoQrKKOz0Fy9WSGBxoGttFfLtyNj6wstMe4C0hXT30SMmiNKAvUVpNJsLwUsCLVAI5L9mJAn/TnpAlfqfap012nB0+IiUacRnMqfH7n9WMrFFfz9JKGKd6LIoKaCAU4FiQx0Voug+1RBrYAMUcyqtREPZGH7xkytg9EUrKEAUr92OyRrLc20N2q1jfZMeR3CRdTMiH9QUhCZAdtwUEskscLdE4IiCg6zVAxWjuuyOwXytFudzsrKyvkPPHlwamhZFL4S2yjyVWckVIXtT3FqIVLTAXcFmp+LXIPzvmMj6H4gJ5qKc0sLtZbLSZaQJZK9TWugYVNkRypFxLQMVygp+W0xkcrfv29jeaiiUizL1JfpNekYndYH5nGmpqeHmO4rEaGqtFVA1SIylQ8AKuL7dEaRQfWvgqjCIEpF96q7krOkNlfyArFREn06HrCt9dmB+UHLCn+WOn2bM7UWbAEzQJQCkddJtZeU6JsSIlXirpQfyGDr/eDjl6D27K/9+h+fffIL00NfRWvYWOmppilIWhDcr0k1ciQyb6QKaj6TjgWV6THifSLURSva9ErrvJogWWbZYFZQm/W1eeWCO+D9+uPQyTTligQrEepeT5wCUzUWU1+kyqFhD1TvItiKn0uf2ZWCVFJTl1Va3W7cxKbvHkLl3F9g8/SVGFAZq5GZSqDa1Ipp5Q5EO7MJ2S71mRl2a1/ozD5zrlLb6LbXF2bQfPhEUxy0IaLRp1urYJ4QG8zEOJW2Hwal3czjh1nv9LwtZqXq0n2XwZSehlURu1KQ+h+C+3Vwf9J5u3uTR/+0gFA592MUkcImP8WTqm+mFt1O3RqTpwdIp44GTrNquz+a/X9lTB+vevOsXGqXdtm4K+8wuWfy9jn2veHykrmMVzBPnmjMraa2O6VH+PeAqtvFld1YRvWwwdQUCNU8nTXYznlNleqLUmwOobfzMeZ2M+MgG1CqZYnZF2FytdoUO6xhSuC+2QDSfeUZm7thsYdCCqLxF5GFCiJV2clARR1lGYmSJqEk+JqJVCVMqHGggjt3ZRsV5gCU8lhtWjJf2TQcTqhqqiAnwQ1T8Zrp1ELvW2OymIUi4RZSyAIWe73cKJdz8siLMnMWy+VKtfUhgepseQYgo8+05Xq9nJxc/db+FnomK1X0md2g1zdZGXJGhFQnMwDZDMtTRaCa9UXqoEM7fozd2PBHun8/uJ8IFY2+nutfCG1vcIJ1qUohRn5hBgS5qDCp3YVEDmO7Koy4WpWbM0s5Dqw1g8C9CemA8VPVGdaGue8ZGvHTRelYhYGKFCiWKC41m08s0tLVJXFbrHbVPkzxY8NnfqGiyK8vKFGgqJy/FBKp8YgySkW/ZeXXhg4qNfgQ95fMbG4Ro+/B/OD+grwSR175mU/2vleSuRRNYcZ0J4dIpCvsP+LdVnexThKBgLPXYBvA1qx+6MC+2WbFrXYWSFyUuV1A6y1DU26EdWZ1q+b44XGE9pDy58UHjPVBjdjUGUZUYf+DALHSU+8BsQdXCFVnF9ZRnQQdJtUkuoiXH73AQMW/VIhQDUca+ZbRCnEmISYBAcJKt10rN6qm4TW8s8gKTfyzyuRcUTnOgZy1dKZVJoK1F3IUL8J8Ia6LOjkGaM9Ql7LtFsdBfHaF98iTdWqwtkTFB4w18QhQIyJVJs2wrFCYUP3oLhhUJlzUJNhg89EFApVQlbifjagPbaSK3m9mEt6AZSMGKYMksdKWHYeNFMDVu5ValfE3s7aQMZpZrbqVMsfQusC5366UlzbLObYZKScPebG6GFBML0QClQKAGU6mnPUVHyHFg7XQR6RKmCpCqKKLcehGFYnUOThTRfOxQ4cec7lDpYUJ1QiN0Ix6AAptfMYlu2Inb9ll0qCQLWTJJCg5bKiAyZxVqLEcoWrBE6Dnc7pMdF0WeLGZpm8hsMVzU8T9DFja50N3Jz/JGo8m50zSUEVd8dFUxCfxeQci1bsT8GyM4bekI5fHvP6t+x+9CVAJVaUQWqWyPzxENxPWVQpCaSUK/vr9zTCwGJ7ZrPiMCAZFQV3uGoD/QapuK+eH2VvCHuUH0FZYVwH3zeg5HNTlSVYfo66QIQUylUg0fDTZSuWSNk6ocoFhDmXSf49IRSwFLTSHRg4xUIVILfQhVCYAdNl+hhlLPrQXg5pxaSaEwJRTqwerW52xWCNOdwVzMHikvYy4nh2MHeGiGOFCFp6nJ+Sa7ZaPKSAtUX+XW9KFHE2FCJUftm5K2Z5O2S+DqofN/8eRm4Dfb5gLh0YgUx0mUz09xQbRYTlddCy5bAEoJaZjXH+TCkA1PDKVTsmg7Ga1m2M2le2uMUzLlNMjswHxMSaF8cQSBWvZpluKxmx0mOAwjTw1ynJIbc+QUuIPVf0Udsb9zKky/trQ9ZTOuP8qQL3gFnkwxQeVIu69094z6YLs+DPj6YAH6gKBKqNZEmIAnd8Ip5wro65hqX6OhjGVqSKTWNUpMaJmiDKBARHdLGN+ivD5TZeqODJzZBHjBnhkqMTDSlaqrcv6aACqzP7/wHB7/M9jgVAaur9y6P77H30Ki694hEqgSuO95jK9w94zmh6EgxzzkintUZrhoPoylaASXxEm5HReQ6sKfK9Vm0PKyZOBzz8WKI7MvFfu+Ns0e0gl1w5fulK+LP5oLJY6+KjBCww9qDJfMymG4pg3D43c/+hpApWZ/nxQToH2ZMTuJfEjqyyWCghmYkAlCyAkB8hBMKpYunL6NJqhOOM7Hj2X5CcSqCwvVWTl5vt1R/ixDnYQckJVlH6oRkVqDKGm82rIVP3ZYfdMw0WF5Q9Kvf+qwUJ/Cu+Spa306AKLXaCTyUu637lk2qelsaaYv5YlMNm/sHQtgP/riaPHlLE6G+BUxI85nKWQBC5yMYvBriSKHT5Ay6WVPaZPqDEaygfVzg70pWivoi+VSVqsTQ95YoKaZiIVoB6qmNkAVLZG5Z/22/WUD7ifllMtBpP6YOVnA+0fJtVL1Yo1dvnNo/8yA9lL22IKPXiyQ5KT7TtmMkDYsNhCXEAm2mR+lNKf/bPbWKkKvwTFd1WHbKoCVIdC/pdG7idQ4VdxUBmqLMPeb3k2R5XUlKmDrhakqcYIewnjP+vbVvwQprnLl8eS31TGrI7NaTnuUDiagcrCf9zfsilqIxEq5cziRepgUBXvEjwfly7iwWGDqpKVCkxHDj3GNJXCmZ+mKBQy0WWk0lpq5vdDl1GlVVeav21yUD01FQhMp1pJ5F489uijL/6tf7kFB6BUyMahWoL9ZbgcVHEMlkspFUqCUBkeiO7GgmpSNKUvppLPLcX/Vw4OFdQSZfvnDhGpHjptklDliqpAqQvJl8rrSoRUkVwh44U2rRsdf14FuseMYoFLVa6ouNZxsiVgOnbsxUP/9cg3/9Y3VaBvFzgllyQRwL6m6IwMKcpdVtdhrhZglbHAFGGWzsRT6mDTP0QZHqrgheNDBlUrkulP/H/qEtKpnP2J0WTmz6fHtR4RwCaUM3OWbfwjP33Cekaof1/1c+cTgbtz1ljyLw89+ujRb/72Nz/W4KRK5SMh5Q86pdohM4AUDm4NEULU/9Cuo5KHKaySVJyiKphe8UwM66eTMagSqXamhqj9sZKRKf8Rxv8o5tPSTFGBhVw9IwPYCypt0nCzzPEyVuAeTbCY0hJALcni1OA+vduCjvrLX3j00f/tzT/50osvXsZ4GdthPylJhMqOL1IdhwLfHXi3E1S3S0dnrrxO61KJ/VNxpn8/kar0qAZRwWIOMwGAYfUliqU+xUG9/ykEAgEqCVTM0wkpKb2g9ugqlhLELQAF0X4GhupErgVEvCAVNzqZEU+gHvuVX/lPf+f/efFPvvTN+4+eTqxXxSTXbNgDc3yRygrd2nxYbplysUSoRKech/pFU8KgBqIgRuGKRhHspRhak/80FBWBevR+fk5VzCJF/grkbqtJBmMaFdbp5OWCHlVURKh2liJZJtX4oRScUJ2w1n1HVaBaFKS6nrj6zd/5nf/kV77527/9K8nCZmJBgGpKVhUJAjLzheZ3MdaRYlUTeOU1apLjESchl+K4n4Wo+sRRI8zPX4NEBfmqw5OqL5tFSk8JUEcOLYBUkaGijnRWB4iM4PL3G8tPbS2PR0EVhKqT69i5wINUdaLVBud/ASt94NFqRP4S6l/+0R/9yp/89pf+udNAu4kI+Blh9icpKtLSdrtBgOJVqbiZgooaAaT6IrEX1P1hPRXSWOL3QheSJ+eQkerUELvRVdzbLY7pyP2/QCkroFx057aWUQKcWZ4oN6CCGkijRu5yRmeqn9JxG/4kj1yZZtq7xP9Z2aoiuNDYkNj8v3/nj770pS/9f4U6NYzwykijFOb+IolUnltd5JBy02KNGg8kTNMZtRdVjSXM+yh/NdbkJlolX/UjwwL1pA3fH0MJ7h/hsD66QBLOLr6NYaqJxbkt3/rcX0hF9r0tk3OeonRcWy7SmZiwQFLFgodqwXf8MXqhmVg+dt+XvjSuU5upR6elkEFFRiryBG6rhiz/JwJIyf9FyA+getDEg8oKlJVI0LSvouI6uMAMAGNqaMlUcz9AXRSg3n//Jpx58H6l0Zgp5zZ9rHK4m2FQM5Rbpz2LYlBt4FLlAGop6vVnmfppJcaUN1903khYNRSmEKMbjoQn+0jPq808kWvC+m3kWM6Kr/Nl4fwA02R66/t6D6ph5a8oEqj4ZeL8wInxv0DjCLNVp4cWUcnmizyewg7if3hXKxBlmzkJqdPjEVAzNFGvSFqh1VOfB/O/FOMrQfVAV2398+xiok77AR0PdimkwtSU4TYQ9W9DzJUn/BdHgYtLKRSf2tLq1dO9MlVzwqBGzdSQZ5j2jXCqvygObcjHg6iUcMzHHvVAPbRJJQo9C2YXe0ClvSE6eM1t9q6INo1sOOpXKlE7ANUFLCUulBPlXyU6DeIsfixV2FM1MqEQlazk5JACCJVhmhaYqouNpwcr/yA5Jb5I94lkwDkjqfrHw5pEBV80a84FoBJXL5YjkzvKywXZysOEYppRWqKlA7WYLZFIp4YDVBCoBss9uUTXq2dgx9tBfqAgZwmgptxVWFH1lmF3g6LVDZjCZPd7YYh0WmvUc1oqzvM3ejLRYU0VA20+TaQ6LLfqyIqpzr2dPeTZVDchJC/kclHiu14gx9CnVZhTRepYjiNUFqcSkHL/P8uIlELMaMGo1Z8jFQVldKk3kcViKWYLJsQYaqbtNmvOKaP8p1mlKjkhUNOsP+Fqomwt90RVY0BVhGQNR1M8KZAW8iStDc+tml5DBYVp/AJH9dEFYPoGGVERUCl/4oOaZyu04KCCqjvWIFB5yo8jCkFLbgDtk4B4oChJqRAYXMJGZdxP4w+tRQTJVq0yHRgAFZpBCEy30hzStKrQm2zoVORzORUOpzhKT1kKxzWk/glV8gYcXXxPUnVIbhWGJ1yHn8r4/9FFmpSzSSvlGpuyBCjvT8mUyrSUQTksuxuzUMYOUn8llqhjYaosUaxBBRPMMiVLtFSIEiqpKTb+0FpAG88iqLROeWoalk5TXXNjXv9sY5PeXZ2BuqVLoNqhih9FCRf8hJQU9Tkg6/m2FqyuPzuscoq357IuE6qPXsU7emHTYpU3YzKhjlFKJyhTy1R47weorWcshZWDquMx/ZLhVUcgEUJ2K8jzBeT5MUicRU18VAtefIoR6gYV/Yxh9KTd9GxUTqhPw3be2oJA2No6xZoCLEsFWk9vBqJVQ8bZjg38cVKVxGla/APbp/2loMNyq15GN5xZAvsfQjrFrKDlqd7bIqbJpnNmDhdcYjXWPWOUyP9vUyO7cOupecJ3mfD8z5Kp5DDpaXIJEApPI5RIbhQOWReeGFplEvXpRrkebbAgItVzT/mkqmUp56/0y0czoZr2dFWayxJ4YHmfVJ8cWuUPruX0o/c/isAfZo/FNjPMyaAKpz8VAyqEYC7XdaU6aJMy+TxeCkJduVZeMYuM0QuOp60KHu8T+boVsRTPwLxe8aot5mecjtvMPkegntJTfUENp1UV2UTl0jmJKNp+b8+6cX5IVtWzICXzlUcfheLHSKT4FrLrOucdtvMFzWg2DSJEZWpkKTrDtGZS8oMX7VNmJev5oUBsIbdoMyeKgUylEUaQcymViFBnED1M0KYxo1IP9iOXnt6KfWMgUn3zlJqSCykKA+pS0x7bpz2VlyTHllkVeRoXNCQHYGrNdYruaezNCYp3oiJgWRf2TJ7tJORLnmkq5kKU9y0y2pfaKFVFgyoRaWDiowK1kYNnVArS+1QRWQpAxV1q4TVo3S+AFKDSpgRTP91n0iWBmlv23FVenTKgjkr1fAeBLOvJQymBYMHi0KpVD66QMofLsub3kG5GrKpFJrW89Xlirgb61M2Q4094dEHv5JBRrCocUiFCLdcrUqSvUDJ9YhX2VHUhR54H2i4cs5bzCdVY7NdmdT2V2sotawNBVeKC/2lxaL06NLWnqs4Pb7Y//CPYnD6S1kLE/OdWS9ozpxx/kbNsp9Yn6uSis3yVhYJHP6AqCJWMpSXbD6EwvKnAyov+kern7r6Vg/I3X8gJiYpAZP92YD31VOK6F6+S4ylxQVVJ//ugpovmhYrhqarhzfn+uk2wBtSwOBdh/wYHNc8J1QxKgu3ApoJRiRZvgy8Cq7lmSVbrjFDbE9YC4/5AJpBnwOutWfKkepp5c1aOxnd0mUUFG9UwBvS0Lqa0scXMdVHDs229r+Sppn1NtXDB1fNiK/iTwwJ1+jjtSpEgjFIGB1XhS8nMUjBq2KhISooqfnl0tQ1MC6EcCVS/fe3jV9AELhelkOnqVl1v7WC1zT3kXLljeKBi6ay7MKjNUtXLVkM4ANo/DYdT+yX/0hKqvNuJGavg/+GVAE4/aEiMnLteXBgLv/McN1rSeVpHbMqL3P1diuUyOh4MXqW+6ppOKPDM6iPa1sUpMqjCdaswOWhVKstideuc43MN+xKBmqNyd4dStQNObg7DkUQYQFCqsh2ppqWDosds7qa7P8/0vzE8oQq68C1Oa/FGMUoa9Tkus4hQ7ZI0Fdsuug0vkQI1jWAI8/5tI8T7nFAbv8sqt8PFU9QJkFhaWEEFSmfdmxYBwwuTrroHckTzslyKtwDmmgmL85IHqrINqaYlWGFTOadO82YxhEGG1VdF035k5i8ay73WPwM1XzJCwwkKSMaxynRifoTnWNCKKf5SKJzPJGpufs+DtlHyKif4xyITGFbFbC9dCyYGXyBQazCasXcukDB9UaV3sJzakUzl/n+IUmFTXYU3qXGhWjkyrPSfY/upk7HHikXjsehuveu6yFUWzVJo0KhLAyBBymWqTOXCb8Y1otVRRKjln7AqQx/UrFD5tOMOhphkxFkHbhKoawfKtHXS3dHYS6usi14/extQtWRaJlTeRvLowtuFPBeqR4bkqBpm25/Tsgg1XOwxYbihqoanaNC5BCi/A2KxNiEJuNW65pYi0SeSqAt1LBDrmMVSyZOzXurKTqDrN5Q9zK3RoDs4rNg9ExddjB1hAwdlR6Cm0hFQ4RluHdqyi+Qx6uaQOoBfA6HW/evJglCL+6MXcpqLLBDqpcgiZxikiDyPYdm6l666UOVl/AH7I+7fyn2QRgriB6UQrZKmWjftmmwY58orDNS6dQ2hm/YOB61sYiOKlt3GoxKuqgwrA/V+xv/pPMoGzg6NUAOHlAzGYjbXY2Pz/C9G0ER3DVBJz3ew04B6SxkkNPUIohC4FvzSyOrq78LIeFmA6lCUiijYYaErjDQKzQOC8kcVtbFCr+TYO567Qr50YQeUqiTTMqpJnYE65xYAqjYkmwp7KPwgW6KMuZ06CsM3e+wW0cltRFYNOC5UzUp9Cet/F8R4Diux1O6wvpIi5/MixZ6u7Nnz6guwCkoCVYf+B6oUuG6HEzhoPaaynw76q3egpiQrIMVq0wv9uqalAEAI1GJxa+TQsuuwQsahgEqdlC94dDKGeXPjVFp8Oo4M2ACqnuntGJ5aTyBNVxOY5vhstxofjlB0KL1fbTyPP/XzFVYhSaCyz46wC2YSIULFeHMGql1Gs7zUo7HteUrX9AGFlBFSDYN6/xaKdRiovz4cGzXI3p0G87N20x4fZrFA1fS93G+zlnIKo3CxLGiO5vxcWPOGTlTb/xcVKvycXyGZzd7gyLIqtCVrIpw86LKaX7cMcO1bGGdFISuq+kltR6rpMKiGc3Xk/hF06WJKxFBAnd4wAo9l7JViUWezcl7J9TqqVKgQ5X6ACpOI3NOm0DGe/Z7j85MwVwY96xaVf88vMVCJ6R1HbG2nuOt6Isz9B3JrjKLdJnT/2q2MrVrWKZta2r7XLwRqwciOjIwcyr6t54fE/vOVYhAUPQ1u5S38RjSjSo4qTaCJzsSm7sjyGqa8ra42AaiXVeJf0JCfxXatlnt9jw+qQFNMmmnV2k2Mig3/qXKLUbR9YaV4K9xPd56KKZzt+1JDoKLngUDtutk8+alnh9Hy67g+gHNEqLiRSCUvWz1xiziRihHgvK28ZZ+xz7TW2uK1PJz4HM3XeTS83jENgSbgXOsuLDbKB1huPwxqg4sJew0itXFLE9aWCdTi9qBqMqroeUDF46G5tx2quR1GpxrGUlU8/BrF4mFFDEboMaoWC6ya3luZF5AqNel/4AsHp+YPfuGjX7Or5xZ4B7Rkjn1ZSJp6s0Jz/yoY2tfkuWdZDAegnnaZ4KVYa+fWRi8u7s+a2/ZQRvgfww6WCdQFs8jK7o4MRff73L9QdPwRHsZWLqoFnB53imX/3NZJHtid+t4vTr/03d+0z9QactKz/rv+H/tK7kKzwcfNWJJeykUm013goIIJbk2koubAoPHZOxigIHG/VjSOUnEOakNZtPj2CyoekjKicKbGUcXh4D0Bv/25cPjPWmDV9D0LcdyK6Oy++EHCdnrq4BfPVStNSUL+hv/XftBY6l2vZI1Fv297oKJp9tYotW7vcCqFElb+HqgUUPm1IYhUw/QIpWlghIbiFPuQ6mnTMI2eHSOul3+48rpvUPx+sxVsAGp80P9jv2xdCNmj5ebM+s1u9+ZCaAwo8rG2aElz7IVbA9Vigxr1QRO+evgf4VSU5zJQyaI6P5RZX75IXcDoWeo2pT8KUu2eCl/QmBEFlXpFvTnD8x+UzLTft1bPiK3V5f8OP3v4IUbEf7ro12jWVzEJtuofeTh4rr7igVq0P5vbCZT1gFINI2T999VZqi9SUUnKQL3ACiCHMPxjqmb4aRQraxQwcpp0EdtBYSyfCoNaCoNaIFOyJSTQ9POhMuT5/xP15zU2rWN+z0HMvKY+5S/XhfQuYxrYGftr/+Cj/8UXjhx86As//JkfY+akvyQAzT2iNQ3O2uJOQC374YEyGyGwvaEqkSpE6hYDFVn/ZdySqSHk/AM9VYbXrzgebij1qGzJOjx3tWuytikJU8N+WLzQfxZt7vz9xFLrDLJWf7Bn/gVgZJ/dMzW2QJK2vn7Obv34h0empuZ/8Xvf+97F//57F/E+nnxwBXX+ZDgkqL1NgGoE5VSDMD3lI79axVBUo7gDUH1VpcNK5Z15b2fnhjJQZRrK/4IvMx2FXHkBWtE2s5+W6CR39DEZ1ALzebrfEzfnd3te+vVEbqO6MENBVAQT7Y/ueWkTPLHUtTs//tmpPdO/+O3XPzjPqYJfxvwHIA9a2BqGcIoMam57TINK+i5CucFU8sHDKXwrlfc7otz5FYTTfmY4YT+PUpcxloi2+QShEnPu04FmHsssy14qV89Lgvt//oMh5v/gPEM1MVP723v2vIR0tX1+z8XEwuLSmt16EkOKX33+9Su9bDZ1ErCuLdEYFh/UxW1BLZ86tWn5pbGYCuDucCiVx/3Q/QTqL7CqumGU/V1cCyj1DRPZ0RXbBxUtaiGxmslQ4I9aTkGu44xQa58Umr8cYprpT1of/xvze1616hdgTs1/+Q8rfzy150/La63WR2BZz7/0ydf7vPWpn2lV7dWa60igTvTdWpujarry5qlTZc8zxmSGAkUjvEYqfVtQkfUjdwqwnqaQmnl8KG3UPqhW11SMtS52jxXErB+IVRnVo5PwVqhtvSCYv+guviQI9eciUuUrqNz7ydTvz3xR/BnEUhPrH/ghPl/8Si6s0/aEAD7yYJUaV3xQUSqf6xPof0r7BDD99KlTjZzwISiLywbSOjsWqqpjgFDJ9b/A4mlHhlKc5rO/lS3q7lfP206gi0qEqh+uvop5cCY1TRcEoWIc6vP8Vcq/HH3h52ky4uYbgfr6SqM7TZBaX4l4LK9/OezircIQ8EE134gH1dpE+dQy1Xyd+vSpTQ4pzQSk4SlOyKfSB4OqM0IlUF+BghvOutTpNd+kGkOjk33wLUapYtqPfkmm1UOTtE5D5zN92TV3chzUv6j3svMHqW7/6z5Nzltv/Oyeiz+wclH4r1jh3522Gq2q4bX6o54qF6P/x7Y0RVPqiUbj05/+dIPNtsRBCQehSeMfdgKqKhMqRCpKfofUSQXjP8vfdA4R+vOo/ymyuRQkN6mRH6gunOLl/2NH78uy2YiYlM5BXclxmfr3GzF2yPxLuYVv+d+9tPnC//jxnPV7Ucd6/sBLkduM0Z4VgSrs4pVyhFQp65tbZvnyrcb3rxKofDroRAOxsoK062HQKQhQA0K9gIEa9geGNeyvWCl7lIrizLN2kWFKyOnjZAthyY4or96aXIZhTTL1hgdqjkCabvxcbKym/oYP4XzijQVc+gd7nvQD60qEcrEqstwSqspmNpWEqjVRprIkhqmqpTOZrU83+HTmRrmCtTMpXuG1TUhV0YscVLV46eoIB3WNmkenhtWcitJ0AaphfGHPQzZPmBCo/8opFmnalpndGqNi+1OTo9BdPvdTEskigThfjgX1pUbbJ+AvjyFyVb/SKySs/znyyKskjE8LUgWoC5YkAMbqsAUEphrbopHJo/EDVNqYgOHmclBDlmoc+8MX1wlUqP5lTqj3nwZL2sNZlSxCf5bQ/iv/OzWrjjOhSqO7QagOmxDnqJu0cOfofRk+clIoEpqHipt7Jfd7cTowt/hV/5s/bXatH/TSwXwudzF6K9jI1HOux/+sBUCQKgrXyx7vK2zFW1rdwsjrBjDtoouQRlcJ/tcHyVP4jdRsh3607Igg1C5c4qGVpu15FnWudWGnkov2INdFgFQHoQK4lQbW3Rk6xaxOTY48xqSqoNTqgmVBVf1GLk6mXrQWfN1/JdFefD7mj/9e7uOR35wui9m+ghfA/2MeqoxmPUyPHWPbCDNW7lSjcarMlqOZXojX7Nvyz0+RgUo9+RzT+7co1Ta82TQHO47Jq+oumBT1OGmylR00rtyhTbNf+yQiHHjLzmOwXEbvG8m6jgcqJfRy1rf3XJmYCBj7iofS8/UFX6R+2+r+VszfhoXw70W5f0wGFWumzC4b90Hl1TT2orysee09hCl8g8apiYkGrQKzxTJKtozaGESpQH0ceWo4qCO+RDU6J/YMbzBlzRCpk9OMUsH/jk6gQk0B0/PTUz8BhcxgD1RpeWxsdOQqihUKHm8iuZyzfmOqnAtszZ988orInTTewMtNnTj510m8dmPIYD43UY6S+Et8CrXnVFEGjGYu5yY8TNWgDVVTtnKbEzms5+zQPGVTjNPT5U1v8dxPoGJR1JzA9P4LCDKeHea8vxMd1LyTVN2sMMf3Wbuo0yYEcD+KpOiRL6MFr3yT5pYunhoZ2QJFCNMcARWC4OLHcx8PKDWXe36eGaanvz7FNt2tTe355OLN+Tjmz/1Wr5Blh9Q/hE+RRgRXGlubeAM5mnqzjKm5mthEpGgNDAOhhXzUmoklfoHXsg3/w/4dV3XzFQ/Tq1BSD04PeyNNpcE0FXPS0KzGNqHotBOdQ/EXNBmpWQOs2adGDmVs1wMV2X42M37C8vXN9Mdx8a9PQ4t/9m/Oo6QI56Pz1s0LMZofkETp9yt8Y/wSFt0X2cHmEBvjx5fB4lh12JhjlgkrbNfV01ixUKktdFC4RUOXWVRCxC3hHfUfRUs1IYgXZUcFqCMVTBaeGvYEdQguEgCftU+KFmBaMIGofsfTNFM/GANUp2vQWK8sj25lWQoZ1nIRs81oyPmi8AKYVMydmsh98srz1gxM/49Qgv+HF60XTvfoqSu4Uf9tRBQ9n5vge1bIpOKgoqgIo8a166dyjWZ7RWwC4eNqaUXIzBOYg4E3AtXPFKyg1kH8T1VNRQnT+xEnHuasP5H868CsQoyvXGER2vk1m21CMu2zIZ2C6212wViX5pb3w6ejBbVFGADoR7Oan514XSJVGidTzl347jRqJ6HNpl/NrZ3OTUXVPJ4UJt9f/DjHFG0U5P0LUsX+PtTjq2yBqh3eVoNutxpfvEBOSkEcEgNFNmNZ70Oo9BsBpjBoWsPfSkFlo+YFoLrASZUJAOxBCrHE/FfGaD7UtQ5RSZEEHj7Bc6guToBYF7/f8AXARRp7hOcufI5CpF9DtO+lcuUT1k/Cf/PnAXvIZ/irl3ICU2vBJ1QmVy8huwhEaUgtHgitARILQmgRIo9KMlLl08r0WOtfeZrdkABTjOJqfWH4mO6ZfoRcfAupPT5F4AQopWBHHYzX6aIvVHEFRWI4lpbHZZ1ZhLgrL2yd+vlXhax/PlcmUNv/wxXft6p8Ipf7dlSgesGVqYvPX/kbH+dj0nJsKIXtY8p9OpeFrfm3BKFPrDYbJcCGCtgln1QLBV9V6dGNVJQwMnyjn+jUXtkFOmW0CgkwN4b5B9z0ebJFzTvTvSGShkuSVFysyZd4nrlQbkw0FpYbEx//NldsP2AjutpN63UO6yebJRiUuZcCC+Av6BncZZj/ea7wGXWzs1Y1itKh2d4CUbqZxZAEYINDaPeCYYsAGseVZtf7S750ab0fmVu+LTUyMgcdtUuYgjjRrvNCOfE37UemuQRw4zzhb2+0GLcVuRjjvIfp/fATNxe6i41Tm3//Vea3EkBvLKIO5f/4XwH0Jxezy0SHEz/5K36jXi2TRP3bRKXPl7m08DEdw1xFn075Drqi4X1TjCwBY0MV+cYFlykCMgbZMWkFsVjsLq0jpSyx+ZiP6Su2fX6HFSn/P8Es+GMBH6ShAAAAAElFTkSuQmCC";
		const WHALE_PAIN_DATA_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAVQAAAFUCAMAAABMTDSHAAADAFBMVEUAAAD9+vk6Z7EvVplCbLRZhc0LJVNJc7ovW6Pv6O8DGkdPesQHFTZpldgoQ3oTNW0ACiwoSorV2Opji8+Ju/PHx9QKLGOQxvguN0skO28CBRcbR4zHy+RsnOLyxsxzo+dGSFO0ucvU1NmpqK8lKDYYIjqJh45zt/NoaHCV1Pzw1tlSWWrc4fFNZpS2tbkXFxcoKCdyeYuRmKojK0U7QlM3NjaWlZl1dHq5w9ZqhrBTVFtDW41IR0gxMzuOqMl3pNlJSUsZMVsTPIPzvcQ5ODml2PnOt7rs3eVHR00dQHtHSVNVVVZ3lbVcktaPtdXPqa1VVFgTFBuZo7VXgrqtx+tJSU2lqsV8wfhUVFhERERbYnFHSE86UnlQUlp4gpM9cblRU1ljfK1ZcpXQvcOBquY2OUZmbIY7YZqqlpuu4/1kXGU3NjqnnKS0vOGHfIZYWmJUU1UaU5ZZW2Ebg+rutrvqq7MxdsY7PEOHi6esio5ETGNcXGEmKTdXWWSFd3w4OkREPUc7PEM2NjuqaW62dXrn4d4ulO1mZWpiYmTOfYTOh48XfOQ9Qk7Il5o3NzwyNDyTVFmCnMgjJSoWackyo/ciHSrIanE9PEArhde0e4BAPkF6stzPnaMADkEiie5iWFymTFO+8v2Xw9wsKyxdXmAhIB9jYmMgHh7O+/yWS1FFq/M5bsGLPkZxcnN7fH+PaW5iYmWBgH9jY2emU1utW2I/PkEwMz5Pl+JAPz5APj1eYWdBPj2hoa0+QUnnnaRUVFRBQD5APkJAP0BAP0JfYF9dYGIcHiVfgZ07sf9aseY2kNZhTlh1dHc5gr7oiY6Fh4ycnKY/Q0s+QEae4f+tgX89PUCioZ6+09/aeH4pKzsmKS/CwL/Qz9bCwM/d4N8fIzMfIicbftpdXWARXbkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD5v6NyAAABAHRSTlMA/v/+///+///+/v/+//7+/v/+///+/v/9/v7//v////v+//7+/v7//////f/+/gIK/v7++hP+/////f8t/f//Tv7//y3///+Q/85N/////23/////bP//jxr+q//L//+x/////9L//////03///+vN/+P/////5X///92zNL/qv91cP////+qdP///87/j63//3X/////S///Mf//////////J1UGSgf//////76K/4//M///Ns7/FSTIV42y/x4qo2NF/6t5//////9f//9dg51O//8U////pZH/vM7/xZX/Lv8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAy32l+wAAZG1JREFUeNrtvQdj21aaLhwRIECAIAGSBgVSssRuWRQlUZJVLbnEJXZsJy5xEidxepkkk+l9Z6ft1N3Zcrfv3d739t7v/Xrvvfc/8j3vOQfAAQhSsk1lnInPjO1YkiXywXPeXh577NF5dB6dR+fhOkvLJ8/9yekfPP30D86dO3liaekRIg92Tpw8/dwLNc9rtcXxPO/yc6dPnngEzX0S9MQzL3kty7LM+NFWvZeefITrvSN68rlaAKhl0p8ajgCV/uMRrvd4nv8sIUpwOpZp5wtKSqWj45ei5DUTnwOu7drTj2A94Fk++YrHETW1CvAEoCn/qHoWR+/lNcIVdH16+RFgB7j3T9bahJdjlgupEM3IeRnAqsAVX2atPfkIs/3OkzWioGVpBVUdAik/xFcNyJvac4/IOvKcfKVtEUkrEJ+pfY+u72iOplmXH0nWEcL0uVWIUscsqHrqYCer5x3w2jv5CLzhN59Bqh+EpQGsO5ZVfiRYhymoz7Zw8wFpNtD0DNuMwk5miMpKZVXT0UzvkQRIskxfAk2tippVmd2kpmCP2raw9zVm+Nt2AdjGRIOqZnXNAVcfoTqooTyiqQJLiQGat5nvZLHD/8v3pYAsNFSI6hchWDVIgJcexVli5zRhWlbJsFcLdpnjiejJz7x5+fJfw/kP37z85s947TaHWLOjuOoqPmY9/QjGyPnNVUCVh7OkK4yiVtt780vvnVs+EWHf8vJvvveN3baPqyQHsj0Sq49MAPm8R0AqaZC0TBRdffNb/3h5eOjqvV8EsPgHcLhCVAsQqy89QjI8/14bEKlptUKBEs175tx+0nH5d77RYnQNYdWhy9qPqBqap7j7mq7aBKn3rXMH0zfLz3gUqCorvgxQIZS3H+kqcc55wFQt0L33/tt78OKX3/uFNhkDUP+MqhWrrD1yAQQ2NWCqlAHp2ul7JNrS6TeJrQX1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";
		//#endregion
		//#region src/client/WidgetMenu.tsx
		const DEFAULT_MENU_CONFIG = {
			soundMode: "cute",
			showProgress: true,
			showBubble: true,
			showBalance: true,
			showPeak: true,
			slingPower: 20,
			ecoMode: true,
			frost: 4,
			panelOpacity: .82,
			lowBalance: 10,
			showWorkState: true,
			realtimeBalance: false,
			showInfo: false,
			followThreshold: 180,
			infoFrost: 4,
			pauseOnThinking: true,
			widgetScale: 1,
			infoScale: 1,
			linkScale: false,
			gravityMode: false,
			ropeMode: false,
			ropeK: 80,
			ropeDamp: 3,
			ropeMax: 150,
			bounceE: 1,
			groundFriction: .95,
			deepSleep: true
		};
		function WidgetMenu({ x, y, config, onChange, onResetPosition, onSleep, onClose, providers, onSwitchProvider, switching }) {
			const ref = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				const onDown = (e) => {
					if (ref.current && !ref.current.contains(e.target)) onClose();
				};
				const onKey = (e) => {
					if (e.key === "Escape") onClose();
				};
				window.addEventListener("pointerdown", onDown);
				window.addEventListener("keydown", onKey);
				return () => {
					window.removeEventListener("pointerdown", onDown);
					window.removeEventListener("keydown", onKey);
				};
			}, [onClose]);
			const menuW = 210;
			const left = Math.max(8, Math.min(x, window.innerWidth - menuW - 8));
			const top = Math.max(8, Math.min(y, window.innerHeight - 600));
			const set = (patch) => onChange({
				...config,
				...patch
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "wg-menu",
				style: {
					left,
					top,
					width: menuW,
					"--wg-panel-alpha": config.panelOpacity
				},
				ref,
				onClick: (e) => e.stopPropagation(),
				onContextMenu: (e) => e.preventDefault(),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "wg-menu-title",
						children: "API 提供方"
					}),
					providers === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "wg-menu-item wg-menu-muted",
						children: "加载中…"
					}) : providers.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "wg-menu-item wg-menu-muted",
						children: "未配置提供方"
					}) : providers.map((p) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: `wg-menu-item${p.active ? " wg-menu-active" : ""}`,
						onClick: () => {
							if (p.active || switching) return;
							onSwitchProvider(p.id);
						},
						title: p.active ? "当前使用中" : switching === p.id ? "切换中…" : "点击切换为此提供方",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `wg-menu-radio${p.active ? " on" : ""}` }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "wg-menu-col",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [p.name, switching === p.id ? " …" : ""] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "wg-menu-balance",
								children: p.balance === null ? "余额未知" : `¥${p.balance.toFixed(2)}`
							})]
						})]
					}, p.id)),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { className: "wg-menu-divider" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "wg-menu-title",
						children: "音效"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wg-menu-item",
						onClick: () => set({ soundMode: "cute" }),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `wg-menu-radio${config.soundMode === "cute" ? " on" : ""}` }), " 可爱合成音"]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wg-menu-item",
						onClick: () => set({ soundMode: "duck" }),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `wg-menu-radio${config.soundMode === "duck" ? " on" : ""}` }), " 鸭叫"]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { className: "wg-menu-divider" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wg-menu-title",
						children: ["弹弓发射力度 ", /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "wg-menu-power",
							children: ["×", config.slingPower]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "wg-menu-slider-row",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: "wg-menu-slider",
							type: "range",
							min: 5,
							max: 60,
							step: 5,
							value: config.slingPower,
							onChange: (e) => set({ slingPower: Number(e.target.value) }),
							title: "中键拖拽松手时的发射力度（拉开距离 × 力度）"
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { className: "wg-menu-divider" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wg-menu-title",
						children: ["毛玻璃强度 ", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "wg-menu-power",
							children: config.frost === 0 ? "关" : `×${config.frost}`
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "wg-menu-slider-row",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: "wg-menu-slider",
							type: "range",
							min: 0,
							max: 16,
							step: 1,
							value: config.frost,
							onChange: (e) => set({ frost: Number(e.target.value) }),
							title: "进度条底板的毛玻璃模糊强度（0 = 关闭，更省资源）"
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { className: "wg-menu-divider" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wg-menu-title",
						children: ["信息跟随阈值 ", /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "wg-menu-power",
							children: [config.followThreshold, "px"]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "wg-menu-slider-row",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: "wg-menu-slider",
							type: "range",
							min: 60,
							max: 360,
							step: 20,
							value: config.followThreshold,
							onChange: (e) => set({ followThreshold: Number(e.target.value) }),
							title: "信息面板与角色距离超过该值就脱钩独立（越小越容易脱开）"
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { className: "wg-menu-divider" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wg-menu-title",
						children: ["面板模糊 ", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "wg-menu-power",
							children: config.infoFrost === 0 ? "关" : `×${config.infoFrost}`
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "wg-menu-slider-row",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: "wg-menu-slider",
							type: "range",
							min: 0,
							max: 16,
							step: 1,
							value: config.infoFrost,
							onChange: (e) => set({ infoFrost: Number(e.target.value) }),
							title: "信息面板高斯模糊强度（0 = 关闭；越高越模糊、GPU 越高）"
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { className: "wg-menu-divider" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wg-menu-title",
						children: ["底板透明度 ", /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "wg-menu-power",
							children: [Math.round((1 - config.panelOpacity) * 100), "%"]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "wg-menu-slider-row",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: "wg-menu-slider",
							type: "range",
							min: 0,
							max: 80,
							step: 5,
							value: Math.round((1 - config.panelOpacity) * 100),
							onChange: (e) => set({ panelOpacity: (100 - Number(e.target.value)) / 100 }),
							title: "进度条底板的透明度：拉得越高越透，透出挂件背后的页面内容（上限 80% 以保证文字可读）"
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { className: "wg-menu-divider" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "wg-menu-title",
						children: "显示模块"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wg-menu-item",
						onClick: () => set({ showProgress: !config.showProgress }),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `wg-menu-check${config.showProgress ? " on" : ""}` }), " 上下文进度条"]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wg-menu-item",
						onClick: () => set({ showBubble: !config.showBubble }),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `wg-menu-check${config.showBubble ? " on" : ""}` }), " 彩蛋气泡"]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wg-menu-item",
						onClick: () => set({ showBalance: !config.showBalance }),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `wg-menu-check${config.showBalance ? " on" : ""}` }), " 余额信息"]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wg-menu-item",
						onClick: () => set({ realtimeBalance: !config.realtimeBalance }),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `wg-menu-check${config.realtimeBalance ? " on" : ""}` }), " 实时余额刷新(10秒)"]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wg-menu-item",
						onClick: () => set({ showPeak: !config.showPeak }),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `wg-menu-check${config.showPeak ? " on" : ""}` }), " 峰谷提醒"]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wg-menu-item",
						onClick: () => set({ showInfo: !config.showInfo }),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `wg-menu-check${config.showInfo ? " on" : ""}` }), " 信息面板"]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wg-menu-item",
						onClick: () => set({ pauseOnThinking: !config.pauseOnThinking }),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `wg-menu-check${config.pauseOnThinking ? " on" : ""}` }), " 思考时暂停信息面板"]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wg-menu-item",
						onClick: () => set({ ecoMode: !config.ecoMode }),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `wg-menu-check${config.ecoMode ? " on" : ""}` }), " 省电模式（空闲暂停动画）"]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wg-menu-item",
						onClick: () => set({ deepSleep: !config.deepSleep }),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `wg-menu-check${config.deepSleep ? " on" : ""}` }), " 挺尸模式（长期空闲会睡着）"]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wg-menu-item",
						onClick: () => set({ showWorkState: !config.showWorkState }),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `wg-menu-check${config.showWorkState ? " on" : ""}` }), " 工作状态徽章"]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wg-menu-title",
						children: ["挂件大小 ", /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "wg-menu-power",
							children: [Math.round(config.widgetScale * 100), "%"]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "wg-menu-slider-row",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: "wg-menu-slider",
							type: "range",
							min: .6,
							max: 1.5,
							step: .05,
							value: config.widgetScale,
							onChange: (e) => set({ widgetScale: Number(e.target.value) }),
							title: "挂件整体大小（60%~150%，默认100%）"
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wg-menu-title",
						children: ["面板大小 ", /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "wg-menu-power",
							children: [Math.round((config.linkScale ? config.widgetScale : config.infoScale) * 100), "%"]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "wg-menu-slider-row",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: "wg-menu-slider",
							type: "range",
							min: .6,
							max: 1.5,
							step: .05,
							value: config.linkScale ? config.widgetScale : config.infoScale,
							onChange: (e) => set({ infoScale: Number(e.target.value) }),
							disabled: config.linkScale,
							title: "信息面板大小（60%~150%，默认100%；锁定时随挂件）"
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wg-menu-item",
						onClick: () => set({ linkScale: !config.linkScale }),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `wg-menu-check${config.linkScale ? " on" : ""}` }), " 锁定角色与面板大小同步"]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wg-menu-item",
						onClick: () => set({ ropeMode: !config.ropeMode }),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `wg-menu-check${config.ropeMode ? " on" : ""}` }), " 绳摆拖拽（弹性绳挂鼠标）"]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wg-menu-item",
						onClick: () => set({ gravityMode: !config.gravityMode }),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `wg-menu-check${config.gravityMode ? " on" : ""}` }), " 重力模式（松手落地）"]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wg-menu-title",
						children: ["弹性系数 ", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "wg-menu-power",
							children: config.ropeK
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "wg-menu-slider-row",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: "wg-menu-slider",
							type: "range",
							min: 20,
							max: 200,
							step: 5,
							value: config.ropeK,
							onChange: (e) => set({ ropeK: Number(e.target.value) }),
							title: "弹性绳弹簧系数（20~200，越大越硬）"
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wg-menu-title",
						children: ["阻力系数 ", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "wg-menu-power",
							children: config.ropeDamp
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "wg-menu-slider-row",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: "wg-menu-slider",
							type: "range",
							min: 0,
							max: 10,
							step: 1,
							value: config.ropeDamp,
							onChange: (e) => set({ ropeDamp: Number(e.target.value) }),
							title: "空气阻力（0~10，越大摆动收敛越快）"
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wg-menu-title",
						children: ["弹性上限 ", /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "wg-menu-power",
							children: [config.ropeMax, "px"]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "wg-menu-slider-row",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: "wg-menu-slider",
							type: "range",
							min: 50,
							max: 300,
							step: 10,
							value: config.ropeMax,
							onChange: (e) => set({ ropeMax: Number(e.target.value) }),
							title: "弹性绳最大伸长量（50~300px），超过后刚性拉住"
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wg-menu-title",
						children: ["反弹弹性 ", /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "wg-menu-power",
							children: [Math.round(config.bounceE * 100), "%"]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "wg-menu-slider-row",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: "wg-menu-slider",
							type: "range",
							min: .1,
							max: 1,
							step: .05,
							value: config.bounceE,
							onChange: (e) => set({ bounceE: Number(e.target.value) }),
							title: "角色反弹弹性（10%~100%，1=撞墙完全不损失速度）"
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wg-menu-title",
						children: ["地面摩擦 ", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "wg-menu-power",
							children: config.groundFriction.toFixed(2)
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "wg-menu-slider-row",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: "wg-menu-slider",
							type: "range",
							min: .8,
							max: .99,
							step: .01,
							value: config.groundFriction,
							onChange: (e) => set({ groundFriction: Number(e.target.value) }),
							title: "重力模式落地滑行的地面摩擦（越小越滑，越大越涩）"
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { className: "wg-menu-divider" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "wg-menu-item",
						onClick: onResetPosition,
						children: "↺ 恢复默认位置"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "wg-menu-item",
						onClick: () => {
							onSleep();
							onClose();
						},
						children: "😴 立刻哄睡"
					})
				]
			});
		}
		//#endregion
		//#region src/client/WhaleWidget.tsx
		const EMPTY_STATE = {
			balance: null,
			currency: "CNY",
			todayUsage: 0,
			contextPct: 0,
			contextTokens: 0,
			contextLimit: 128e3,
			lastTurnCost: null,
			peakLow: null,
			subagentRunning: 0,
			sysInfo: {
				memPct: 0,
				memUsed: 0,
				memTotal: 0,
				cpu: 0
			}
		};
		/** 本地兜底配置 key（宿主 api/config 不可达时使用）。 */
		const CONFIG_KEY = "whale-girl-config";
		/** 中键弹弓功能提示气泡（只提示一次）。 */
		const SLING_HINT = "悄悄告诉你：按住中键拖拽再松手，我会像弹弓一样发射！右键菜单可以调发射力度哦～";
		const WIDGET_W = 170;
		let ropeOverlay = null;
		function drawRope(x1, y1, x2, y2, ropeLen, ropeMax) {
			if (!ropeOverlay) {
				const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				svg.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:2147483646";
				const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
				path.setAttribute("stroke", "rgba(90,150,255,0.9)");
				path.setAttribute("stroke-width", "3.5");
				path.setAttribute("stroke-linecap", "round");
				path.setAttribute("fill", "none");
				svg.appendChild(path);
				const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
				ring.setAttribute("r", "4.5");
				ring.setAttribute("fill", "none");
				ring.setAttribute("stroke", "rgba(160,200,255,0.9)");
				ring.setAttribute("stroke-width", "2");
				svg.appendChild(ring);
				document.body.appendChild(svg);
				ropeOverlay = {
					svg,
					path,
					ring
				};
			}
			ropeOverlay.svg.style.display = "block";
			const dist = Math.hypot(x2 - x1, y2 - y1);
			const t = Math.max(0, Math.min(1, (dist - ropeLen) / Math.max(1, ropeMax)));
			const lerp = (a, b) => Math.round(a + (b - a) * t);
			const col = `rgba(${lerp(90, 255)},${lerp(150, 130)},${lerp(255, 80)},${(.75 + .2 * t).toFixed(2)})`;
			const wdt = (3.5 - 1.5 * t).toFixed(2);
			const now = performance.now();
			const tremor = t > .7 ? Math.sin(now / 1e3 * 40) * 1.2 * t : 0;
			const path = ropeOverlay.path;
			if (dist >= ropeLen - .5 || t > 0) {
				const mx = (x1 + x2) / 2 + tremor;
				const my = (y1 + y2) / 2 + tremor;
				path.setAttribute("d", `M ${x1} ${y1} L ${mx} ${my} L ${x2} ${y2}`);
			} else {
				const sag = Math.min(90, (ropeLen - dist) * .6);
				const mx = (x1 + x2) / 2;
				const my = (y1 + y2) / 2 + sag;
				path.setAttribute("d", `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`);
			}
			path.setAttribute("stroke", col);
			path.setAttribute("stroke-width", wdt);
			ropeOverlay.ring.setAttribute("cx", String(x1));
			ropeOverlay.ring.setAttribute("cy", String(y1));
			ropeOverlay.ring.setAttribute("r", String(4.5 + t * 1.5));
		}
		function hideRope() {
			if (ropeOverlay) ropeOverlay.svg.style.display = "none";
		}
		const WIDGET_H = 180;
		/** 松手速度（px/s）超过此值进入甩抛弹跳模式。 */
		const FLING_SPEED = 800;
		/** 信息面板（独立窗口）尺寸。 */
		const INFO_W = 132;
		const INFO_H = 66;
		/** 信息面板圆角矩形碰撞箱的圆角半径（与视觉 border-radius 一致）。 */
		const INFO_RADIUS = 10;
		/** 角色中心距屏幕水平边超过该值则不吸附（屏幕中间保持自由状态）。 */
		const EDGE_SNAP_MARGIN = 120;
		/** 信息面板独立状态维持时长（ms），之后尝试回归。 */
		const FREE_MS = 4e3;
		/** 信息面板当前矩形（共享给角色甩抛做障碍反馈）。 */
		let __wgInfoGlobal = null;
		/** 矩形(rx,ry,rw,rh) 与圆(cx,cy,cr) 是否相交。 */
		function circleRectHit(rx, ry, rw, rh, cx, cy, cr) {
			const ix = rx + INFO_RADIUS;
			const iy = ry + INFO_RADIUS;
			const iw = rw - 20;
			const ih = rh - 20;
			const nx = Math.max(ix, Math.min(cx, ix + iw));
			const ny = Math.max(iy, Math.min(cy, iy + ih));
			const dx = cx - nx;
			const dy = cy - ny;
			return dx * dx + dy * dy <= cr * cr;
		}
		/** 面板矩形与角色圆碰撞时的法线（圆中心 → 面板最近点方向 = 面板推开方向）；null=不碰。 */
		function panelRoleNormal(px, py, pW, pH, cx, cy, cr) {
			const ix = px + INFO_RADIUS;
			const iy = py + INFO_RADIUS;
			const iw = pW - 20;
			const ih = pH - 20;
			const qx = Math.max(ix, Math.min(cx, ix + iw));
			const qy = Math.max(iy, Math.min(cy, iy + ih));
			let nx = qx - cx;
			let ny = qy - cy;
			const d2 = nx * nx + ny * ny;
			if (d2 > cr * cr) return null;
			if (d2 === 0) {
				nx = cx < ix + iw / 2 ? -1 : 1;
				ny = cy < iy + ih / 2 ? -1 : 1;
			}
			const d = Math.hypot(nx, ny) || 1;
			return {
				x: nx / d,
				y: ny / d,
				depth: cr - d
			};
		}
		function normalizeConfig(o) {
			const any = o && typeof o === "object" ? o : {};
			const power = Number(any.slingPower);
			return {
				soundMode: any.soundMode === "duck" ? "duck" : "cute",
				showProgress: any.showProgress !== false,
				showBubble: any.showBubble !== false,
				showBalance: any.showBalance !== false,
				showPeak: any.showPeak !== false,
				slingPower: Number.isFinite(power) ? Math.min(60, Math.max(5, power)) : 20,
				ecoMode: any.ecoMode !== false,
				frost: Number.isFinite(Number(any.frost)) ? Math.min(16, Math.max(0, Math.round(Number(any.frost)))) : 4,
				panelOpacity: Number.isFinite(Number(any.panelOpacity)) ? Math.min(1, Math.max(.2, Number(any.panelOpacity))) : .82,
				lowBalance: Number.isFinite(Number(any.lowBalance)) ? Math.max(0, Number(any.lowBalance)) : 10,
				showWorkState: any.showWorkState !== false,
				realtimeBalance: any.realtimeBalance === true,
				showInfo: any.showInfo !== false,
				followThreshold: Number.isFinite(Number(any.followThreshold)) ? Math.min(360, Math.max(60, Math.round(Number(any.followThreshold)))) : 180,
				infoFrost: Number.isFinite(Number(any.infoFrost)) ? Math.min(16, Math.max(0, Math.round(Number(any.infoFrost)))) : 4,
				pauseOnThinking: any.pauseOnThinking !== false,
				widgetScale: Number.isFinite(Number(any.widgetScale)) ? Math.min(1.5, Math.max(.6, Number(any.widgetScale))) : 1,
				infoScale: Number.isFinite(Number(any.infoScale)) ? Math.min(1.5, Math.max(.6, Number(any.infoScale))) : 1,
				linkScale: any.linkScale === true,
				gravityMode: any.gravityMode === true,
				ropeMode: any.ropeMode === true,
				ropeK: Number.isFinite(Number(any.ropeK)) ? Math.min(200, Math.max(20, Number(any.ropeK))) : 80,
				ropeDamp: Number.isFinite(Number(any.ropeDamp)) ? Math.min(10, Math.max(0, Number(any.ropeDamp))) : 3,
				ropeMax: Number.isFinite(Number(any.ropeMax)) ? Math.min(400, Math.max(40, Number(any.ropeMax))) : 150,
				bounceE: Number.isFinite(Number(any.bounceE)) ? Math.min(1, Math.max(.1, Number(any.bounceE))) : 1,
				groundFriction: Number.isFinite(Number(any.groundFriction)) ? Math.min(.99, Math.max(.8, Number(any.groundFriction))) : .95,
				deepSleep: any.deepSleep !== false
			};
		}
		function loadLocalConfig() {
			try {
				const raw = localStorage.getItem(CONFIG_KEY);
				if (!raw) return DEFAULT_MENU_CONFIG;
				return normalizeConfig(JSON.parse(raw));
			} catch {
				return DEFAULT_MENU_CONFIG;
			}
		}
		function WhaleWidget() {
			const rootRef = (0, react.useRef)(null);
			const [config, setConfig] = (0, react.useState)(loadLocalConfig);
			const [pos, setPos] = (0, react.useState)(() => {
				const w = WIDGET_W * config.widgetScale;
				const h = WIDGET_H * config.widgetScale;
				return {
					x: Math.max(8, window.innerWidth - w - 8),
					y: Math.max(8, window.innerHeight - h - INFO_H - 42)
				};
			});
			const [infoPos] = (0, react.useState)(() => {
				const ws = loadLocalConfig().widgetScale;
				const rw = window.innerWidth;
				const rh = window.innerHeight;
				const rx = rw - WIDGET_W * ws - 8;
				const ry = rh - WIDGET_H * ws - 8;
				return {
					x: Math.max(8, Math.min(rw - INFO_W - 8, rx + WIDGET_W * ws / 2 - INFO_W / 2)),
					y: Math.max(8, Math.min(rh - INFO_H - 8, ry + WIDGET_H * ws + 12))
				};
			});
			const [pressed, setPressed] = (0, react.useState)(false);
			const [dragging, setDragging] = (0, react.useState)(false);
			const [flinging, setFlinging] = (0, react.useState)(false);
			const [bounce, setBounce] = (0, react.useState)(false);
			const [bounceAxis, setBounceAxis] = (0, react.useState)(null);
			const [petted, setPetted] = (0, react.useState)(false);
			const [petKey, setPetKey] = (0, react.useState)(0);
			const [state, setState] = (0, react.useState)(EMPTY_STATE);
			const [bubble, setBubble] = (0, react.useState)(null);
			const [painOn, setPainOn] = (0, react.useState)(false);
			const [menu, setMenu] = (0, react.useState)(null);
			const [providers, setProviders] = (0, react.useState)(null);
			const [switching, setSwitching] = (0, react.useState)(null);
			const [sling, setSling] = (0, react.useState)(null);
			const [ecoIdle, setEcoIdle] = (0, react.useState)(false);
			const [sleeping, setSleeping] = (0, react.useState)(false);
			const sleepingRef = (0, react.useRef)(false);
			const eyesTimerRef = (0, react.useRef)(0);
			const trailLayerRef = (0, react.useRef)(null);
			const trailLastRef = (0, react.useRef)(null);
			const trailCountRef = (0, react.useRef)(0);
			const eyesCoolRef = (0, react.useRef)(0);
			const cfgRef = (0, react.useRef)(config);
			(0, react.useEffect)(() => {
				cfgRef.current = config;
			}, [config]);
			const [wakePop, setWakePop] = (0, react.useState)(0);
			const wakePopTimerRef = (0, react.useRef)(0);
			const sleepTimerRef = (0, react.useRef)(0);
			const dragRef = (0, react.useRef)(null);
			const pressStartRef = (0, react.useRef)(null);
			const middleModeRef = (0, react.useRef)(false);
			const slingOriginRef = (0, react.useRef)(null);
			const ecoTimerRef = (0, react.useRef)(0);
			const ctxWarnedRef = (0, react.useRef)(false);
			const prevBalanceRef = (0, react.useRef)(null);
			const idleEggTimerRef = (0, react.useRef)(0);
			const trackerRef = (0, react.useRef)(new FlingTracker());
			const ropeRef = (0, react.useRef)(null);
			const ropeRafRef = (0, react.useRef)(0);
			const ropeLastRef = (0, react.useRef)(0);
			const ropeLenRef = (0, react.useRef)(90);
			const ropePendingRef = (0, react.useRef)(false);
			const grabVelRef = (0, react.useRef)({
				x: 0,
				y: 0
			});
			const roleVelRef = (0, react.useRef)({
				x: 0,
				y: 0
			});
			const swingTargetRef = (0, react.useRef)(0);
			const swingCurRef = (0, react.useRef)(0);
			const swingRotRef = (0, react.useRef)({
				a: 0,
				v: 0
			});
			const infoPosRef = (0, react.useRef)(infoPos);
			const infoElRef = (0, react.useRef)(null);
			const infoModeRef = (0, react.useRef)("follow");
			const infoVelRef = (0, react.useRef)({
				x: 0,
				y: 0
			});
			const freeStartRef = (0, react.useRef)(0);
			const lastRolePosRef = (0, react.useRef)({
				x: 0,
				y: 0
			});
			const infoDragRef = (0, react.useRef)(null);
			const defaultInfoPos = (0, react.useCallback)((ws) => {
				const rw = window.innerWidth;
				const rh = window.innerHeight;
				const roleW = WIDGET_W * ws;
				const roleH = WIDGET_H * ws;
				const ps = config.linkScale ? config.widgetScale : config.infoScale;
				const rx = rw - roleW - 8;
				const ry = rh - roleH - 8;
				return {
					x: Math.max(8, Math.min(rw - INFO_W * ps - 8, rx + roleW / 2 - INFO_W * ps / 2)),
					y: Math.max(8, Math.min(rh - INFO_H * ps - 8, ry + roleH + 12))
				};
			}, [
				config.infoScale,
				config.linkScale,
				config.widgetScale
			]);
			(0, react.useEffect)(() => {
				infoPosRef.current = defaultInfoPos(config.widgetScale);
				infoVelRef.current = {
					x: 0,
					y: 0
				};
			}, [
				config.widgetScale,
				config.infoScale,
				config.linkScale
			]);
			const infoMoveLastRef = (0, react.useRef)(null);
			const flingRef = (0, react.useRef)(null);
			const bounceTimerRef = (0, react.useRef)(0);
			const petTimerRef = (0, react.useRef)(0);
			const posRef = (0, react.useRef)(pos);
			const eggRef = (0, react.useRef)(new EasterEgg());
			const soundRef = (0, react.useRef)(null);
			if (soundRef.current === null) soundRef.current = new SoundEngine();
			(0, react.useEffect)(() => {
				soundRef.current?.setMode(config.soundMode);
			}, [config.soundMode]);
			const [workState, setWorkState] = (0, react.useState)("idle");
			const prevWorkRef = (0, react.useRef)("idle");
			const markActive = (0, react.useCallback)(() => {
				setEcoIdle(false);
				window.clearTimeout(ecoTimerRef.current);
				ecoTimerRef.current = window.setTimeout(() => setEcoIdle(true), 6e4);
				if (sleepingRef.current) {
					setWakePop((k) => k + 1);
					window.clearTimeout(wakePopTimerRef.current);
					wakePopTimerRef.current = window.setTimeout(() => setWakePop(0), 750);
				}
				setSleeping(false);
				window.clearTimeout(sleepTimerRef.current);
			}, []);
			(0, react.useEffect)(() => {
				sleepingRef.current = sleeping;
			}, [sleeping]);
			(0, react.useEffect)(() => {
				if (!config.deepSleep || workState !== "idle") {
					window.clearTimeout(sleepTimerRef.current);
					if (workState !== "idle") setSleeping(false);
					return;
				}
				sleepTimerRef.current = window.setTimeout(() => setSleeping(true), 3e5 + Math.floor(Math.random() * 3e5));
				return () => window.clearTimeout(sleepTimerRef.current);
			}, [
				config.deepSleep,
				workState,
				sleeping
			]);
			(0, react.useEffect)(() => {
				if (!config.ecoMode) {
					window.clearTimeout(ecoTimerRef.current);
					setEcoIdle(false);
					return;
				}
				markActive();
			}, [config.ecoMode, markActive]);
			(0, react.useEffect)(() => {
				if (!config.showBubble) return;
				let hinted = false;
				try {
					hinted = localStorage.getItem("wg-sling-hinted") === "1";
				} catch {
					hinted = false;
				}
				if (hinted) return;
				let hideTimer = 0;
				const showTimer = window.setTimeout(() => {
					try {
						localStorage.setItem("wg-sling-hinted", "1");
					} catch {}
					setBubble(SLING_HINT);
					hideTimer = window.setTimeout(() => setBubble((b) => b === SLING_HINT ? null : b), 9e3);
				}, 3e3);
				return () => {
					window.clearTimeout(showTimer);
					window.clearTimeout(hideTimer);
				};
			}, [config.showBubble]);
			(0, react.useEffect)(() => {
				if (!config.showBubble || ctxWarnedRef.current) return;
				if (state.contextPct >= .9) {
					ctxWarnedRef.current = true;
					setBubble(`上下文已经 ${Math.round(state.contextPct * 100)}% 啦，快满了！建议开个新会话，不然回复会被截断哦～`);
				}
			}, [state.contextPct, config.showBubble]);
			(0, react.useEffect)(() => {
				if (!config.showBubble || config.lowBalance <= 0) return;
				const bal = state.balance;
				if (bal === null || bal < 0) return;
				const prev = prevBalanceRef.current;
				prevBalanceRef.current = bal;
				if ((prev === null || prev >= config.lowBalance) && bal < config.lowBalance) setBubble(`余额只剩 ¥${bal.toFixed(2)} 啦，记得去充一点哦～`);
			}, [
				state.balance,
				config.showBubble,
				config.lowBalance
			]);
			(0, react.useEffect)(() => {
				if (!config.showBubble) return;
				const schedule = () => {
					window.clearTimeout(idleEggTimerRef.current);
					idleEggTimerRef.current = window.setTimeout(() => {
						setBubble(pickRandomIdleLine());
						schedule();
					}, 12e4 + Math.floor(Math.random() * 18e4));
				};
				schedule();
				return () => window.clearTimeout(idleEggTimerRef.current);
			}, [config.showBubble]);
			(0, react.useEffect)(() => {
				let alive = true;
				const onMsg = (e) => {
					const d = e.data || {};
					if (alive && d.__wgData && typeof d.__wgData === "object") setState(d.__wgData);
				};
				const w = window;
				if (w.__wgData && typeof w.__wgData === "object") setState(w.__wgData);
				window.addEventListener("message", onMsg);
				return () => {
					alive = false;
					window.removeEventListener("message", onMsg);
				};
			}, []);
			(0, react.useEffect)(() => {
				let alive = true;
				const pull = () => {
					fetch("/dsh-whale-girl/api/state", { cache: "no-store" }).then((r) => r.ok ? r.json() : null).then((d) => {
						if (!alive || !d || typeof d !== "object") return;
						if (typeof d.balance === "number") setState((prev) => ({
							...prev,
							...d
						}));
					}).catch(() => {});
				};
				pull();
				const iv = window.setInterval(pull, 6e4);
				return () => {
					alive = false;
					window.clearInterval(iv);
				};
			}, []);
			(0, react.useEffect)(() => {
				let alive = true;
				fetch("/dsh-whale-girl/api/config", { cache: "no-store" }).then((r) => r.ok ? r.json() : Promise.reject(new Error(String(r.status)))).then((o) => {
					if (alive && o && typeof o === "object") setConfig(normalizeConfig(o));
				}).catch(() => {});
				return () => {
					alive = false;
				};
			}, []);
			const persistConfig = (0, react.useCallback)((next) => {
				setConfig(next);
				try {
					localStorage.setItem(CONFIG_KEY, JSON.stringify(next));
				} catch {}
				fetch("/dsh-whale-girl/api/config", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(next)
				}).catch(() => {});
			}, []);
			(0, react.useEffect)(() => {
				if (!config.showBubble) return;
				const line = eggRef.current.onContextHigh(state.contextPct);
				if (line) setBubble(line);
			}, [state.contextPct, config.showBubble]);
			(0, react.useEffect)(() => {
				return () => {
					window.clearTimeout(bounceTimerRef.current);
					window.clearTimeout(petTimerRef.current);
					window.clearTimeout(ecoTimerRef.current);
					window.clearTimeout(idleEggTimerRef.current);
					window.clearTimeout(wakePopTimerRef.current);
					flingRef.current?.cancel();
				};
			}, []);
			(0, react.useEffect)(() => {
				if (!config.showInfo) return;
				if (config.pauseOnThinking && workState === "thinking" && infoModeRef.current === "follow") return;
				let last = performance.now();
				const step = (now) => {
					const dt = Math.max(.001, Math.min(.05, (now - last) / 1e3));
					last = now;
					const p = posRef.current;
					const ws = config.widgetScale;
					const ps = config.linkScale ? config.widgetScale : config.infoScale;
					const infoW = INFO_W * ps;
					const infoH = INFO_H * ps;
					const roleW = WIDGET_W * ws;
					const roleH0 = WIDGET_H * ws;
					const vw = window.innerWidth;
					const vh = window.innerHeight;
					const cX = (v) => Math.max(8, Math.min(vw - infoW - 8, v));
					const cY = (v) => Math.max(8, Math.min(vh - infoH - 8, v));
					const anchor = {
						x: cX(p.x + roleW / 2 - infoW / 2),
						y: cY(p.y + roleH0 + 12)
					};
					const roleH = roleH0 * .78;
					const roleCx = p.x + roleW / 2;
					const roleCy = p.y + roleH / 2;
					const roleR = Math.max(22 * ws, Math.min(roleW, roleH) / 2 * .9);
					let rvx = (p.x - lastRolePosRef.current.x) / dt;
					let rvy = (p.y - lastRolePosRef.current.y) / dt;
					const rvm = Math.hypot(rvx, rvy);
					if (rvm > 3e3) {
						rvx = rvx / rvm * 3e3;
						rvy = rvy / rvm * 3e3;
					}
					roleVelRef.current = {
						x: rvx,
						y: rvy
					};
					if (!ropeRef.current && !flinging) swingTargetRef.current *= Math.pow(.4, dt);
					const rawTarget = swingTargetRef.current;
					const curTarget = swingCurRef.current;
					const smoothTarget = curTarget + Math.max(-240 * dt, Math.min(240 * dt, rawTarget - curTarget));
					swingCurRef.current = smoothTarget;
					const s = swingRotRef.current;
					const sAcc = (smoothTarget - s.a) * 60 - s.v * 9;
					s.v += sAcc * dt;
					s.a += s.v * dt;
					const swingImg = rootRef.current?.querySelector(".wg-img");
					if (swingImg) swingImg.style.transform = `scaleX(var(--wg-flip, 1)) rotate(${s.a.toFixed(2)}deg)`;
					if (infoModeRef.current === "follow") {
						const k = .12;
						const nx = infoPosRef.current.x + (anchor.x - infoPosRef.current.x) * k;
						const ny = infoPosRef.current.y + (anchor.y - infoPosRef.current.y) * k;
						if (Math.hypot(anchor.x - nx, anchor.y - ny) > config.followThreshold) {
							infoModeRef.current = "free";
							infoVelRef.current = {
								x: (nx - infoPosRef.current.x) / dt,
								y: (ny - infoPosRef.current.y) / dt
							};
							freeStartRef.current = now;
						} else infoPosRef.current = {
							x: nx,
							y: ny
						};
					} else if (infoModeRef.current === "free") {
						if (infoDragRef.current) {} else {
							const q = infoPosRef.current;
							const v = infoVelRef.current;
							infoPosRef.current = {
								x: q.x + v.x * dt,
								y: q.y + v.y * dt
							};
							infoVelRef.current = {
								x: v.x * .997,
								y: v.y * .997
							};
							const vw = window.innerWidth;
							const vh = window.innerHeight;
							if (infoPosRef.current.x < 8) {
								infoPosRef.current.x = 8;
								infoVelRef.current.x = Math.abs(infoVelRef.current.x) * .8;
							}
							if (infoPosRef.current.x > vw - infoW - 8) {
								infoPosRef.current.x = vw - infoW - 8;
								infoVelRef.current.x = -Math.abs(infoVelRef.current.x) * .8;
							}
							if (infoPosRef.current.y < 8) {
								infoPosRef.current.y = 8;
								infoVelRef.current.y = Math.abs(infoVelRef.current.y) * .8;
							}
							if (infoPosRef.current.y > vh - infoH - 8) {
								infoPosRef.current.y = vh - infoH - 8;
								infoVelRef.current.y = -Math.abs(infoVelRef.current.y) * .8;
							}
							const n = panelRoleNormal(infoPosRef.current.x, infoPosRef.current.y, infoW, infoH, roleCx, roleCy, roleR);
							if (n) {
								infoPosRef.current.x = cX(infoPosRef.current.x + n.x * (n.depth + 2));
								infoPosRef.current.y = cY(infoPosRef.current.y + n.y * (n.depth + 2));
								const relx = infoVelRef.current.x - rvx;
								const rely = infoVelRef.current.y - rvy;
								const dot = relx * n.x + rely * n.y;
								if (dot < 0) {
									infoVelRef.current = {
										x: rvx - (1 + config.bounceE) * dot * n.x,
										y: rvy - (1 + config.bounceE) * dot * n.y
									};
									if (Math.hypot(infoVelRef.current.x, infoVelRef.current.y) < 40) infoVelRef.current = {
										x: n.x * 60,
										y: n.y * 60
									};
									if (!dragging && !flinging && !middleModeRef.current) {
										const pvx = infoVelRef.current.x;
										const pvy = infoVelRef.current.y;
										if (Math.hypot(pvx, pvy) > 60) {
											setFlinging(true);
											flingRef.current?.cancel();
											let bounced = false;
											flingRef.current = startFling({
												x: p.x,
												y: p.y,
												vx: pvx * .7,
												vy: pvy * .7,
												width: WIDGET_W * ws,
												height: WIDGET_H * ws,
												bounceE: config.bounceE,
												gravity: config.gravityMode ? 2400 : void 0,
												groundFriction: config.groundFriction,
												getObstacle,
												onObstacleHit: handleObstacleHit,
												onMove: (x, y, vx, vy) => {
													roleVelRef.current = {
														x: vx ?? 0,
														y: vy ?? 0
													};
													swingTargetRef.current = Math.max(-30, Math.min(30, (vx ?? 0) / 8));
													setPos({
														x,
														y
													});
												},
												onBounce: (axis) => {
													bounced = true;
													soundRef.current?.bounce();
													shake();
													showEyes();
													setBounceAxis(axis);
													window.clearTimeout(bounceTimerRef.current);
													bounceTimerRef.current = window.setTimeout(() => setBounceAxis(null), 260);
												},
												onDone: (x, y) => {
													flingRef.current = null;
													setFlinging(false);
													if (!bounced) soundRef.current?.bounce();
													if (!config.gravityMode) snap(x, y);
												}
											});
										}
									}
								}
							}
							if (now - freeStartRef.current > FREE_MS && !config.gravityMode) infoModeRef.current = "returning";
						}
					} else {
						const dx = anchor.x - infoPosRef.current.x;
						const dy = anchor.y - infoPosRef.current.y;
						if (Math.hypot(dx, dy) < 8) {
							if (Math.hypot(p.x - lastRolePosRef.current.x, p.y - lastRolePosRef.current.y) / dt < 4) {
								infoModeRef.current = "follow";
								infoVelRef.current = {
									x: 0,
									y: 0
								};
							}
						} else infoPosRef.current = {
							x: infoPosRef.current.x + dx * .15,
							y: infoPosRef.current.y + dy * .15
						};
					}
					lastRolePosRef.current = {
						x: p.x,
						y: p.y
					};
					const iel = infoElRef.current;
					if (iel) iel.style.transform = `translate3d(${infoPosRef.current.x}px,${infoPosRef.current.y}px,0) scale(${config.linkScale ? config.widgetScale : config.infoScale})`;
					__wgInfoGlobal = {
						x: infoPosRef.current.x,
						y: infoPosRef.current.y,
						w: infoW,
						h: infoH
					};
				};
				let raf = 0;
				const loop = (now) => {
					step(now);
					raf = requestAnimationFrame(loop);
				};
				raf = requestAnimationFrame(loop);
				return () => cancelAnimationFrame(raf);
			}, [
				config.showInfo,
				config.followThreshold,
				workState,
				config.pauseOnThinking,
				config.infoScale,
				config.linkScale,
				config.widgetScale
			]);
			const onContextMenu = (0, react.useCallback)((e) => {
				e.preventDefault();
				e.stopPropagation();
				setMenu({
					x: e.clientX,
					y: e.clientY
				});
				setProviders(null);
				fetch("/dsh-whale-girl/api/providers", { cache: "no-store" }).then((r) => r.json()).then((d) => {
					if (d && Array.isArray(d.providers)) setProviders(d.providers);
					else setProviders([]);
				}).catch(() => setProviders([]));
			}, []);
			const onInfoDown = (0, react.useCallback)((e) => {
				e.preventDefault();
				e.stopPropagation();
				infoModeRef.current = "free";
				freeStartRef.current = performance.now();
				infoDragRef.current = {
					dx: e.clientX - infoPosRef.current.x,
					dy: e.clientY - infoPosRef.current.y
				};
				infoVelRef.current = {
					x: 0,
					y: 0
				};
				infoMoveLastRef.current = {
					x: infoPosRef.current.x,
					y: infoPosRef.current.y,
					t: performance.now()
				};
				try {
					e.target.setPointerCapture(e.pointerId);
				} catch {}
			}, []);
			const onInfoMove = (0, react.useCallback)((e) => {
				if (!infoDragRef.current) return;
				let nx = e.clientX - infoDragRef.current.dx;
				let ny = e.clientY - infoDragRef.current.dy;
				const vw = window.innerWidth;
				const vh = window.innerHeight;
				if (nx < 8) nx = 8;
				if (nx > vw - INFO_W - 8) nx = vw - INFO_W - 8;
				if (ny < 8) ny = 8;
				if (ny > vh - INFO_H - 8) ny = vh - INFO_H - 8;
				infoPosRef.current = {
					x: nx,
					y: ny
				};
				const now = performance.now();
				const lastM = infoMoveLastRef.current;
				if (lastM) {
					const dts = Math.max(8, now - lastM.t);
					infoVelRef.current = {
						x: (nx - lastM.x) / dts * 1e3,
						y: (ny - lastM.y) / dts * 1e3
					};
					infoMoveLastRef.current = {
						x: nx,
						y: ny,
						t: now
					};
				} else infoVelRef.current = {
					x: 0,
					y: 0
				};
				if (infoElRef.current) infoElRef.current.style.transform = `translate3d(${nx}px,${ny}px,0) scale(${config.linkScale ? config.widgetScale : config.infoScale})`;
				if (!dragging && !flinging && !middleModeRef.current) {
					const roleH = WIDGET_H * .78;
					const roleCx = posRef.current.x + WIDGET_W / 2;
					const roleCy = posRef.current.y + roleH / 2;
					const roleR = Math.max(22, Math.min(WIDGET_W, roleH) / 2 * .9);
					if (circleRectHit(infoPosRef.current.x, infoPosRef.current.y, INFO_W, INFO_H, roleCx, roleCy, roleR)) {
						const pvx = infoVelRef.current.x;
						const pvy = infoVelRef.current.y;
						if (Math.hypot(pvx, pvy) > 60) {
							setFlinging(true);
							flingRef.current?.cancel();
							let bounced = false;
							flingRef.current = startFling({
								x: posRef.current.x,
								y: posRef.current.y,
								vx: pvx * .7,
								vy: pvy * .7,
								width: WIDGET_W * config.widgetScale,
								height: WIDGET_H * config.widgetScale,
								bounceE: config.bounceE,
								gravity: config.gravityMode ? 2400 : void 0,
								groundFriction: config.groundFriction,
								getObstacle,
								onObstacleHit: handleObstacleHit,
								onMove: (x, y, vx, vy) => {
									roleVelRef.current = {
										x: vx ?? 0,
										y: vy ?? 0
									};
									swingTargetRef.current = Math.max(-30, Math.min(30, (vx ?? 0) / 8));
									setPos({
										x,
										y
									});
								},
								onBounce: (axis) => {
									bounced = true;
									soundRef.current?.bounce();
									shake();
									setBounceAxis(axis);
									window.clearTimeout(bounceTimerRef.current);
									bounceTimerRef.current = window.setTimeout(() => setBounceAxis(null), 260);
								},
								onDone: (x, y) => {
									flingRef.current = null;
									setFlinging(false);
									if (!bounced) soundRef.current?.bounce();
									if (!config.gravityMode) snap(x, y);
								}
							});
						}
					}
				}
			}, [
				config.infoScale,
				config.linkScale,
				config.widgetScale
			]);
			const getObstacle = (0, react.useCallback)(() => __wgInfoGlobal, []);
			const showEyes = (0, react.useCallback)(() => {
				if (sleepingRef.current) return;
				setPainOn(true);
				window.clearTimeout(eyesTimerRef.current);
				eyesTimerRef.current = window.setTimeout(() => setPainOn(false), 650);
			}, []);
			const handleObstacleHit = (0, react.useCallback)((invx, invy) => {
				showEyes();
				infoModeRef.current = "free";
				infoVelRef.current = {
					x: invx * .8,
					y: invy * .8
				};
				freeStartRef.current = performance.now();
			}, [showEyes]);
			const onInfoUp = (0, react.useCallback)((e) => {
				if (!infoDragRef.current) return;
				infoDragRef.current = null;
				freeStartRef.current = performance.now();
				try {
					e.target.releasePointerCapture?.(e.pointerId);
				} catch {}
			}, []);
			const handleSwitchProvider = (0, react.useCallback)((id) => {
				const row = providers?.find((p) => p.id === id);
				if (!row || switching) return;
				setSwitching(id);
				const model = row.models && row.models.length > 0 ? row.models[0] : {
					"zai-coding-cn": "glm-5.3-flash",
					siliconflow: "deepseek-ai/DeepSeek-V4-Flash",
					"deepseek-official": "deepseek-v4-flash"
				}[id] ?? "";
				fetch("/dsh-whale-girl/api/select-model", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						provider: id,
						model
					})
				}).then((r) => r.json()).then((d) => {
					if (d && d.ok) setBubble("已切换到 " + (row.name || id));
					else setBubble("切换失败，请检查模型配置");
				}).catch(() => setBubble("切换失败，网络错误")).finally(() => {
					setSwitching(null);
					window.setTimeout(() => setBubble(null), 3e3);
				});
			}, [providers, switching]);
			const resetPosition = (0, react.useCallback)(() => {
				const w = WIDGET_W * config.widgetScale;
				const h = WIDGET_H * config.widgetScale;
				setPos({
					x: Math.max(8, window.innerWidth - w - 8),
					y: Math.max(8, window.innerHeight - h - INFO_H - 42)
				});
				setMenu(null);
			}, [config.widgetScale]);
			const stopFling = (0, react.useCallback)(() => {
				if (flingRef.current) {
					flingRef.current.cancel();
					flingRef.current = null;
				}
				setFlinging(false);
			}, []);
			const stopRopeSim = (0, react.useCallback)(() => {
				if (ropeRafRef.current) {
					cancelAnimationFrame(ropeRafRef.current);
					ropeRafRef.current = 0;
				}
				ropeRef.current = null;
				hideRope();
			}, []);
			const shake = (0, react.useCallback)(() => {
				setBounce(true);
				window.clearTimeout(bounceTimerRef.current);
				bounceTimerRef.current = window.setTimeout(() => setBounce(false), 300);
			}, []);
			(0, react.useEffect)(() => {
				let raf = 0;
				let last = performance.now();
				const step = (now) => {
					const dt = Math.max(.001, Math.min(.05, (now - last) / 1e3));
					last = now;
					const layer = trailLayerRef.current;
					const p = posRef.current;
					if (!layer || sleepingRef.current) trailLastRef.current = null;
					else {
						const lt = trailLastRef.current;
						if (lt) {
							const dist = Math.hypot(p.x - lt.x, p.y - lt.y);
							const speed = dist / dt;
							if (speed > 80 && now > eyesCoolRef.current) {
								const sc = cfgRef.current.widgetScale || 1;
								const vl = p.x + WIDGET_W * (1 - sc) / 2;
								const vt = p.y + WIDGET_H * (1 - sc) / 2;
								if (vl <= 12 || vt <= 12 || vl + WIDGET_W * sc >= window.innerWidth - 12 || vt + WIDGET_H * sc >= window.innerHeight - 12) {
									showEyes();
									eyesCoolRef.current = now + 700;
								}
							}
							if (speed > 250) {
								lt.acc += dist;
								while (lt.acc >= 16 && trailCountRef.current < 36) {
									lt.acc -= 16;
									const size = 7 + Math.min(9, speed / 400);
									const dot = document.createElement("span");
									dot.className = "wg-trail-dot";
									dot.style.width = dot.style.height = `${size.toFixed(1)}px`;
									dot.style.left = `${(p.x + WIDGET_W / 2 - size / 2).toFixed(1)}px`;
									dot.style.top = `${(p.y + WIDGET_H * .4 - size / 2).toFixed(1)}px`;
									layer.appendChild(dot);
									trailCountRef.current++;
									window.setTimeout(() => {
										dot.remove();
										trailCountRef.current--;
									}, 520);
								}
							} else if (speed <= 40) lt.acc = 0;
						}
						trailLastRef.current = {
							x: p.x,
							y: p.y,
							acc: lt ? lt.acc : 0
						};
					}
					raf = requestAnimationFrame(step);
				};
				raf = requestAnimationFrame(step);
				return () => cancelAnimationFrame(raf);
			}, []);
			/** 弹跳结束后：平滑吸附到最近侧边（保留当前垂直位置）。 */
			const snap = (0, react.useCallback)((x, y) => {
				const vw = window.innerWidth;
				const vh = window.innerHeight;
				const px = Math.max(8, Math.min(vw - WIDGET_W - 8, x));
				const py = Math.max(8, Math.min(vh - WIDGET_H - 8, y));
				if (Math.min(x, vw - (x + WIDGET_W)) > EDGE_SNAP_MARGIN) {
					setPos({
						x: px,
						y: py
					});
					return;
				}
				const left = x + WIDGET_W / 2 < vw / 2 ? 8 : vw - WIDGET_W - 8;
				setPos({
					x: Math.max(8, left),
					y: Math.max(8, Math.min(vh - WIDGET_H - 8, y))
				});
			}, []);
			const reportEvent = (0, react.useCallback)((type, extra) => {
				try {
					window.postMessage({ __wgEvent: {
						type,
						...extra,
						t: Date.now()
					} }, "*");
				} catch {}
			}, []);
			const bounceFeedback = (0, react.useCallback)((axis) => {
				reportEvent("bounce", { axis });
				soundRef.current?.bounce();
				shake();
				showEyes();
				setBounceAxis(axis);
				window.clearTimeout(bounceTimerRef.current);
				bounceTimerRef.current = window.setTimeout(() => setBounceAxis(null), 260);
			}, [
				reportEvent,
				shake,
				showEyes
			]);
			const startRopeSim = (0, react.useCallback)(() => {
				if (ropeRafRef.current) return;
				ropeLastRef.current = performance.now();
				const step = (now) => {
					const rope = ropeRef.current;
					if (!rope) {
						ropeRafRef.current = 0;
						return;
					}
					const dt = Math.min(.05, (now - ropeLastRef.current) / 1e3);
					ropeLastRef.current = now;
					if (config.gravityMode) rope.vy += 2400 * dt;
					const cpx = posRef.current.x + WIDGET_W / 2;
					const cpy = posRef.current.y + WIDGET_H / 2;
					const dx = cpx - rope.ax;
					const dy = cpy - rope.ay;
					const dist = Math.hypot(dx, dy);
					const L = ropeLenRef.current;
					if (dist > L && dist > .001) {
						const f = config.ropeK * (dist - L);
						rope.vx -= dx / dist * f * dt;
						rope.vy -= dy / dist * f * dt;
					}
					const damp = Math.pow(1 - config.ropeDamp * .008, dt * 60);
					rope.vx *= damp;
					if (!config.gravityMode) rope.vy *= damp;
					let cx = cpx + rope.vx * dt;
					let cy = cpy + rope.vy * dt;
					const maxDist = L + config.ropeMax;
					const dxc = cx - rope.ax;
					const dyc = cy - rope.ay;
					const distC = Math.hypot(dxc, dyc);
					if (distC > maxDist && distC > .001) {
						const nx2 = dxc / distC;
						const ny2 = dyc / distC;
						cx = rope.ax + nx2 * maxDist;
						cy = rope.ay + ny2 * maxDist;
						const vRad = rope.vx * nx2 + rope.vy * ny2;
						if (vRad > 0) {
							rope.vx -= vRad * nx2;
							rope.vy -= vRad * ny2;
						}
					}
					const m = 8;
					const hitX = cx - WIDGET_W / 2 < m ? -1 : cx + WIDGET_W / 2 > window.innerWidth - m ? 1 : 0;
					if (hitX !== 0) {
						cx = hitX < 0 ? 93 : window.innerWidth - m - WIDGET_W / 2;
						const into = hitX < 0 ? rope.vx < 0 : rope.vx > 0;
						if (into && Math.abs(rope.vx) > 120) {
							rope.vx = -rope.vx * config.bounceE;
							bounceFeedback("x");
						} else if (into) rope.vx = 0;
					}
					const hitY = cy - WIDGET_H / 2 < m ? -1 : cy + WIDGET_H / 2 > window.innerHeight - m ? 1 : 0;
					if (hitY !== 0) {
						cy = hitY < 0 ? 98 : window.innerHeight - m - WIDGET_H / 2;
						const into = hitY < 0 ? rope.vy < 0 : rope.vy > 0;
						if (into && Math.abs(rope.vy) > 120) {
							const soft = config.gravityMode && hitY > 0;
							rope.vy = -rope.vy * (soft ? .25 * config.bounceE : config.bounceE);
							bounceFeedback("y");
						} else if (into) rope.vy = 0;
					}
					drawRope(rope.ax, rope.ay, cx, cy, ropeLenRef.current, config.ropeMax);
					const ropeDeg = Math.atan2(cx - rope.ax, cy - rope.ay) * (180 / Math.PI);
					swingTargetRef.current = Math.max(-40, Math.min(40, ropeDeg));
					cx = Math.max(WIDGET_W / 2, Math.min(window.innerWidth - WIDGET_W / 2, cx));
					cy = Math.max(WIDGET_H / 2, Math.min(window.innerHeight - WIDGET_H / 2, cy));
					posRef.current = {
						x: cx - WIDGET_W / 2,
						y: cy - WIDGET_H / 2
					};
					setPos(posRef.current);
					ropeRafRef.current = requestAnimationFrame(step);
				};
				ropeRafRef.current = requestAnimationFrame(step);
			}, [
				config.ropeMode,
				config.gravityMode,
				config.ropeK,
				config.ropeDamp,
				config.ropeMax,
				config.widgetScale,
				bounceFeedback
			]);
			(0, react.useEffect)(() => {
				const onWork = (e) => {
					const d = e.data || {};
					if (d.__wgWorkState?.state) setWorkState(d.__wgWorkState.state);
				};
				window.addEventListener("message", onWork);
				const w = window;
				if (w.__wgWorkState?.state) setWorkState(w.__wgWorkState.state);
				return () => window.removeEventListener("message", onWork);
			}, []);
			(0, react.useEffect)(() => {
				if (prevWorkRef.current === workState) return;
				prevWorkRef.current = workState;
				if (workState === "thinking" && config.showBubble && config.showWorkState) setBubble("让我想想…");
				if (workState === "done" && config.showWorkState) {
					if (config.showBubble) setBubble("任务搞定啦！🎉");
					setPetted(true);
					setPetKey((k) => k + 1);
					window.clearTimeout(petTimerRef.current);
					petTimerRef.current = window.setTimeout(() => setPetted(false), 260);
					soundRef.current?.bounce();
					reportEvent("workstate", { state: "done" });
				}
			}, [
				workState,
				config.showBubble,
				config.showWorkState,
				reportEvent
			]);
			const onPointerDown = (0, react.useCallback)((e) => {
				const el = rootRef.current;
				if (!el) return;
				markActive();
				grabVelRef.current = { ...roleVelRef.current };
				stopFling();
				const rect = el.getBoundingClientRect();
				if (e.button === 1) {
					e.preventDefault();
					e.stopPropagation();
					const ox = posRef.current.x;
					const oy = posRef.current.y;
					middleModeRef.current = true;
					slingOriginRef.current = {
						x: ox,
						y: oy
					};
					dragRef.current = {
						dx: e.clientX - rect.left,
						dy: e.clientY - rect.top
					};
					const imgEl = el.querySelector(".wg-img");
					if (imgEl) imgEl.style.animationPlayState = "paused";
					setSling({
						fx: ox + WIDGET_W / 2,
						fy: oy + WIDGET_H / 2,
						tx: ox + WIDGET_W / 2,
						ty: oy + WIDGET_H / 2
					});
					setPressed(true);
					setDragging(true);
					soundRef.current?.unlock();
					try {
						e.target.setPointerCapture(e.pointerId);
					} catch {}
					return;
				}
				dragRef.current = {
					dx: e.clientX - rect.left,
					dy: e.clientY - rect.top
				};
				pressStartRef.current = {
					x: e.clientX,
					y: e.clientY
				};
				trackerRef.current.clear();
				ropePendingRef.current = config.ropeMode;
				setPressed(true);
				setDragging(true);
				soundRef.current?.unlock();
				if (soundRef.current) soundRef.current.onPlayResult = (ok, err) => reportEvent("play", {
					ok,
					err
				});
				soundRef.current?.press();
				reportEvent("sound", { kind: "press" });
				reportEvent("audio-debug", soundRef.current?.debug());
				try {
					e.target.setPointerCapture(e.pointerId);
				} catch {}
			}, [
				stopFling,
				startRopeSim,
				markActive,
				config.widgetScale,
				reportEvent
			]);
			const onPointerMove = (0, react.useCallback)((e) => {
				if (dragRef.current) markActive();
				if (!dragRef.current) return;
				if (middleModeRef.current) {
					const nx = Math.max(0, Math.min(window.innerWidth - WIDGET_W, e.clientX - dragRef.current.dx));
					const ny = Math.max(0, Math.min(window.innerHeight - WIDGET_H, e.clientY - dragRef.current.dy));
					setPos({
						x: nx,
						y: ny
					});
					const o = slingOriginRef.current;
					if (o) setSling({
						fx: o.x + WIDGET_W / 2,
						fy: o.y + WIDGET_H / 2,
						tx: nx + WIDGET_W / 2,
						ty: ny + WIDGET_H / 2
					});
					return;
				}
				trackerRef.current.push(e.clientX, e.clientY);
				if (ropePendingRef.current && pressStartRef.current && Math.hypot(e.clientX - pressStartRef.current.x, e.clientY - pressStartRef.current.y) > 6) {
					ropePendingRef.current = false;
					ropeRef.current = {
						ax: e.clientX,
						ay: e.clientY,
						vx: grabVelRef.current.x,
						vy: grabVelRef.current.y
					};
					ropeLenRef.current = 90 * (config.widgetScale || 1);
					startRopeSim();
				}
				const rope = ropeRef.current;
				if (rope) {
					rope.ax = e.clientX;
					rope.ay = e.clientY;
					return;
				}
				let nx = Math.max(0, Math.min(window.innerWidth - WIDGET_W, e.clientX - dragRef.current.dx));
				let ny = Math.max(0, Math.min(window.innerHeight - WIDGET_H, e.clientY - dragRef.current.dy));
				const ob = __wgInfoGlobal;
				if (ob && nx < ob.x + ob.w && nx + WIDGET_W > ob.x && ny < ob.y + ob.h && ny + WIDGET_H > ob.y) {
					const rv = trackerRef.current.velocity();
					if (rv) {
						infoModeRef.current = "free";
						infoVelRef.current = {
							x: rv.vx * 1,
							y: rv.vy * 1
						};
						freeStartRef.current = performance.now();
					}
				}
				setPos({
					x: nx,
					y: ny
				});
			}, [markActive]);
			const onPointerUp = (0, react.useCallback)((e) => {
				if (middleModeRef.current) {
					middleModeRef.current = false;
					const imgEl2 = rootRef.current?.querySelector(".wg-img");
					if (imgEl2) imgEl2.style.animationPlayState = "running";
					const origin = slingOriginRef.current;
					slingOriginRef.current = null;
					const rect = rootRef.current?.getBoundingClientRect();
					dragRef.current = null;
					pressStartRef.current = null;
					setPressed(false);
					setDragging(false);
					setSling(null);
					try {
						e.target.releasePointerCapture?.(e.pointerId);
					} catch {}
					if (origin && rect) {
						const fromX = origin.x + WIDGET_W / 2;
						const fromY = origin.y + WIDGET_H / 2;
						const toX = rect.left + WIDGET_W / 2;
						const toY = rect.top + WIDGET_H / 2;
						const dx = fromX - toX;
						const dy = fromY - toY;
						const dist = Math.hypot(dx, dy);
						if (dist > 10) {
							const speed = dist * (config.slingPower || 20);
							const vx = dx / dist * speed;
							const vy = dy / dist * speed;
							setFlinging(true);
							let bounced = false;
							reportEvent("sling", {
								vx,
								vy,
								dist
							});
							flingRef.current = startFling({
								x: rect.left,
								y: rect.top,
								vx,
								vy,
								width: WIDGET_W * config.widgetScale,
								height: WIDGET_H * config.widgetScale,
								bounceE: config.bounceE,
								gravity: config.gravityMode ? 2400 : void 0,
								groundFriction: config.groundFriction,
								getObstacle,
								onObstacleHit: handleObstacleHit,
								onMove: (x, y, vx, vy) => {
									roleVelRef.current = {
										x: vx ?? 0,
										y: vy ?? 0
									};
									swingTargetRef.current = Math.max(-30, Math.min(30, (vx ?? 0) / 8));
									setPos({
										x,
										y
									});
								},
								onBounce: (axis) => {
									bounced = true;
									reportEvent("bounce", { axis });
									reportEvent("sound", { kind: "bounce" });
									soundRef.current?.bounce();
									shake();
									setBounceAxis(axis);
									window.clearTimeout(bounceTimerRef.current);
									bounceTimerRef.current = window.setTimeout(() => setBounceAxis(null), 260);
								},
								onDone: (x, y) => {
									flingRef.current = null;
									setFlinging(false);
									if (!bounced) soundRef.current?.bounce();
									if (!config.gravityMode) snap(x, y);
								}
							});
						} else if (config.gravityMode) {
							setFlinging(true);
							flingRef.current = startFling({
								x: rect.left,
								y: rect.top,
								vx: 0,
								vy: 0,
								width: WIDGET_W * config.widgetScale,
								height: WIDGET_H * config.widgetScale,
								bounceE: config.bounceE,
								gravity: 2400,
								groundFriction: config.groundFriction,
								getObstacle,
								onObstacleHit: handleObstacleHit,
								onMove: (x, y, vx, vy) => {
									roleVelRef.current = {
										x: vx ?? 0,
										y: vy ?? 0
									};
									setPos({
										x,
										y
									});
								},
								onBounce: (axis) => {
									soundRef.current?.bounce();
									shake();
									setBounceAxis(axis);
									window.clearTimeout(bounceTimerRef.current);
									bounceTimerRef.current = window.setTimeout(() => setBounceAxis(null), 260);
								},
								onDone: (x, y) => {
									flingRef.current = null;
									setFlinging(false);
									reportEvent("gravity", { landed: true });
								}
							});
						} else snap(rect.left, rect.top);
					}
					return;
				}
				const start = pressStartRef.current;
				const moved = start !== null && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6;
				const ropeV = ropeRef.current ? {
					vx: ropeRef.current.vx,
					vy: ropeRef.current.vy
				} : null;
				stopRopeSim();
				ropePendingRef.current = false;
				const vel = ropeV ?? trackerRef.current.velocity();
				trackerRef.current.clear();
				dragRef.current = null;
				pressStartRef.current = null;
				setPressed(false);
				setDragging(false);
				soundRef.current?.release();
				reportEvent("sound", { kind: "release" });
				if (!moved) {
					reportEvent("click");
					showEyes();
					setPetted(true);
					setPetKey((k) => k + 1);
					window.clearTimeout(petTimerRef.current);
					petTimerRef.current = window.setTimeout(() => setPetted(false), 260);
					if (config.showBubble) {
						const r = eggRef.current.onPress();
						setBubble(r.kind === "quote" ? r.text : pickRandomIdleLine());
					}
				} else if (vel && Math.hypot(vel.vx, vel.vy) >= FLING_SPEED) {
					reportEvent("fling", {
						vx: vel.vx,
						vy: vel.vy
					});
					const el = rootRef.current;
					if (el) {
						const rect = el.getBoundingClientRect();
						setFlinging(true);
						let bounced = false;
						flingRef.current = startFling({
							x: rect.left,
							y: rect.top,
							vx: vel.vx,
							vy: vel.vy,
							width: WIDGET_W,
							height: WIDGET_H,
							bounceE: config.bounceE,
							gravity: config.gravityMode ? 2400 : void 0,
							groundFriction: config.groundFriction,
							getObstacle,
							onObstacleHit: handleObstacleHit,
							onMove: (x, y, vx, vy) => {
								roleVelRef.current = {
									x: vx ?? 0,
									y: vy ?? 0
								};
								swingTargetRef.current = Math.max(-30, Math.min(30, (vx ?? 0) / 8));
								setPos({
									x,
									y
								});
							},
							onBounce: (axis) => {
								bounced = true;
								reportEvent("bounce", { axis });
								reportEvent("sound", { kind: "bounce" });
								soundRef.current?.bounce();
								shake();
								setBounceAxis(axis);
								window.clearTimeout(bounceTimerRef.current);
								bounceTimerRef.current = window.setTimeout(() => setBounceAxis(null), 260);
							},
							onDone: (x, y) => {
								flingRef.current = null;
								setFlinging(false);
								if (!bounced) {
									soundRef.current?.bounce();
									reportEvent("sound", { kind: "bounce" });
								}
								if (!config.gravityMode) snap(x, y);
								else reportEvent("gravity", { landed: true });
							}
						});
					}
				} else if (config.gravityMode && !moved) {
					const el = rootRef.current;
					if (el) {
						const rect = el.getBoundingClientRect();
						setFlinging(true);
						let bounced = false;
						flingRef.current = startFling({
							x: rect.left,
							y: rect.top,
							vx: vel ? vel.vx * .5 : 0,
							vy: vel ? vel.vy * .5 : 0,
							width: WIDGET_W,
							height: WIDGET_H,
							bounceE: config.bounceE,
							gravity: 2400,
							groundFriction: config.groundFriction,
							getObstacle,
							onObstacleHit: handleObstacleHit,
							onMove: (x, y, vx, vy) => {
								roleVelRef.current = {
									x: vx ?? 0,
									y: vy ?? 0
								};
								swingTargetRef.current = Math.max(-30, Math.min(30, (vx ?? 0) / 8));
								setPos({
									x,
									y
								});
							},
							onBounce: (axis) => {
								bounced = true;
								reportEvent("sound", { kind: "bounce" });
								soundRef.current?.bounce();
								shake();
								setBounceAxis(axis);
								window.clearTimeout(bounceTimerRef.current);
								bounceTimerRef.current = window.setTimeout(() => setBounceAxis(null), 260);
							},
							onDone: (x, y) => {
								flingRef.current = null;
								setFlinging(false);
								if (!bounced) soundRef.current?.bounce();
								reportEvent("gravity", { landed: true });
							}
						});
					}
				} else {
					const rect = rootRef.current?.getBoundingClientRect();
					if (rect && config.gravityMode) {
						setFlinging(true);
						flingRef.current = startFling({
							x: rect.left,
							y: rect.top,
							vx: vel ? vel.vx * .5 : 0,
							vy: vel ? vel.vy * .5 : 0,
							width: WIDGET_W,
							height: WIDGET_H,
							bounceE: config.bounceE,
							gravity: 2400,
							groundFriction: config.groundFriction,
							getObstacle,
							onObstacleHit: handleObstacleHit,
							onMove: (x, y, vx, vy) => {
								roleVelRef.current = {
									x: vx ?? 0,
									y: vy ?? 0
								};
								swingTargetRef.current = Math.max(-30, Math.min(30, (vx ?? 0) / 8));
								setPos({
									x,
									y
								});
							},
							onBounce: (axis) => {
								reportEvent("sound", { kind: "bounce" });
								soundRef.current?.bounce();
							},
							onDone: (x, y) => {
								flingRef.current = null;
								setFlinging(false);
								reportEvent("gravity", { landed: true });
							}
						});
					} else if (rect) snap(rect.left, rect.top);
				}
				try {
					e.target.releasePointerCapture?.(e.pointerId);
				} catch {}
			}, [
				shake,
				snap,
				config.showBubble,
				config.slingPower,
				config.gravityMode,
				stopRopeSim,
				reportEvent
			]);
			(0, react.useEffect)(() => {
				posRef.current = pos;
			}, [pos, config.widgetScale]);
			(0, react.useEffect)(() => {
				const onResize = () => {
					const nw = window.innerWidth;
					const nh = window.innerHeight;
					const prev = posRef.current;
					const nx = Math.max(0, Math.min(prev.x, nw - WIDGET_W - 8));
					const ny = Math.max(0, Math.min(prev.y, nh - WIDGET_H - 8));
					const dx = prev.x - nx;
					const dy = prev.y - ny;
					setPos({
						x: nx,
						y: ny
					});
					if (Math.hypot(dx, dy) > 6) {
						setFlinging(true);
						let bounced = false;
						flingRef.current = startFling({
							x: nx,
							y: ny,
							vx: dx * 5,
							vy: dy * 5,
							width: WIDGET_W,
							height: WIDGET_H,
							bounceE: config.bounceE,
							gravity: config.gravityMode ? 2400 : void 0,
							groundFriction: config.groundFriction,
							getObstacle,
							onObstacleHit: handleObstacleHit,
							onMove: (x, y, vx, vy) => {
								roleVelRef.current = {
									x: vx ?? 0,
									y: vy ?? 0
								};
								swingTargetRef.current = Math.max(-30, Math.min(30, (vx ?? 0) / 8));
								setPos({
									x,
									y
								});
							},
							onBounce: (axis) => {
								bounced = true;
								reportEvent("bounce", { axis });
								reportEvent("sound", { kind: "bounce" });
								soundRef.current?.bounce();
								shake();
								showEyes();
								setBounceAxis(axis);
								window.clearTimeout(bounceTimerRef.current);
								bounceTimerRef.current = window.setTimeout(() => setBounceAxis(null), 260);
							},
							onDone: (x, y) => {
								flingRef.current = null;
								setFlinging(false);
								if (!bounced) soundRef.current?.bounce();
								if (!config.gravityMode) snap(x, y);
							}
						});
					}
				};
				window.addEventListener("resize", onResize);
				return () => window.removeEventListener("resize", onResize);
			}, [
				reportEvent,
				shake,
				snap,
				showEyes
			]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("style", { children: WIDGET_CSS }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "wg-trail-layer",
					ref: trailLayerRef
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					ref: rootRef,
					className: `wg-root${dragging ? " wg-dragging" : ""}${flinging ? " wg-flinging" : ""}${bounce ? " wg-bounce" : ""}${bounceAxis === "x" ? " wg-squash-x" : ""}${bounceAxis === "y" ? " wg-squash-y" : ""}${petted ? " wg-pet" : ""}${config.ecoMode && ecoIdle ? " wg-eco" : ""}${config.gravityMode ? " wg-gravity" : ""}${sleeping ? " wg-sleep" : ""}${pos.x + WIDGET_W / 2 < window.innerWidth / 2 ? " wg-flip" : ""}`,
					style: {
						left: 0,
						top: 0,
						transform: `translate3d(${pos.x}px,${pos.y}px,0) scale(${config.widgetScale})${pressed ? " scaleY(0.9)" : ""}`,
						"--wg-frost": config.frost,
						"--wg-panel-alpha": config.panelOpacity
					},
					onPointerDown,
					onPointerMove,
					onPointerUp,
					onContextMenu,
					"data-pressed": pressed,
					children: [
						config.showWorkState && workState !== "idle" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: `wg-workstate${workState === "done" ? " wg-ws-done" : ""}`,
							children: workState === "thinking" ? "思考中…" : "搞定啦！"
						}, workState),
						config.showWorkState && state.subagentRunning > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "wg-subagent",
							children: ["分身×", state.subagentRunning]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
							className: "wg-img",
							src: sleeping ? WHALE_SLEEP_DATA_URL : painOn ? WHALE_PAIN_DATA_URL : WHALE_BASE_DATA_URL,
							alt: "鲸鱼娘",
							draggable: false
						}),
						sleeping && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "wg-zzz",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "Z" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "z" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "z" })
							]
						}),
						wakePop > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { className: "wg-wakepop" }, wakePop),
						petted && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "wg-rua",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
								src: "data:image/gif;base64,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",
								alt: "",
								draggable: false
							})
						}, petKey),
						config.showProgress && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ContextBar, {
							pct: state.contextPct,
							tokens: state.contextTokens,
							limit: state.contextLimit,
							balance: state.balance,
							currency: state.currency,
							todayUsage: state.todayUsage,
							lastTurnCost: state.lastTurnCost,
							peakLow: state.peakLow,
							showBalance: config.showBalance,
							showPeak: config.showPeak
						}),
						config.showBubble && bubble && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Bubble, {
							text: bubble,
							onClose: () => setBubble(null),
							flip: pos.x + WIDGET_W / 2 < window.innerWidth / 2
						})
					]
				}),
				config.showInfo && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					ref: infoElRef,
					style: {
						position: "fixed",
						zIndex: 2147483646,
						["--wg-frost"]: `${config.infoFrost}px`
					},
					onPointerDown: onInfoDown,
					onPointerMove: onInfoMove,
					onPointerUp: onInfoUp,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InfoPanel, { sys: state.sysInfo })
				}),
				sling && (() => {
					const fx = sling.fx;
					const fy = sling.fy;
					const tx = sling.tx;
					const ty = sling.ty;
					const ang = Math.atan2(ty - fy, tx - fx);
					const nx = -Math.sin(ang);
					const ny = Math.cos(ang);
					const r1 = 11;
					const r2 = 11;
					const waist = 4;
					const a1x = fx + nx * r1, a1y = fy + ny * r1;
					const a2x = fx - nx * r1, a2y = fy - ny * r1;
					const b1x = tx + nx * r2, b1y = ty + ny * r2;
					const b2x = tx - nx * r2, b2y = ty - ny * r2;
					const mx = (fx + tx) / 2, my = (fy + ty) / 2;
					const c1x = mx - nx * waist, c1y = my - ny * waist;
					const c2x = mx + nx * waist, c2y = my + ny * waist;
					const dripPath = `M ${a1x.toFixed(1)} ${a1y.toFixed(1)} Q ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${b1x.toFixed(1)} ${b1y.toFixed(1)} A ${r2} ${r2} 0 0 1 ${b2x.toFixed(1)} ${b2y.toFixed(1)} Q ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${a2x.toFixed(1)} ${a2y.toFixed(1)} A ${r1} ${r1} 0 0 1 ${a1x.toFixed(1)} ${a1y.toFixed(1)} Z`;
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
						className: "wg-slingshot",
						style: {
							position: "fixed",
							left: 0,
							top: 0,
							width: "100vw",
							height: "100vh",
							pointerEvents: "none",
							zIndex: 2147483646,
							overflow: "visible"
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("defs", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("linearGradient", {
								id: "wg-drip-grad",
								x1: "0%",
								y1: "0%",
								x2: "100%",
								y2: "100%",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("stop", {
									offset: "0%",
									stopColor: "rgba(120,170,255,0.9)"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("stop", {
									offset: "100%",
									stopColor: "rgba(74,108,247,0.9)"
								})]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("filter", {
								id: "wg-drip-glow",
								x: "-40%",
								y: "-40%",
								width: "180%",
								height: "180%",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("feGaussianBlur", {
									stdDeviation: "4",
									result: "blur"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("feMerge", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("feMergeNode", { in: "blur" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("feMergeNode", { in: "SourceGraphic" })] })]
							})] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
								d: dripPath,
								fill: "rgba(74,108,247,0.3)",
								filter: "url(#wg-drip-glow)"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
								d: dripPath,
								fill: "url(#wg-drip-grad)"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
								cx: fx,
								cy: fy,
								r: 7,
								fill: "rgba(120,170,255,0.9)",
								filter: "url(#wg-drip-glow)"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
								cx: tx,
								cy: ty,
								r: 7,
								fill: "rgba(74,108,247,0.9)",
								filter: "url(#wg-drip-glow)"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
								cx: fx,
								cy: fy,
								r: 3,
								fill: "#fff"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
								cx: tx,
								cy: ty,
								r: 3,
								fill: "#fff"
							})
						]
					});
				})(),
				menu && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WidgetMenu, {
					x: menu.x,
					y: menu.y,
					config,
					onChange: persistConfig,
					onResetPosition: resetPosition,
					onSleep: () => setSleeping(true),
					onClose: () => setMenu(null),
					providers,
					onSwitchProvider: handleSwitchProvider,
					switching
				})
			] });
		}
		//#endregion
		//#region src/client/index.tsx
		const name = "dsh-whale-girl";
		function apply(ctx) {
			if (document.getElementById("dsh-whale-girl-mount")) return;
			const host = document.createElement("div");
			host.id = "dsh-whale-girl-mount";
			host.style.position = "fixed";
			host.style.zIndex = "2147483647";
			host.style.top = "0";
			host.style.left = "0";
			host.style.width = "0";
			host.style.height = "0";
			document.body.appendChild(host);
			const slots = ctx?.get?.("slots");
			if (slots && typeof slots.inject === "function" && typeof slots.register === "function") {
				slots.inject("shell.overlay", () => slots.register({
					name: "shell.overlay",
					id: "whale-girl-widget",
					order: 70,
					label: "鲸鱼娘"
				}, () => (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsx)(WhaleWidget, {}), host)));
				return;
			}
			(0, react_dom_client.createRoot)(host).render(/* @__PURE__ */ (0, react_jsx_runtime.jsx)(WhaleWidget, {}));
		}
		//#endregion
		exports.apply = apply;
		exports.name = name;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map