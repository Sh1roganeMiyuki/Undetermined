import type { ActionItem } from '@/lib/traceStore';

/**
 * 幽灵记录：查阅记录里一条玩家没做过的操作。
 *
 * 纪律（任何后续新增都必须满足）：
 * - 不写入存档、不算 actions、不进任何判定——它只是"显示"时被合并进台账，
 *   因此清档后自然消失，也不会被别的功能当成事实引用。
 * - 时间戳由持久化状态确定性推导（首个自然日 + 固定时刻），跨会话稳定、
 *   刷新不变。不得使用随机数或"当前时间"。
 * - 第一次出现的那件事必须"他可能真的做过"：落在首个自然日的深夜——
 *   跨天之间的夜晚是没人复核过的时间，正是他不确定自己去没去过的地方。
 *
 * 出现条件：出现过至少两个自然日（第二天起才会翻到这条台账）。
 */
const GHOST_HOUR = 23;
const GHOST_MINUTE = 47;

export function ghostActions(days: string[]): ActionItem[] {
  if (days.length < 2) return [];
  const first = days[0];
  const at = new Date(`${first}T${GHOST_HOUR}:${GHOST_MINUTE}:00`).getTime();
  if (!Number.isFinite(at)) return [];
  return [{ at, kind: 'verify', target: 'north-loop-tunnel' }];
}