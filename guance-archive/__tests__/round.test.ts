import { expect, test } from 'vitest';
import { roundFromDn, ROUND_MAX } from '@/lib/resolve/roundFor';
import { localDay } from '@/lib/traceStore';

test('8. 推进单位是本地自然日：同一天内无论几点访问，dn 恒为 1', () => {
  // UTC+8 的凌晨 00:12 与前一天 23:59 属于同一个本地日，却分属两个 UTC 日。
  // 这条断言专门杀 `toISOString().slice(0, 10)`：改成 UTC 日，集合立刻分裂成两个。
  const stamps = ['2026-03-13T23:59', '2026-03-14T00:12', '2026-03-14T08:30'];
  const days = new Set(stamps.map((s) => localDay(new Date(s))));
  expect(days.size).toBe(2); // 13 日一次、14 日两次
  expect(roundFromDn(days.size)).toBe(1); // 只推进一轮，不因同日内多次访问而加速
});

test('9. 轮次有上界：回访再多也不越过 ROUND_MAX', () => {
  expect(roundFromDn(1)).toBe(0);
  expect(roundFromDn(2)).toBe(1);
  for (let dn = 1; dn <= 60; dn++) {
    expect(roundFromDn(dn)).toBeLessThanOrEqual(ROUND_MAX);
  }
  expect(roundFromDn(ROUND_MAX + 1)).toBe(ROUND_MAX);
  expect(roundFromDn(ROUND_MAX + 9)).toBe(ROUND_MAX); // 第 5 天起不再产生新变化
});
