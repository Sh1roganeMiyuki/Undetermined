import { expect, test } from 'vitest';
import type { ContentBlock } from '@/types';
import { resolve } from '@/lib/resolve/resolve';
import { ENTRIES, VERIFY_BLOCKS, RESERVED_NUMBERS } from '@/data/entries';
import { ROUND_MAX } from '@/lib/resolve/roundFor';

const W = (over = {}) => ({ round: 0, seenMs: 10_000, snapshot: undefined, ...over });
const canon = (b: ContentBlock) => b.text ?? '';

test('1. 首轮恒为规范版：任何块、任何停留时长，round = 0 都不许漂', () => {
  for (const e of ENTRIES)
    for (const b of e.blocks) {
      expect(resolve(b, W({ round: 0, seenMs: 600_000 })).text).toBe(canon(b));
    }
});

test('2. 未看过不漂：seenMs 低于门槛时，round >= 1 也返回规范版', () => {
  for (const e of ENTRIES)
    for (const b of e.blocks) {
      expect(resolve(b, W({ round: ROUND_MAX, seenMs: 0 })).text).toBe(canon(b));
      expect(resolve(b, W({ round: ROUND_MAX, seenMs: 1_499 })).text).toBe(canon(b));
    }
});

test('3. 门槛在数据里：minRound: 2 的块在 round = 1 仍为规范版', () => {
  for (const e of ENTRIES)
    for (const b of e.blocks)
      if ((b.minRound ?? 1) > 1) {
        expect(resolve(b, W({ round: b.minRound! - 1 })).text).toBe(canon(b));
      }
});

test('4. 只前进不回退：round 递增序列上，一旦漂过就永不返回规范版', () => {
  for (const e of ENTRIES)
    for (const b of e.blocks)
      if (b.driftable && b.variants?.length) {
        let drifted = false;
        for (let r = 0; r <= ROUND_MAX; r++) {
          const got = resolve(b, W({ round: r })).text;
          if (got !== canon(b)) drifted = true;
          else expect(drifted).toBe(false); // 漂过之后又变回规范版 = 失败
        }
      }
});

test('5. 定稿即冻结：有快照的块在任何轮次都逐字等于快照，而非规范版', () => {
  for (const e of ENTRIES)
    for (const b of e.blocks) {
      const fossil = '【当时所见的一版】';
      const out = resolve(b, W({ round: ROUND_MAX, snapshot: fossil }));
      expect(out.text).toBe(fossil);
      expect(out.tier).toBe('high');
    }
});

test('6. 对照物独占值：任何变体文本都不得让 RESERVED_NUMBERS 作为独立数值出现', () => {
  // 必须做"独立数值"匹配而不是子串匹配：repair 的 round 1 是 03:26:15，
  // 朴素的 text.includes('15') 会因为时间串里恰好有 15 而误报。
  const hit = (text: string, n: string) =>
    new RegExp(`(?<![\\d:.])${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\d:.])`).test(text);
  for (const e of ENTRIES)
    for (const b of e.blocks)
      for (const v of b.variants ?? []) {
        for (const n of RESERVED_NUMBERS) expect(hit(v.text, n)).toBe(false);
      }
});

test('6b. 独占表不空转：每一项都必须真的出现在对照物文书里', () => {
  const doc = Object.values(VERIFY_BLOCKS)
    .map((b) => b.text ?? '')
    .join('\n');
  for (const n of RESERVED_NUMBERS) expect(doc).toContain(n);
});

test('7. 对照物与轮次无关：verify 文本只来自快照，不来自 variants', () => {
  for (const b of Object.values(VERIFY_BLOCKS)) {
    expect(b.variants ?? []).toHaveLength(0);
    expect(b.driftable ?? false).toBe(false);
  }
});
