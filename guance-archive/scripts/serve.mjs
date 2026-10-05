#!/usr/bin/env node
/**
 * 本地静态服务器（零依赖，只用 Node 内置模块）。
 *
 * 为什么需要它：站点是静态导出，直接双击 HTML 不可行——file:// 下
 * /_next/ 的绝对路径会挂，浏览器的本地存储也另成一套。用固定端口
 * 把它伺服起来：同机、同端口 = 同一个"世界"，登记记录跨天不丢。
 *
 * 用法：
 *   node serve.mjs [根] [端口]     （默认 out / 7788）
 *   环境变量 NO_OPEN=1 时不自动打开浏览器（调试用）。
 *
 * [根] 可以是两种形态：
 *   1. 目录（开发期，直接伺服 out/）；
 *   2. 单个 .pak 容器（发布形态，见 scripts/pack-site.mjs）。
 * 发布形态下磁盘上没有可读的 HTML/JS——读者"顺手翻文件夹读完全文"
 * 这条路不存在；解密只发生在内存里、只为响应一次请求。
 *
 * 纪律：本文件不记录、不上报任何数据；站点的全部"记忆"都在浏览器
 * 本地存储里，与它无关。HTML 一律 no-cache，避免代理缓存把旧版本
 * 塞给读者、破坏"世界只有一条主干"的前提。
 */
import http from 'node:http';
import { createDecipheriv } from 'node:crypto';
import { createReadStream, readFileSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

const rootArg = process.argv[2] || 'out';
const port = Number(process.argv[3] || 7788);
const root = path.resolve(process.cwd(), rootArg);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
};

/* ----------------------------- pak 容器 ----------------------------- */

const PAK_MAGIC = 'GAPAK2';

/**
 * 读入 pak：头里带索引、算法与密钥，正文是密文。
 * 启动时一次性解密成明文 Buffer 留在内存，按请求切片——
 * 不在磁盘上落任何明文，也不为每个请求重建解密器。
 * （CTR 的计数器与偏移绑定，逐请求解密切片需要自己算计数器，
 * 不值得：这是本地服务器，14MB 明文在内存里毫无压力。）
 */
function loadPak(file) {
  const raw = readFileSync(file);
  const nl1 = raw.indexOf(0x0a);
  if (nl1 < 0 || raw.subarray(0, PAK_MAGIC.length).toString('utf8') !== PAK_MAGIC) {
    console.error(`serve: 不是合法的 pak 容器（或仍是旧版异或格式）：${file}`);
    process.exit(1);
  }
  // 布局：MAGIC\n + header\n + payload。两个换行符都要找，
  // 只找第一个会把 header 切成空串（MAGIC 后紧跟的就是它）。
  const nl2 = raw.indexOf(0x0a, nl1 + 1);
  let header;
  try {
    header = JSON.parse(raw.subarray(nl1 + 1, nl2).toString('utf8'));
  } catch {
    console.error(`serve: pak 头损坏：${file}`);
    process.exit(1);
  }
  if (header.algo !== 'aes-256-ctr') {
    console.error(`serve: 不支持的 pak 算法：${header.algo}`);
    process.exit(1);
  }
  const decipher = createDecipheriv(
    'aes-256-ctr',
    Buffer.from(header.key, 'base64'),
    Buffer.from(header.iv, 'base64'),
  );
  const payload = Buffer.concat([decipher.update(raw.subarray(nl2 + 1)), decipher.final()]);
  return {
    index: header.index,
    get(rel) {
      const hit = header.index[rel];
      if (!hit) return null;
      const [off, len] = hit;
      return payload.subarray(off, off + len);
    },
  };
}

const isPak = root.toLowerCase().endsWith('.pak');
const PAK = isPak ? loadPak(root) : null;
if (isPak && !PAK.index['index.html']) {
  console.error('serve: pak 里没有 index.html，拒绝启动。');
  process.exit(1);
}

