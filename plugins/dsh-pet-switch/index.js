// dsh-pet-switch —— 桌宠总开关（宿主半侧）
//
// 目的：桌宠类插件都靠「在 profile 的 dsh.profile.bundles 里」决定是否参与启动，
// 而 desktop profile 被 CLI 拒绝管理、也没有现成的图形开关。
// 本插件在本机 127.0.0.1 起一个小页面，勾选后就地改写 bundles。
//
// 安全边界：
//   - 只监听 127.0.0.1（不暴露到局域网）
//   - 只认识下面 PETS 白名单里的包名，其它 bundle 一律不许增删
//   - 每次写之前把原 package.json 备份到 $DSH_HOME/pet-switch/backups/
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const name = 'pet-switch';

// 必须在 webServer 服务就绪后再注册路由（否则 ctx.webServer 是 undefined，
// 路由压根不挂，页面 fetch 会打到宿主的 404「not found」）。
export const inject = ['webServer'];

const PKG_ROOT = path.dirname(fileURLToPath(import.meta.url));
const DSH_HOME = process.env.DSH_HOME || path.join(os.homedir(), '.dsh');
const DATA_DIR = path.join(DSH_HOME, 'pet-switch');
const PAGE_FILE = path.join(PKG_ROOT, 'page.html');

// 桌宠清单：只有这里列出的包名可以被开关
const PETS = [
  {
    id: 'dsh-pet',
    name: '大肥鱼',
    pkg: 'dsh-pet',
    desc: '会漫游、玩魔方、被你甩来甩去的蓝色大肥鱼；浏览器右上角 + 桌面透明窗，可看余额、能唠两句。',
  },
  {
    id: 'dsh-whale-girl',
    name: '鲸鱼娘',
    pkg: 'dsh-whale-girl',
    desc: 'DeepSeek 余额/上下文挂件：绳摆拖拽、甩抛弹跳、重力落地、打瞌睡，角色固定。',
  },
  {
    id: 'dsh-whale-widget',
    name: '小鲸鱼记账挂件',
    pkg: 'dsh-whale-widget',
    desc: '右下角记账小鲸鱼：余额、今日已用、峰谷时段、气泡点击序列；角色图可换（现在是你的大肥鱼立绘）。',
  },
];
const PET_INDEX = new Map(PETS.map((p) => [p.id, p]));

function profileFile() {
  for (const profile of ['desktop', 'web']) {
    const f = path.join(DSH_HOME, 'profiles', profile, 'package.json');
    if (fs.existsSync(f)) return { file: f, profile };
  }
  return null;
}

function readProfile(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function bundlesOf(doc) {
  const list = doc?.dsh?.profile?.bundles;
  return Array.isArray(list) ? list : [];
}

function stateOf() {
  const target = profileFile();
  if (!target) return { ok: false, error: '找不到 profile 的 package.json（desktop / web 都没有）' };
  const doc = readProfile(target.file);
  const bundles = bundlesOf(doc);
  return {
    ok: true,
    profile: target.profile,
    profileFile: target.file,
    pets: PETS.map((p) => ({ id: p.id, name: p.name, pkg: p.pkg, desc: p.desc, enabled: bundles.includes(p.pkg) })),
    // 展示用：bundles 里除桌宠以外的条目（本页面不会动它们）
    others: bundles.filter((b) => !PETS.some((p) => p.pkg === b)),
    restartHint: '改完必须完全退出 DSH（含托盘）再重开，插件才会重新按 bundles 装载。',
  };
}

function applySelection(enabledIds) {
  if (!Array.isArray(enabledIds)) throw new Error('enabled 必须是数组');
  const wanted = new Set();
  for (const id of enabledIds) {
    const pet = PET_INDEX.get(String(id));
    if (!pet) throw new Error(`未知桌宠：${id}`);
    wanted.add(pet.pkg);
  }
  const target = profileFile();
  if (!target) throw new Error('找不到 profile 的 package.json');
  const doc = readProfile(target.file);
  const before = bundlesOf(doc);

  // 保留非桌宠条目与原有顺序；桌宠条目按 PETS 顺序重排到最后
  const others = before.filter((b) => !PETS.some((p) => p.pkg === b));
  const kept = PETS.filter((p) => wanted.has(p.pkg)).map((p) => p.pkg);
  const after = [...others, ...kept];

  fs.mkdirSync(path.join(DATA_DIR, 'backups'), { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.copyFileSync(target.file, path.join(DATA_DIR, 'backups', `package.json.${stamp}.bak`));

  doc.dsh = doc.dsh || {};
  doc.dsh.profile = doc.dsh.profile || {};
  doc.dsh.profile.bundles = after;
  const tmp = target.file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(doc, null, 2) + '\n', 'utf8');
  fs.renameSync(tmp, target.file);

  return { ok: true, profile: target.profile, profileFile: target.file, bundles: after, removed: before.filter((b) => wanted.size && !after.includes(b) && PETS.some((p) => p.pkg === b)) };
}

function send(res, code, type, body) {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > 64 * 1024) throw new Error('请求体过大');
    chunks.push(c);
  }
  return Buffer.concat(chunks).toString('utf8');
}

