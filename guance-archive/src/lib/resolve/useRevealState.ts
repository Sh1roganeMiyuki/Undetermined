'use client';

import { useTrace } from '@/lib/traceStore';
import type { RevealState } from './reveal';

/**
 * 投放判定的订阅适配器：只订阅这四个值。
 * 组件把它交给 reveal.ts 的纯函数，自己不拆条件。
 */
export function useRevealState(): RevealState {
  const days = useTrace((s) => s.days.length);
  const seen = useTrace((s) => s.seen);
  const reconstruct = useTrace((s) => s.reconstruct);
  const reviewChoice = useTrace((s) => s.reviewChoice);
  return { days, seen, reconstruct, reviewChoice };
}