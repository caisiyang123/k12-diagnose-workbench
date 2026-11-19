/**
 * DSH host entry for the K12 knowledge-graph workbench.
 *
 * Serves the full original static site (xiaoyang111222/cn-math-taxonomy,
 * CC BY-NC 4.0) verbatim under /k12-site/* so the workbench panel can embed it
 * 1:1 via an iframe. Routes are registered on the bare webServer (the same
 * pattern dshmarket uses for its own pages), which allows directory paths with
 * trailing slashes and does not go through the /api Fetch-route validator.
 */

import Schema from '@deepseek-ai/schemastery';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const name = 'k12-diagnose-workbench';
export const inject = [];
export const Config = Schema.object({ root: Schema.string().required() });

const SITE_ROOT = fileURLToPath(new URL('../site/', import.meta.url));
const ROUTE_PREFIX = '/k12-site';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8'
};

const BINARY = new Set(['.png', '.ico', '.jpg', '.jpeg', '.gif', '.webp']);

function listFiles(dir, base = '') {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const rel = base ? `${base}/${name}` : name;
    if (statSync(full).isDirectory()) out.push(...listFiles(full, rel));
    else out.push(rel.replaceAll(sep, '/'));
  }
  return out;
}

export function apply(ctx) {
  ctx.inject(['webServer'], (hostCtx) => {
    const ws = hostCtx.webServer;
    const files = listFiles(SITE_ROOT);
    const cache = new Map();

    const load = (rel) => {
      if (cache.has(rel)) return cache.get(rel);
      const full = join(SITE_ROOT, ...rel.split('/'));
      const ext = extname(rel).toLowerCase();
      const mime = MIME[ext] || 'application/octet-stream';
      const body = BINARY.has(ext) ? readFileSync(full) : readFileSync(full, 'utf8');
      const entry = { body, mime };
      cache.set(rel, entry);
      return entry;
    };

    const disposers = [];
    const register = (path, rel) => {
      disposers.push(ws.register({
        kind: 'exact',
        path,
        handler: (request, response) => {
          if (request.method !== 'GET' && request.method !== 'HEAD') {
            response.writeHead(405, { allow: 'GET, HEAD' });
            response.end();
            return;
          }
          const { body, mime } = load(rel);
          response.writeHead(200, { 'content-type': mime, 'cache-control': 'no-store' });
          if (request.method === 'HEAD') { response.end(); return; }
          response.end(body);
        }
      }));
    };

    // 每个文件一条精确路由（含尾斜杠目录路径 → index.html）
    for (const rel of files) {
      register(`${ROUTE_PREFIX}/${rel}`, rel);
    }
    for (const dir of ['', 'explore', 'diagnose', 'children']) {
      const rel = dir ? `${dir}/index.html` : 'index.html';
      if (dir) {
        register(`${ROUTE_PREFIX}/${dir}/`, rel);
        register(`${ROUTE_PREFIX}/${dir}`, rel);
      } else {
        register(`${ROUTE_PREFIX}/`, rel);
        register(ROUTE_PREFIX, rel);
      }
    }

    return () => { for (const d of disposers) { try { d(); } catch { /* 已释放 */ } } };
  });
}
