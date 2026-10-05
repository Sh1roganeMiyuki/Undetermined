export type Tier = 'low' | 'mid' | 'high';

/** 停留门槛：低于此值视为"划过"，不结算（低档） */
export const SEEN_GATE_MS = 1500;

/**
 * 只回答"这一次阅读算不算数、算多重"，不回答"该显示哪一版"。
 * 入参只接受真实信号或持久化状态的直接投影，不接受推导值。
 * 只被 resolve() 调用——组件不得直接调它。
 *
 * "跨天回访"不在这里：它推进轮次（roundFor），不改变阅读层级。
 * 若把跨天回访也算作定稿，玩家第二天回访就会锁死所有读过的词条。
 */
export function tierOf(w: { seenMs: number; snapshot?: string }): Tier {
  if (w.snapshot !== undefined) return 'high'; // 有原件 → 已定稿
  if (w.seenMs < SEEN_GATE_MS) return 'low'; // 划过、泛读、后台未结算
  return 'mid';
}
