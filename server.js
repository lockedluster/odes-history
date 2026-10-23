// Odes History Extractor: local server. Node 18+, no dependencies.
// Run: node server.js  ->  http://127.0.0.1:3000
const http = require('http'), fs = require('fs'), path = require('path');
const cfgPath = path.join(__dirname, 'config.json');
const readCfg = () => JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const HOSTS = {
  os: 'public-operation-hk4e-sg.hoyoverse.com',
  cn: 'public-operation-hk4e.mihoyo.com'
}; // fixed allowlist
const PASS = ['authkey', 'authkey_ver', 'sign_type', 'auth_appid', 'game_biz', 'region', 'lang'];

async function fetchLog(b) {
  const cfg = readCfg();
  const p = (b.path || cfg.path || '').replace(/^\/+/, '');
  if (!p) return { retcode: -1, message: 'Odes endpoint path is not configured (see README).' };
  if (!/^[\w\/-]+$/.test(p)) return { retcode: -1, message: 'Invalid endpoint path.' };
  const host = HOSTS[b.region];
  if (!host) return { retcode: -1, message: 'Unknown region.' };
  let src;
  try { src = new URL(b.url); } catch { return { retcode: -1, message: 'That is not a valid URL.' }; }
  if (!src.searchParams.get('authkey')) return { retcode: -1, message: 'No authkey found in the URL.' };
  const u = new URL(`https://${host}/${p}`);
  for (const k of PASS) if (src.searchParams.has(k)) u.searchParams.set(k, src.searchParams.get(k));
  u.searchParams.set('gacha_type', String(b.gachaType));
  u.searchParams.set('page', String(b.page || 1));
  u.searchParams.set('size', String(cfg.pageSize || 20));
  u.searchParams.set('end_id', String(b.endId || 0));
  try {
    const r = await fetch(u, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(15000) });
    return await r.json();
  } catch (e) { return { retcode: -1, message: 'Upstream request failed: ' + e.message }; }
}

const send = (res, code, body, type = 'application/json') => {
  res.writeHead(code, { 'Content-Type': type });
  res.end(Buffer.isBuffer(body) || typeof body === 'string' ? body : JSON.stringify(body));
};

http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    return send(res, 200, fs.readFileSync(path.join(__dirname, 'index.html')), 'text/html; charset=utf-8');
  }
  if (req.method === 'GET' && req.url === '/api/config') return send(res, 200, readCfg());
  if (req.method === 'POST' && req.url === '/api/log') {
    let raw = '';
    req.on('data', c => { raw += c; if (raw.length > 1e5) req.destroy(); });
    req.on('end', async () => {
      try { send(res, 200, await fetchLog(JSON.parse(raw))); }
      catch { send(res, 400, { retcode: -1, message: 'Bad request.' }); }
    });
    return;
  }
  send(res, 404, { error: 'not found' });
}).listen(3000, '127.0.0.1', () => console.log('Odes History Extractor: http://127.0.0.1:3000'));