// —— 给 DSH 页面用的同源接口（设置页卡片走这条）——
const WEB_STATE_PATH = '/api/pet-switch/state';
const WEB_APPLY_PATH = '/api/pet-switch/apply';

function sameOrigin(req) {
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (!origin) return true;
  try {
    return new URL(origin).host.toLowerCase() === String(host || '').split('/')[0].toLowerCase();
  } catch {
    return false;
  }
}

async function webHandler(req, res) {
  const method = (req.method || 'GET').toUpperCase();
  const pathname = new URL(req.url || '/', 'http://127.0.0.1').pathname;
  try {
    if (method === 'GET' && pathname === WEB_STATE_PATH) {
      return send(res, 200, 'application/json; charset=utf-8', JSON.stringify(stateOf()));
    }
    if (method === 'POST' && pathname === WEB_APPLY_PATH) {
      if (!sameOrigin(req)) return send(res, 403, 'application/json; charset=utf-8', JSON.stringify({ ok: false, error: 'cross-origin request rejected' }));
      const body = JSON.parse((await readBody(req)) || '{}');
      return send(res, 200, 'application/json; charset=utf-8', JSON.stringify(applySelection(body.enabled || [])));
    }
    return send(res, 404, 'application/json; charset=utf-8', JSON.stringify({ ok: false, error: 'not found' }));
  } catch (err) {
    return send(res, 400, 'application/json; charset=utf-8', JSON.stringify({ ok: false, error: String((err && err.message) || err) }));
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1');
  try {
    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      const html = fs.readFileSync(PAGE_FILE);
      return send(res, 200, 'text/html; charset=utf-8', html);
    }
    if (req.method === 'GET' && url.pathname === '/api/state') {
      return send(res, 200, 'application/json; charset=utf-8', JSON.stringify(stateOf()));
    }
    if (req.method === 'POST' && url.pathname === '/api/apply') {
      const body = JSON.parse((await readBody(req)) || '{}');
      const out = applySelection(body.enabled || []);
      return send(res, 200, 'application/json; charset=utf-8', JSON.stringify(out));
    }
    if (req.method === 'GET' && url.pathname === '/health') {
      return send(res, 200, 'application/json; charset=utf-8', JSON.stringify({ ok: true, name }));
    }
    return send(res, 404, 'application/json; charset=utf-8', JSON.stringify({ ok: false, error: 'not found' }));
  } catch (err) {
    return send(res, 400, 'application/json; charset=utf-8', JSON.stringify({ ok: false, error: String((err && err.message) || err) }));
  }
});

export function apply(ctx) {
  const basePort = Number(process.env.DSH_PET_SWITCH_PORT || 3081);
  let port = basePort;
  let attempts = 0;

  const onListening = () => {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const url = `http://127.0.0.1:${port}/`;
    fs.writeFileSync(path.join(DATA_DIR, 'url.txt'), url + '\n', 'utf8');
    // eslint-disable-next-line no-console
    console.log(`[pet-switch] 桌宠开关已就绪：${url}`);
  };

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE' && attempts < 9) {
      attempts += 1;
      port = basePort + attempts;
      server.listen(port, '127.0.0.1');
      return;
    }
    // eslint-disable-next-line no-console
    console.error('[pet-switch] 启动失败：', err && err.message);
  });
  server.on('listening', onListening);
  server.listen(port, '127.0.0.1');

  if (ctx && typeof ctx.effect === 'function') {
    ctx.effect(() => () => {
      try { server.close(); } catch (err) {}
    });
  }

  // 设置页卡片用的同源接口（挂在 DSH 自己的 webServer 上）
  const web = ctx && ctx.webServer
  if (web && typeof web.register === 'function') {
    for (const p of [WEB_STATE_PATH, WEB_APPLY_PATH]) {
      const route = { kind: 'exact', path: p, handler: webHandler }
      if (typeof ctx.effect === 'function') ctx.effect(() => web.register(route))
      else web.register(route)
    }
  } else {
    // eslint-disable-next-line no-console
    console.warn('[pet-switch] 没有拿到 webServer 服务，设置页卡片会读不到数据')
  }
}
