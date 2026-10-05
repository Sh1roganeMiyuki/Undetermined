import { blockOwner, blockText, getEntry } from '@/data/entries';
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

/** 只截开头：台账抄的是原件的开头，不改口、不评注。 */
function clip(text: string, n: number): string {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n)}……` : t;
}

/** 低于这个时长的停留不进台账——"最久的一段"得像一段，而不是一瞥。 */
const MIN_LONGEST_MS = 3000;

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