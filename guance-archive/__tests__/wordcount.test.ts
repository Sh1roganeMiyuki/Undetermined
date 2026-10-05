import { test } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import * as act4 from '@/data/act4';
import * as annals from '@/data/annals';
import * as case1207 from '@/data/case1207';
import * as chapter1 from '@/data/chapter1';
import * as chronicle from '@/data/chronicle';
import * as daylight from '@/data/daylight';
import * as duplicates from '@/data/duplicates';
import * as entries from '@/data/entries';
import * as gov from '@/data/gov';
import * as hot from '@/data/hot';
import * as net from '@/data/net';
import * as news from '@/data/news';
import * as overload from '@/data/overload';
import * as people from '@/data/people';
import * as records from '@/data/records';
import * as scenes from '@/data/scenes';
import * as stories from '@/data/stories';
import * as talk from '@/data/talk';
import * as witness from '@/data/witness';

/**
 * 字数统计工具（不是断言集）：
 * 站内进度的唯一权威口径——规则是"设计文档的说法以数据文件为准"，
 * 所以字数也必须从数据文件数出来，不许估算。
 *
 * 口径：
 * - 汉字数：只数 U+4E00–U+9FFF；
 * - 含标点：汉字 + 中文标点（，。、；：""''（）——？！《》…·「」【】）；
 * - "全站去重"绕过共享引用（entries 聚合导出与其他模块指向同一批对象，只计一次）；
 * - 文件分布一栏为正则粗计（含注释），只作体量分布参考，不进合计。
 */

const HAN = /[\u4e00-\u9fff]/g;
const CN_PUNCT = /[，。、；：""''（）——？！《》…·「」【】]/g;

interface Acc {
  han: number;
  punct: number;
}

function countStr(s: string, acc: Acc) {
  acc.han += (s.match(HAN) ?? []).length;
  acc.punct += (s.match(CN_PUNCT) ?? []).length;
}

function walk(v: unknown, vis: WeakSet<object>, acc: Acc) {
  if (typeof v === 'string') {
    countStr(v, acc);
    return;
  }
  if (typeof v === 'function' || v === null || typeof v !== 'object') return;
  if (Array.isArray(v)) {
    for (const x of v) walk(x, vis, acc);
    return;
  }
  if (vis.has(v as object)) return;
  vis.add(v as object);
  for (const x of Object.values(v)) walk(x, vis, acc);
}

const fmt = (n: number) => n.toLocaleString('en-US');
const line = (label: string, acc: Acc) =>
  `${label.padEnd(28, ' ')} 汉字 ${fmt(acc.han).padStart(8)} ｜ 含标点 ${fmt(acc.han + acc.punct).padStart(8)}`;

test('字数统计（进度口径工具，无断言）', () => {
  const mods: Record<string, Record<string, unknown>> = {
    act4,
    annals,
    case1207,
    chapter1,
    chronicle,
    daylight,
    duplicates,
    entries,
    gov,
    hot,
    net,
    news,
    overload,
    people,
    records,
    scenes,
    stories,
    talk,
    witness,
  };

  // 1) 全站去重总量（权威口径）
  const total: Acc = { han: 0, punct: 0 };
  const totalVis = new WeakSet<object>();
  for (const m of Object.values(mods)) walk(m, totalVis, total);

  // 2) 小说双轨（chronicle + stories 互不重叠，单独可信）
  const fiction: Acc = { han: 0, punct: 0 };
  const ficVis = new WeakSet<object>();
  walk(chronicle, ficVis, fiction);
  walk(stories, ficVis, fiction);

  // 3) 各文件正则粗计（含注释，仅体量分布参考）
  const dataDir = join(process.cwd(), 'src', 'data');
  const files = readdirSync(dataDir).filter((f) => f.endsWith('.ts'));
  const rough = files
    .map((f) => {
      const src = readFileSync(join(dataDir, f), 'utf8');
      const han = (src.match(HAN) ?? []).length;
      return { f, han };
    })
    .sort((a, b) => b.han - a.han);

  // 4) 组件与逻辑层粗计（回执行文、台账行文等动态文案；含注释，仅参考）
  const compDir = join(process.cwd(), 'src', 'components');
  const libDir = join(process.cwd(), 'src', 'lib');
  const compFiles = [
    ...readdirSync(compDir).map((f) => join(compDir, f)),
    ...readdirSync(libDir, { recursive: true })
      .map((f) => join(libDir, String(f)))
      .filter((f) => f.endsWith('.ts') || f.endsWith('.tsx')),
  ].filter((f) => f.endsWith('.tsx') || f.endsWith('.ts'));
  let compHan = 0;
  for (const f of compFiles) {
    compHan += (readFileSync(f, 'utf8').match(HAN) ?? []).length;
  }

  console.log('\n──────── 字数统计（数据层权威口径）────────');
  console.log(line('全站合计（去重）', total));
  console.log(line('  其中：小说双轨（纪事+口述）', fiction));
  console.log(
    `  小说占比：${((fiction.han / total.han) * 100).toFixed(1)}% ｜ 非小说：${fmt(
      total.han - fiction.han,
    )}`,
  );
  console.log(
    `  组件/逻辑层文案（粗计，含注释，不入合计）：汉字 ${fmt(compHan)}`,
  );
  console.log('\n──────── 各文件粗计（正则，含注释，仅供参考）────────');
  for (const r of rough) console.log(`  ${r.f.padEnd(16, ' ')} ${fmt(r.han).padStart(8)}`);
  console.log('────────────────────────────────────────\n');
});