/**
 * 缺席检测：处理方案的第四项（未申请项）的出现条件——不是"完成度"，是"离开"。
 *
 * days 为出现过的自然日序列（追加序即时间序）。玩家在末位日回来时：
 * 取末位与倒数第二位（上一次来过的日子）的间隔——间隔 ≥ min 天，
 * 视为一次足量的缺席。仅有一个自然日的记录不算（还没离开过）。
 *
 * 这是全篇唯一一处奖励玩家离开的判定；它只读 days，不读别的。
 */
const DAY_MS = 86_400_000;

export function absentLongEnough(days: string[], min: number = 3): boolean {
  if (days.length < 2) return false;
  const last = Date.parse(days[days.length - 1]);
  const prev = Date.parse(days[days.length - 2]);
  if (Number.isNaN(last) || Number.isNaN(prev)) return false;
  return (last - prev) / DAY_MS >= min;
}