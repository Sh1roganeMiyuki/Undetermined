'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import type { VerifyDoc as VerifyDocData } from '@/data/entries';
import { staleOr } from '@/lib/resolve/snapshots';
import { useTrace } from '@/lib/traceStore';
import { usePageLog } from '@/lib/signals/useVisitTimeline';
import { useSeenBlocks } from '@/lib/signals/useSeenBlocks';
import { useHighPrecisionActions } from '@/lib/signals/useHighPrecisionActions';

/**
 * 对照物页必须在首次挂载时幂等地播种自己的快照。
 * snapshots 是空表启动的：一个从不复制的玩家打开这一页会看到空白，
 * 而空白会让"无变化"这个结论失去载体。
 * 播种只能在 client effect 里——它来自 localStorage，服务端没有。
 */
function useSeedVerify(id: string, canonical: string) {
  useEffect(() => {
    const s = useTrace.getState();
    if (!s.snapshots[id]) s.snapshot(id, canonical);
  }, [id, canonical]);
}

/**
 * 一张无聊的表格。不加提示、不加强调色、不标"发现异常"，
 * 复核结论里的"无变化"也不做强调——它的力量来自它是一份正式文书。
 */
export function VerifyDoc({ doc }: { doc: VerifyDocData }) {
  usePageLog('verify', doc.slug);
  useHighPrecisionActions(doc.slug);
  // 摘录是页面上唯一的 [data-bid]，停留一样要计：台账的"停留最久的一段"
  // 不该因为玩家是在这一页读的就漏掉它。
  useSeenBlocks(doc.slug);
  useSeedVerify(doc.excerpt.id, doc.excerpt.text ?? '');

  const rows: [string, ReactNode][] = [
    ['复核对象', doc.target],
    ['复核时间', doc.at],
    ['复核结论', doc.conclusion],
    [
      '上一版本摘录',
      // 引号留在 data-bid 之外：这一页同样会因精确选中而定稿，
      // 引号若在被选中的元素里，留存下来的就是带引号的一份，再渲染一次就成了双重引号。
      <span key="e">
        “
        <span suppressHydrationWarning data-bid={doc.excerpt.id}>
          {staleOr(doc.excerpt.id, doc.excerpt.text ?? '')}
        </span>
        ”
      </span>,
    ],
    ['复核人', doc.by],
  ];

  return (
    <div>
      <h1 className="text-[24px] font-semibold leading-9 text-ink">复核记录</h1>
      <table className="mt-4 w-full border-collapse border border-line text-[14px]">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} className="border-b border-line last:border-b-0">
              <th
                scope="row"
                className="w-32 border-r border-line bg-soft px-3 py-2 text-left align-top font-normal text-gray-500"
              >
                {k}
              </th>
              <td className="px-3 py-2 align-top leading-6 text-gray-800">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-[13px] leading-6 text-gray-500">{doc.footer}</p>
    </div>
  );
}
