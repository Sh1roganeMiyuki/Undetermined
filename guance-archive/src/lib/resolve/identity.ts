import { hash32 } from '@/lib/resolve/hash';

/** 最小结构：只需首次到访时刻，traceStore 的 Visit 天然满足。 */
export interface FirstVisitLike {
  firstAt: number;
}

/**
 * 由真实行为生成的稳定标识，会成为玩家在站内文书里的"名字"。
 * 输入只取不可变的两项：最早一次到访的时刻、第一个打开的条目。
 * 不得掺入 `days.length` 之类会随时间变化的量——那会让名字隔天就换。
 *
 * 提为纯函数（traceStore 与台账生成共用同一份算法）：
 * 名字只能有一处定义，否则会悄悄出现两个版本。
 */
export function viewerIdOf(visits: Record<string, FirstVisitLike>): string {
  let firstAt = 0;
  let firstSlug = '';
  for (const [slug, v] of Object.entries(visits)) {
    if (!firstSlug || v.firstAt < firstAt) {
      firstAt = v.firstAt;
      firstSlug = slug;
    }
  }
  if (!firstSlug) return 'GA-000000';
  const hex = hash32(`${firstAt}:${firstSlug}`).toString(16).toUpperCase();
  return `GA-${hex.padStart(6, '0').slice(0, 6)}`;
}