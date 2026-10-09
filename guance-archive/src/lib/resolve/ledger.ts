import { blockOwner, blockText, getEntry } from '@/data/entries';
import { CHRONICLES } from '@/data/chronicle';
import { GOV_DOCS } from '@/data/gov';
import { HOT_SNAPSHOTS } from '@/data/hot';
import { NET_RECORDS } from '@/data/net';
import { NEWS_ISSUES } from '@/data/news';
import { STORIES } from '@/data/stories';
import { duration } from '@/lib/format';
import { viewerIdOf } from '@/lib/resolve/identity';
import type { FirstVisitLike } from '@/lib/resolve/identity';

/**
 * 玩家台账：由真实行为数据生成的行文（须知增补的统计、见证人函的核对清册）。
 *
 * 全部输入来自真实信号（见 traceStore），没有任何推断字段——
 * 台账的力量来自它抄的都是真的：
 * - 停留最久的一段：seen 里毫秒数最大的块，文本从 blockText 取开头；
 * - 复制过的段落：snapshots 的原文（快照存的是块文本，台账抄开头，不改口）；
 * - 打开过的条目 / 栏目材料：visits 里能否找到词条。
 *
 * 这是纯函数：组件传 store 快照进来，测试传构造数据进来，两处同一份行文逻辑。
 */
export interface LedgerInput {
  seen: Record<string, number>;
  snapshots: Record<string, { text: string; at: number }>;
  visits: Record<string, FirstVisitLike & { n: number }>;
  days: string[];
}

export interface LedgerData {
  viewerId: string;
  /** 打开过的词条数 */
  entriesOpened: number;
  /** 打开过的栏目材料数（新闻档、榜单、网络存档等） */
  otherOpened: number;
  /** 重复打开的合计次数 */
  revisits: number;
  /** 出现过的自然日数 */
  spanDays: number;
  /** 最早的自然日（YYYY-MM-DD），无记录时为空串 */
  firstDay: string;
  /** 停留最久的一段；未达显著时长或取不到文本时为 null */
  longest: { title: string; excerpt: string; dur: string } | null;
  /** 最近一次复制留存；无快照时为 null */
  copied: { excerpt: string; count: number } | null;
  /** 打开过的词条标题，按首次到访先后排列 */
  openedTitles: string[];
}

/**
 * 台账里"读了什么"的名字。唯一出口——组件不得自己拼。
 *
 * 为什么必须有这张表：到访键是**存储身份**，不是名字。词条页记 slug，
 * 栏目详情页记 `<栏目>:<id>`（news:news-1104／gov:gov-plan-draft／net:net-1102／
 * hot:hot-1031-6），栏目录入页记裸栏目名，稿件页记 story id，留存类记
 * `<slug>:<段落 id>` 两段式。只解析词条、其余原样落纸，读者就会在一份
 * 自称"由本站自动生成、不受理更正申请"的文书里读到 `chronicle-01`——
 * 那不是异常，那是穿帮：本作最贵的失败模式正是玩家把异常当成故障（`04 §五`）。
 *
 * 纪律：**站内每一种到访键都必须在此有解。** 新增载体时补一行，
 * `mechanisms` 73 的花名册断言看守（判据是"名字里必须有汉字"）。
 * 兜底仍返回原键而不是空串——台账宁可露出一次穿帮，也不留一行空白。
 */
const COLUMN_NAME: Record<string, string> = {
  news: '城北新闻',
  gov: '城北政务',
  net: '网络存档',
  hot: '城北同城榜',
  // 稿件栏目的录入页：ArchiveIndex 承载另外四栏，StoryList 承载这两栏。
  stories: '城北口述',
  chronicle: '城北纪事',
};

/** 栏目详情页：由 `<栏目>:<id>` 的 id 段取回它在屏幕上显示的那一行题名。 */
const DETAIL_NAME: Record<string, (id: string) => string | undefined> = {
  news: (id) => {
    const n = NEWS_ISSUES.find((x) => x.id === id);
    return n ? `${n.label} · ${n.slot}` : undefined;
  },
  gov: (id) => GOV_DOCS.find((x) => x.id === id)?.title,
  net: (id) => NET_RECORDS.find((x) => x.id === id)?.at,
  hot: (id) =>
    HOT_SNAPSHOTS.flatMap((s) => s.topics).find((t) => t.id === id)?.topic,
};

/** 稿件（《城北纪事》连载与《城北口述》辑共用 Story 形状），含终局轨别卷。 */
const MANUSCRIPTS = [...CHRONICLES, ...STORIES];

export function docName(target: string): string {
  const cut = target.indexOf(':');
  const head = cut < 0 ? target : target.slice(0, cut);
  const tail = cut < 0 ? '' : target.slice(cut + 1);

  // 带栏目前缀的详情页。留存类的两段式（`<词条 slug>:<段落 id>`）走不到这里：
  // 词条 slug 不在 DETAIL_NAME 里，会落到下面的 getEntry，只写条目名。
  if (tail) {
    const named = DETAIL_NAME[head]?.(tail);
    if (named) return named;
  }
  const entry = getEntry(head);
  if (entry) return entry.title;
  const ms = MANUSCRIPTS.find((x) => x.id === head);
  if (ms) return ms.title;
  return COLUMN_NAME[head] ?? target;
}

/** 只截开头：台账抄的是原件的开头，不改口、不评注。 */
function clip(text: string, n: number): string {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n)}……` : t;
}

/** 低于这个时长的停留不进台账——"最久的一段"得像一段，而不是一瞥。
 *  自我化石（traceStore 的 frozenLongest）共用同一条门槛：两处口径必须是一个数。 */
export const MIN_LONGEST_MS = 3000;

export function buildLedger(input: LedgerInput): LedgerData {
  const { seen, snapshots, visits, days } = input;

  const entrySlugs: { title: string; firstAt: number }[] = [];
  let otherOpened = 0;
  let totalOpens = 0;
  for (const [slug, v] of Object.entries(visits)) {
    totalOpens += v.n;
    const e = getEntry(slug);
    if (e) entrySlugs.push({ title: e.title, firstAt: v.firstAt });
    else otherOpened += 1;
  }
  entrySlugs.sort((a, b) => a.firstAt - b.firstAt);
  const entriesOpened = entrySlugs.length;
  // 回访 = 重复打开：总打开数扣掉每个页面各自的首次
  const revisits = Math.max(0, totalOpens - entriesOpened - otherOpened);

  let bestId = '';
  let bestMs = 0;
  for (const [id, ms] of Object.entries(seen)) {
    if (ms > bestMs) {
      bestMs = ms;
      bestId = id;
    }
  }
  let longest: LedgerData['longest'] = null;
  if (bestId && bestMs >= MIN_LONGEST_MS) {
    const text = blockText(bestId);
    if (text) {
      longest = {
        title: blockOwner(bestId)?.title ?? '',
        excerpt: clip(text, 30),
        dur: duration(bestMs),
      };
    }
  }

  const snaps = Object.values(snapshots).sort((a, b) => b.at - a.at);
  const copied =
    snaps.length > 0 && snaps[0].text
      ? { excerpt: clip(snaps[0].text, 24), count: snaps.length }
      : null;

  return {
    viewerId: viewerIdOf(visits),
    entriesOpened,
    otherOpened,
    revisits,
    spanDays: days.length,
    firstDay: days[0] ?? '',
    longest,
    copied,
    openedTitles: entrySlugs.map((x) => x.title),
  };
}