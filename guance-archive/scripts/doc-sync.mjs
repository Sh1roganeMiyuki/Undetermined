/**
 * 文档同步工具：docs/06 剧情正文汇编 ↔ src/data 权威文本。
 *
 * 汇编是作者通读用的副本，权威版本永远是数据文件。每次内容批次产出后，
 * 人工把新篇目抄进汇编——这条路已经重复多轮，抄错一次就会让"以数据为准"
 * 变成一句空话。本工具把它变成可执行的检查：
 *
 *   node scripts/doc-sync.mjs                 校验（机器门）：每个篇目抽查首/中/尾三段
 *   node scripts/doc-sync.mjs dump <前缀>      导出（如 dump chronicle-10 / dump story-06），
 *                                            输出可直接粘入汇编的 markdown 片段
 *
 * 只查"存在性"不查字字相等：汇编允许夹注（阅读模式说明、互锁记录等）。
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
// 文档与代码同级分置：docs/ 在工作区根（guance-archive 的上一级），不在本仓库内。
const DOC = join(root, '..', 'docs', '06_剧情正文汇编.md');

const FILES = [
  {
    src: join(root, 'src', 'data', 'chronicle.ts'),
    label: '连载',
    prefix: 'chronicle-',
    ids: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'],
  },
  {
    // 终局轨别卷（afterChoice 门后到达），与连载同居 chronicle.ts。
    // 2026-10-07 四册齐后抄入汇编，同批纳入本门看守。
    src: join(root, 'src', 'data', 'chronicle.ts'),
    label: '别卷',
    prefix: 'chronicle-',
    ids: ['x1', 'x2', 'x3', 'x4'],
  },
  {
    src: join(root, 'src', 'data', 'stories.ts'),
    label: '口述',
    prefix: 'story-',
    ids: ['01', '02', '03', '04', '05', '06'],
  },
];

function blocksOf(src, prefix) {
  const re = new RegExp(`id: '(${prefix}[\\w-]+)',\\s*type: '([\\w-]+)',\\s*text: '([^']*)'`, 'g');
  const out = [];
  let m;
  while ((m = re.exec(src))) out.push({ id: m[1], type: m[2], text: m[3] });
  return out;
}

/**
 * 比对前的规范化：去空白、把各类引号归一。
 * 历史篇目的汇编副本与数据文件存在引号形态差异（弯引号/直引号混用），
 * 逐字比对会产生假阳性；去空白+引号归一后，只保留真正的“段落缺失”信号。
 */
function norm(s) {
  return s.replace(/\s+/g, '').replace(/[“”"'「」『』]/g, 'Q');
}

const mode = process.argv[2] ?? 'check';
const arg = process.argv[3];

if (mode === 'dump') {
  if (!arg) {
    console.error('用法：node scripts/doc-sync.mjs dump <前缀>（如 chronicle-10 / story-06）');
    process.exit(2);
  }
  let hit = false;
  for (const f of FILES) {
    const blocks = blocksOf(readFileSync(f.src, 'utf8'), `${arg}-`);
    if (blocks.length === 0) continue;
    console.log(blocks.map((b) => (b.type === 'heading' ? `**${b.text}**` : b.text)).join('\n\n'));
    hit = true;
    break;
  }
  if (!hit) {
    console.error(`未找到前缀为 ${arg}- 的篇目`);
    process.exit(2);
  }
  process.exit(0);
}

// —— check 模式 ——
const doc = norm(readFileSync(DOC, 'utf8'));
const problems = [];
let checked = 0;

for (const f of FILES) {
  const src = readFileSync(f.src, 'utf8');
  for (const id of f.ids) {
    const blocks = blocksOf(src, `${f.prefix}${id}-`);
    // 跳过口述的采集信息行（其信息已在汇编节标题中；旧篇目的副本未收录该行）
    const paras = blocks.filter(
      (b) => b.type === 'paragraph' && b.text.length > 8 && !b.text.startsWith('口述采集'),
    );
    if (paras.length === 0) {
      problems.push(`${f.label}${id}：数据文件里找不到正文块`);
      continue;
    }
    const picks = [paras[0], paras[Math.floor(paras.length / 2)], paras[paras.length - 1]];
    for (const p of picks) {
      if (!doc.includes(norm(p.text))) {
        problems.push(`${f.label}${id}（${p.id}）：该段未在汇编中找到，或与汇编不一致`);
      }
    }
    checked += 1;
  }
}

if (problems.length > 0) {
  console.error(`✗ 汇编与数据不一致：${problems.length} 处`);
  for (const p of problems) console.error(`  - ${p}`);
  console.error('请以数据文件为准：node scripts/doc-sync.mjs dump <前缀>，重新生成片段并更新 docs/06。');
  process.exit(1);
}
console.log(`✓ 汇编与数据一致（${checked} 个篇目，各抽查首/中/尾三段）`);