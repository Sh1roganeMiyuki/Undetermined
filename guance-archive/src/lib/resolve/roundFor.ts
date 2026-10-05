import { useTrace } from '@/lib/traceStore';

/** 轮次上限。切片只覆盖 3 次跨天推进，第 4 天起世界不再变化。 */
export const ROUND_MAX = 3;

/**
 * 轮次 = 该条目跨自然日的回访序号（dn = 访问过的不同自然日数）。
 * 以"日"为单位而非会话（刷新无法加速）；首轮恒为 0（首次访问绝不出现差异）；
 * 同日多次回访不推进（给"我记错了"留出口）。
 *
 * 供组件外的路径使用（搜索摘要、历史摘录、构建期）。
 * 轮次永不写回 store：它由 dn 推导。
 */
export function roundFor(slug: string): number {
  const v = useTrace.getState().visits[slug];
  return roundFromDn(v?.dn ?? 1);
}

/** 纯函数入口：供组件内已订阅 `dn` 的 hook 使用，避免在 render 里读 store。 */
export function roundFromDn(dn: number): number {
  return dn <= 1 ? 0 : Math.min(ROUND_MAX, dn - 1);
}
