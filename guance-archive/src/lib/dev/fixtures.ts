import type { WorldState } from '@/lib/resolve/resolve';

/**
 * 仅开发可见：注入 WorldState 的输入，不进构建产物。
 *
 * 三条约束：
 * 1. 不得为演示新增第二条渲染路径——注入的只能是输入，resolve() 仍是唯一判定者。
 * 2. 构建产物里必须查得到空。字面量全部写在生产守卫之后，
 *    打包时 `process.env.NODE_ENV` 被替换为字面量，整段成为死代码被删除，
 *    因此 `grep -r "day3\|fixtures" out/` 为空。
 * 3. 只允许覆盖 round / seenMs / snapshot。不许造 visits、不许直接写 localStorage。
 */
export function fixtureFromUrl(): Partial<WorldState> {
  if (process.env.NODE_ENV === 'production') return {};
  if (typeof window === 'undefined') return {};

  const FIXTURES: Record<string, Partial<WorldState>> = {
    day1: { round: 0, seenMs: 10_000 },
    day2: { round: 1, seenMs: 10_000 },
    day3: { round: 2, seenMs: 10_000 },
    day4: { round: 3, seenMs: 10_000 },
    skim: { round: 3, seenMs: 200 }, // 泛读：高轮次 + 低档停留
    fossil: { round: 3, snapshot: '【快照】' },
  };

  const k = new URLSearchParams(window.location.search).get('fixture');
  return (k && FIXTURES[k]) || {};
}
