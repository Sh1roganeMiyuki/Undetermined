import type { RevealRule } from '@/types';
import { CHRONICLES } from '@/data/chronicle';
import { ENTRIES, VERIFY_DOCS } from '@/data/entries';
import { GOV_DOCS } from '@/data/gov';
import { HOT_SNAPSHOTS } from '@/data/hot';
import { NET_RECORDS } from '@/data/net';
import { NEWS_ISSUES } from '@/data/news';
import { STORIES } from '@/data/stories';

/**
 * 投放门引用的 blockId 全集——下称"锚点"。
 *
 * 为什么需要这份集合：`seen` 是有界容器，超限要淘汰。而淘汰是按停留时长
 * 从短到长挑的，它不知道"这一条是某个投放门的唯一锚点"。一旦锚点被淘汰，
 * `afterSeen` 归零，**已经出现在目录里的文书会重新消失**——玩家看到的现象是
 * "我明明读过了，它不见了"，而且没有任何东西报错。这类静默回退比崩溃糟得多。
 *
 * 所以淘汰规则改成：锚点永不淘汰，只在非锚点里挑。
 *
 * 新增载体（新栏目、新文书类型）时必须把它加进下面的枚举，
 * 否则它的门就落在保护之外。`__tests__/mechanisms.test.ts` 的锚点断言看守这一点。
 */

/** 递归收集一条投放声明里引用的全部 blockId（含 anyOf 嵌套）。 */
export function collectAnchors(rule: RevealRule | undefined, acc: Set<string>): void {
  if (!rule) return;
  for (const id of rule.afterSeen ?? []) acc.add(id);
  for (const id of rule.afterSeenAll ?? []) acc.add(id);
  for (const id of rule.afterSeenAtLeast?.ids ?? []) acc.add(id);
  for (const r of rule.anyOf ?? []) collectAnchors(r, acc);
}

function build(): ReadonlySet<string> {
  const acc = new Set<string>();
  for (const e of ENTRIES) {
    collectAnchors(e.reveal, acc);
    for (const rev of e.revisions ?? []) collectAnchors(rev.reveal, acc);
  }
  for (const s of STORIES) collectAnchors(s.reveal, acc);
  for (const c of CHRONICLES) collectAnchors(c.reveal, acc);
  for (const g of GOV_DOCS) collectAnchors(g.reveal, acc);
  for (const n of NEWS_ISSUES) collectAnchors(n.reveal, acc);
  for (const r of NET_RECORDS) collectAnchors(r.reveal, acc);
  for (const h of HOT_SNAPSHOTS) collectAnchors(h.reveal, acc);
  for (const d of Object.values(VERIFY_DOCS)) collectAnchors(d.reveal, acc);
  return acc;
}

/** 模块级常量：全站文本是构建期就定的，没有理由每次淘汰都重算一遍。 */
export const GATE_ANCHORS: ReadonlySet<string> = build();
