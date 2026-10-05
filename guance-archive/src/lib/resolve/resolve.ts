import type { ContentBlock } from '@/types';
import { tierOf, type Tier } from '@/lib/reader';

/**
 * resolve 的唯一输入，字段全部来自持久化状态或真实信号。
 * fixture 注入替换的就是这里的输入，不是判定逻辑。
 */
export interface WorldState {
  /** roundFromDn(visits[slug].dn) */
  round: number;
  /** seen[blockId] */
  seenMs: number;
  /**
   * snapshots[blockId]?.text。存在即"已定稿"，
   * 不再有并行的 `pinned` 布尔量（两个容器表达同一事实必然漂移）。
   */
  snapshot?: string;
}

export interface Resolved {
  text: string;
  variantIndex: number;
  tier: Tier;
}

const MIN_ROUND_DEFAULT = 1;

/**
 * 全部门控只出现在这一个函数里，组件内不得再出现 `if (round ...)`、`if (seen ...)`。
 *
 * 判定顺序即优先级，任何一条都不得在别处重复实现：
 *  1. 定稿优先——有快照的位置原样返回原件（化石）。
 *  2. 轮次未到 minRound——规范版。首轮（round = 0）恒不漂移，这是切片的地基。
 *  3. 阅读层级为 low（划过 / 泛读 / 后台未结算）——规范版。没真正看过的人不许看到变化。
 *  4. 取"不超过当前轮次的最大已声明轮次"：漂移只前进、不回退，
 *     因此作者可以只声明 round 1、2 而让该块在第 3 天保持上一版，
 *     绝不允许出现"第 4 天悄悄退回规范版"。
 */
export function resolve(block: ContentBlock, w: WorldState): Resolved {
  const tier = tierOf(w);
  if (w.snapshot !== undefined) return { text: w.snapshot, variantIndex: -1, tier };

  const minRound = block.minRound ?? MIN_ROUND_DEFAULT;
  if (w.round < minRound || tier === 'low') {
    return { text: block.text ?? '', variantIndex: -1, tier };
  }

  const vs = block.variants ?? [];
  let hit = -1;
  vs.forEach((x, i) => {
    if (x.round >= minRound && x.round <= w.round && (hit < 0 || x.round > vs[hit].round)) hit = i;
  });
  if (hit < 0) return { text: block.text ?? '', variantIndex: -1, tier };

  return block.driftable
    ? { text: vs[hit].text, variantIndex: hit, tier }
    : { text: block.text ?? '', variantIndex: -1, tier };
}