/** 目录式路由：path → index.html；无扩展名时再试 path.html。与目录模式同口径。 */
function pakCandidates(pathname) {
  const base = pathname.replace(/^\/+/, '').replace(/\/+$/, '');
  if (base === '') return ['index.html'];
  return [`${base}/index.html`, base, `${base}.html`];
}

/* ----------------------------- 目录模式 ----------------------------- */

async function fileInfo(p) {
  try {
    const s = await stat(p);
    return s.isFile() ? s : null;
  } catch {
    return null;
  }
}

function serveBuffer(res, buf, file, code, method) {
  const type = MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream';
  const immutable = /_next\/static\//.test(file);
  res.writeHead(code, {
    'Content-Type': type,
    'Content-Length': buf.length,
    'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
  });
  if (method === 'HEAD') {
    res.end();
    return;
  }
  res.end(buf);
}

function serveFile(res, file, s, code, method) {
  const type = MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream';
  const immutable = /[\\/]_next[\\/]static[\\/]/.test(file);
  res.writeHead(code, {
    'Content-Type': type,
    'Content-Length': s.size,
    'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
  });
  if (method === 'HEAD') {
    res.end();
    return;
  }
  createReadStream(file).pipe(res);
}

const server = http.createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' }).end('405');
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' }).end('400');
    return;
  }

  if (PAK) {
    // 索引键是规范化后的相对路径；".."一类在规范化后不可能命中任何键，天然安全。
    const safe = path.posix.normalize(pathname).replace(/^\/+/, '');
    for (const c of pakCandidates(safe === '' ? '/' : safe)) {
      const buf = PAK.get(c);
      if (buf) {
        serveBuffer(res, buf, c, 200, req.method);
        return;
      }
    }
    const nf = PAK.get('404.html');
    if (nf) {
      serveBuffer(res, nf, '404.html', 404, req.method);
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404');
    return;
  }

  // 目录穿越防护：解码 → 规范化 → 必须落在 root 之内。
  const safe = path.normalize(pathname).replace(/^[/\\]+/, '');
  const target = path.resolve(root, safe);
  if (target !== root && !target.startsWith(root + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' }).end('403');
    return;
  }

  // 静态导出的路由是目录式的（path/index.html）；目录路径无斜杠时也兜底。
  const candidates = pathname.endsWith('/')
    ? [path.join(target, 'index.html')]
    : [target, path.join(target, 'index.html')];
  if (!path.extname(pathname)) candidates.push(target + '.html');

  for (const c of candidates) {
    const s = await fileInfo(c);
    if (s) {
      serveFile(res, c, s, 200, req.method);
      return;
    }
  }

  const nf = await fileInfo(path.join(root, '404.html'));
  if (nf) {
    serveFile(res, path.join(root, '404.html'), nf, 404, req.method);
    return;
  }
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`端口 ${port} 已被占用：可能已有一个体验窗口在运行。`);
    console.error('请先关闭它再启动，或改用其它端口重试（换端口等于换一个"世界"）。');
  } else {
    console.error(err);
  }
  process.exit(1);
});

server.listen(port, '0.0.0.0', () => {
  const url = `http://localhost:${port}/`;
  console.log('城北新区资料协作平台 · 本地体验');
  console.log(`  本机访问：${url}`);
  for (const addrs of Object.values(os.networkInterfaces())) {
    for (const a of addrs ?? []) {
      if (a.family === 'IPv4' && !a.internal) {
        console.log(`  同一 Wi-Fi 下：http://${a.address}:${port}/`);
      }
    }
  }
  console.log('  提示：请固定用同一浏览器访问，且不要清理浏览数据。');
  console.log('  按 Ctrl+C 或直接关闭本窗口即结束。');
  if (!process.env.NO_OPEN) {
    // 以 argv 数组传参（不经 shell 拼接）打开浏览器。
    const [cmd, args] =
      process.platform === 'win32'
        ? ['cmd', ['/c', 'start', '', url]]
        : process.platform === 'darwin'
          ? ['open', [url]]
          : ['xdg-open', [url]];
    spawn(cmd, args, { detached: true, stdio: 'ignore' }).unref();
  }
});
