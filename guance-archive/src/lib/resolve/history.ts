import type { EditRecord } from '@/types';

/**
 * 编辑记录的轮次门控。纯函数，唯一出口——组件里不得再判断 fromRound。
 *
 * - 未声明 fromRound = 0：首次访问即可见。
 * - 声明了 = 从该轮次起出现：用于"时间戳指向未来的编辑记录"这类裂缝，
 *   它必须在数据里声明，不由渲染时刻动态生成。
 * - 只前进，不消失：记录一旦出现就一直在。
 *
 * 调用方在 hydration 前必须传 round = 0（服务端没有 localStorage，
 * 接手后才有真实的轮次），与其他持久化状态的处理保持一致。
 */
export function visibleHistory(records: EditRecord[], round: number): EditRecord[] {
  return records.filter((r) => round >= (r.fromRound ?? 0));
}