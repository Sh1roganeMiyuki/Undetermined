'use client';

import type { ContentBlock } from '@/types';
import { useTrace } from '@/lib/traceStore';
import { fixtureFromUrl } from '@/lib/dev/fixtures';
import { resolve, type Resolved } from './resolve';
import { roundFromDn } from './roundFor';

/**
 * 组件与 resolve 之间唯一的桥。
 *
 * 字段级订阅：只订阅这三个值，任一变化才重渲染这一个 span。
 * 合并顺序是硬要求——fixture 覆盖输入，resolve 仍然是唯一判定者。
 */
export function useResolved(block: ContentBlock, slug: string): Resolved {
  const seenMs = useTrace((s) => s.seen[block.id] ?? 0);
  const snapshot = useTrace((s) => s.snapshots[block.id]?.text);
  const round = useTrace((s) => roundFromDn(s.visits[slug]?.dn ?? 1));
  return resolve(block, { round, seenMs, snapshot, ...fixtureFromUrl() });
}
