import type { RevealRule, WikiEntry } from '@/types';
import { SEEN_GATE_MS } from '@/lib/reader';
import { SCENES } from '@/data/scenes';
import { frameUnlocked } from './reconstruct';
import { visibleHistory } from './history';
import { roundFromDn } from './roundFor';

/**
 * 投放判定。纯函数，唯一出口——组件里不得再拆开判断 afterDays / afterSeen。
 *
 * 纪律：
 * - 投放只控制"露出渠道"（目录、首页、搜索索引）；页面本身照常静态生成。
 * - 判定只由持久化状态推导，跨会话稳定；不读取当前时间、不随机。
 * - "真正看过"的门槛与阅读档位一致（SEEN_GATE_MS）：划过的不算。
 */

export interface RevealState {
  /** days.length：出现过的自然日数 */
  days: number;
  seen: Record<string, number>;
  /** 还原台的进度（afterScene 条件用） */
  reconstruct: Record<string, { marks: string[]; verdict?: string }>;
  /** 复核征询的登记结果（afterReview 条件用）。未登记为 undefined / null */
  reviewChoice?: string | null;
}

/** 单个条件是否满足。未声明任何条件的规则恒为满足。 */
export function meetsRule(rule: RevealRule | undefined, s: RevealState): boolean {
  if (!rule) return true;
  // 或组：多入射角。组内任一子规则满足即可；与其余字段仍是“与”
  if (rule.anyOf && rule.anyOf.length > 0) {
    const ok = rule.anyOf.some((r) => meetsRule(r, s));
    if (!ok) return false;
  }
  if (rule.afterDays !== undefined && !(s.days > rule.afterDays)) return false;
  if (rule.afterSeen && rule.afterSeen.length > 0) {
    const ok = rule.afterSeen.some((id) => (s.seen[id] ?? 0) >= SEEN_GATE_MS);
    if (!ok) return false;
  }
  if (rule.afterSeenAll && rule.afterSeenAll.length > 0) {
    const ok = rule.afterSeenAll.every((id) => (s.seen[id] ?? 0) >= SEEN_GATE_MS);
    if (!ok) return false;
  }
  if (rule.afterSeenAtLeast) {
    const { ids, n } = rule.afterSeenAtLeast;
    const count = ids.filter((id) => (s.seen[id] ?? 0) >= SEEN_GATE_MS).length;
    if (count < n) return false;
  }
  if (rule.afterScene) {
    const scene = SCENES[rule.afterScene];
    if (!scene) return false;
    const progress = s.reconstruct[rule.afterScene];
    if (!frameUnlocked(scene, progress?.marks ?? [], progress?.verdict)) return false;
  }
  if (rule.afterReview !== undefined && s.reviewChoice !== rule.afterReview) return false;
  return true;
}

/** 初版是否已投放（决定它能否进入目录 / 首页 / 搜索）。 */
export function entryRevealed(entry: WikiEntry, s: RevealState): boolean {
  return meetsRule(entry.reveal, s);
}

/**
 * 当前应当展示到的修订索引（0 = 只有初版）。
 * 修订按顺序出现：遇到第一个不满足的即停止——不允许"后一版先于前一版"出现。
 */
export function revisionShown(entry: WikiEntry, s: RevealState): number {
  const revs = entry.revisions ?? [];
  let idx = 0;
  for (let i = 0; i < revs.length; i++) {
    if (!meetsRule(revs[i].reveal, s)) break;
    idx = i + 1;
  }
  return idx;
}

/** 目录红点判定：存在满足条件、但玩家尚未在其出现后到访过的修订。 */
export function hasUnreadRevision(
  entry: WikiEntry,
  s: RevealState,
  readRevisions: Record<string, number>,
): boolean {
  if (entry.reveal && !entryRevealed(entry, s)) return false;
  return revisionShown(entry, s) > (readRevisions[entry.slug] ?? 0);
}

/** 红点判定所需的三类水位：全部来自台账，本函数只读不写。 */
export interface UnreadMarks {
  readRevisions: Record<string, number>;
  readHistory: Record<string, number>;
  visits: Record<string, { dn: number }>;
}

/**
 * 全站红点口径（唯一出口）：红点只报"新内容"，共三类——
 * 1. 投放后出现、尚未打开过的新文书 / 新连载；
 * 2. 出现后尚未读过的文档修订（hasUnreadRevision）；
 * 3. 出现后尚未读过的新增登记记录（readHistory 水位超过后点亮）。
 *
 * 文本漂移（轮次变体）永不点亮红点：漂移是留给记忆自己去察觉的内容，
 * 一旦由红点代为提示，"我记错了吗"就变成"系统通知我了"，核心体验即毁。
 * 基线内容（无投放声明、建站即在）不算新内容：首访不满屏红点。
 */
export function entryUnread(entry: WikiEntry, s: RevealState, m: UnreadMarks): boolean {
  if (entry.reveal && !entryRevealed(entry, s)) return false;
  if (hasUnreadRevision(entry, s, m.readRevisions)) return true;
  if (entry.reveal && !m.visits[entry.slug]) return true;
  const wm = m.readHistory[entry.slug];
  if (wm !== undefined) {
    const round = roundFromDn(m.visits[entry.slug]?.dn ?? 1);
    if (visibleHistory(entry.history, round).length > wm) return true;
  }
  return false;
}