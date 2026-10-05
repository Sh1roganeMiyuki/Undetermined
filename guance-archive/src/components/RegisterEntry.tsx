'use client';

import { localDay, useTrace } from '@/lib/traceStore';
import { viewerIdOf } from '@/lib/resolve/identity';
import { sealText } from '@/lib/resolve/receipt';
import { useHydrated } from '@/lib/useHydrated';

/**
 * 动态登记行：《档案调阅登记》里由读者本人填成的那几行。
 *
 * 模板（数据侧）里 {id} / {day} / {seal} 是占位符：
 * - 2024.11.03 那行只填编号——日期是文书自己的（早于读者到来）；
 * - 末尾那行两个都填——今天，读者正在查阅的这本簿子；
 * - 函件回执行填签收状态——签了写代签结果，不点写“（未填）”。
 *
 * 纪律同台账：接手前这一行不存在。它不解释自己，也不需要解释——
 * 登记簿里其他行都是这么写的。
 */
export function RegisterEntry({ template }: { template: string }) {
  const hydrated = useHydrated();
  const visits = useTrace((s) => s.visits);
  const receipt = useTrace((s) => s.receipt);

  if (!hydrated) return null;

  const line = template
    .replace(/\{id\}/g, viewerIdOf(visits))
    .replace(/\{day\}/g, localDay().replace(/-/g, '.'))
    .replace(/\{seal\}/g, sealText(receipt));

  return <p className="my-3 text-gray-800">{line}</p>;
}