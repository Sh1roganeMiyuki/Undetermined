import { DUP_SETS, type DupRecord } from '@/data/duplicates';

/**
 * 重复条目的塌缩判定。纯函数，唯一出口。
 *
 * - 尚未点过任意一条：两条都返回（检索页表现为两条同名同链接的结果）。
 * - 已点过其中一条：只返回被点的那一条。系统不认为发生过删除，
 *   另一条的消失因此没有任何痕迹可查，也不在任何地方被记录为"被删除"。
 *
 * `picked` 直接来自持久化状态；清档后它为空，两条记录自然一起回来
 * （区块不记得谁清过，只记得少了一次观测——站内不必为此写任何文案）。
 */
export function dupRecordsFor(group: string, picked: Record<string, string>): DupRecord[] | null {
  const set = DUP_SETS.find((s) => s.group === group);
  if (!set) return null;
  const choice = picked[group];
  if (!choice) return set.records;
  const kept = set.records.filter((r) => r.id === choice);
  return kept.length > 0 ? kept : set.records;
}