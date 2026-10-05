import { useTrace } from '@/lib/traceStore';

/**
 * 化石：过度稳定 = 以原样返回。首次定稿后永久返回原件，此后不再更新。
 *
 * 这是组件之外那条路（搜索摘要、历史摘录、/verify 正文）用的非 hook 版本，
 * 与 VariantSpan 订阅同一份 snapshots，不得各自维护缓存。
 * 任何以"当前最新版"重写 snapshots 的代码都违反呈现规范。
 */
export function staleOr(blockId: string, current: string): string {
  return useTrace.getState().snapshots[blockId]?.text ?? current;
}
