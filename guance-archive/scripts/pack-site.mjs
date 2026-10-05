#!/usr/bin/env node
/**
 * 把静态导出目录打包成单个 site.pak 容器。
 *
 * 为什么需要它：站点是纯静态导出，`out/` 里每个页面都是明文 HTML，
 * 每个 chunk 都是明文 JS——把发布物以目录形式交付，等于把五幕全文
 * 摊在读者桌面上，打开文件夹就能 Ctrl+F 读完。这与"投放门控"的意图相反：
 * 门控管的是"什么时候进他的世界"，不是"文件在不在磁盘上"。
 *
 * 本脚本不追求加密。它只做一件事：**让发布物里没有可直接阅读的明文**。
 * 解密逻辑与密钥都在随包交付的 serve.mjs / pak 头里——一个愿意读服务端
 * 源码的人仍然能拿到全文，那是他主动选择退出体验；但"顺手翻文件夹"
 * 这条路没有了。这是成本抬升，不是防护，文档里应当照实这么写。
 *
 * 用法：
 *   node scripts/pack-site.mjs [源目录] [输出文件]   （默认 out / site.pak）
 *
 * 容器格式（v2）：
 *   "GAPAK2\n" + <header json utf8> + "\n" + <payload>
 *   header = { v:2, algo:'aes-256-ctr', key:<base64>, iv:<base64>,
 *              index:{ "<相对路径>": [offset, length] } }
 *   payload = 全部文件明文拼接后一次性 AES-256-CTR 加密
 * 相对路径一律用 "/" 分隔、不带前导斜杠；目录以 "<dir>/index.html" 入表。
 *
 * 为什么不用更简单的异或：异或密钥是周期性的，源文件里任何一段长零串
 * （图标、字体、sourcemap 里都有）都会把密钥本身原样显影在容器里，
 * 打开十六进制编辑器就能看见。流密码没有这个破绽。
 */
import { createCipheriv, randomBytes } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const srcArg = process.argv[2] || 'out';
const outArg = process.argv[3] || 'site.pak';
const src = path.resolve(process.cwd(), srcArg);
const out = path.resolve(process.cwd(), outArg);

const MAGIC = 'GAPAK2';
/** 每次打包随机生成。密钥随包交付（见文件头注释），因此它抬成本，不提供保密。 */
const KEY = randomBytes(32);
const IV = randomBytes(16);

async function walk(dir, rel, acc) {
  for (const ent of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    const r = rel ? `${rel}/${ent.name}` : ent.name;
    if (ent.isDirectory()) await walk(p, r, acc);
    else if (ent.isFile()) acc.push({ rel: r, abs: p });
  }
  return acc;
}

const files = (await walk(src, '', [])).sort((a, b) => (a.rel < b.rel ? -1 : 1));
if (files.length === 0) {
  console.error(`pack-site: 源目录为空：${src}`);
  process.exit(1);
}
if (!files.some((f) => f.rel === 'index.html')) {
  console.error('pack-site: 源目录缺少 index.html——它不像一个静态导出，拒绝打包。');
  process.exit(1);
}

const index = {};
const plainChunks = [];
let offset = 0;
for (const f of files) {
  const raw = await readFile(f.abs);
  index[f.rel] = [offset, raw.length];
  plainChunks.push(raw);
  offset += raw.length;
}

// 一次性加密拼接后的全文：索引记的是**明文**偏移，解密整块后直接切片。
const cipher = createCipheriv('aes-256-ctr', KEY, IV);
const payload = Buffer.concat([cipher.update(Buffer.concat(plainChunks)), cipher.final()]);

const header = Buffer.from(
  JSON.stringify({
    v: 2,
    algo: 'aes-256-ctr',
    key: KEY.toString('base64'),
    iv: IV.toString('base64'),
    index,
  }),
  'utf8',
);
await writeFile(out, Buffer.concat([Buffer.from(`${MAGIC}\n`, 'utf8'), header, Buffer.from('\n'), payload]));

console.log(
  `pack-site: ${files.length} 个文件 → ${path.relative(process.cwd(), out)}` +
    `（${(offset / 1024 / 1024).toFixed(1)} MB）`,
);
