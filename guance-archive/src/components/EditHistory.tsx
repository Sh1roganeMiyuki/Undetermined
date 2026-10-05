'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import type { WikiEntry } from '@/types';
import { blockText } from '@/data/entries';
import { staleOr } from '@/lib/resolve/snapshots';
import { stamp } from '@/lib/format';
import { visibleHistory } from '@/lib/resolve/history';
import { roundFromDn } from '@/lib/resolve/roundFor';
import { useTrace } from '@/lib/traceStore';
import { usePageLog } from '@/lib/signals/useVisitTimeline';
import { useSeenBlocks } from '@/lib/signals/useSeenBlocks';
import { useHighPrecisionActions } from '@/lib/signals/useHighPrecisionActions';
import { useHydrated } from '@/lib/useHydrated';

/**
 * 编辑历史。它本身是观测对象：访问计入台账（对应规则 4"不要查编辑历史"），
 * 在这里精确选中一段摘录同样会定稿——为了确认而做的动作，正是让它不再变的动作。
 *
 * 摘录一律经 staleOr 取文：已定稿的段落在这里显示的是当时所见，
 * 而不是"当前最新版"。留存只存在于本浏览器，服务端那份 HTML 里不可能有，
 * 所以接手前一律先给规范版，接手后再取留存——两帧一致，不靠压制警告糊过去。
 */
export function EditHistory({ entry }: { entry: WikiEntry }) {
  usePageLog('history', entry.slug);
  useHighPrecisionActions(entry.slug);
  // 摘录带 [data-bid]，停留照常计入：玩家在这一页读的也是这些文字。
  useSeenBlocks(entry.slug);
  const hydrated = useHydrated();
  const round = useTrace((s) => roundFromDn(s.visits[entry.slug]?.dn ?? 1));

  // 最近的登记在上，与协作平台惯例一致。
  // 轮次门控：接手前一律按第 0 轮（服务端没有 localStorage），
  // 接手后按真实轮次——"时间戳指向未来的编辑记录"就是这样在跨天回访后现身的。
  const records = [...visibleHistory(entry.history, hydrated ? round : 0)].reverse();

  // 到访即把历史水位推到当前可见条数（只前进）：
  // 此后跨轮次多出的登记记录才会点亮侧栏红点。
  useEffect(() => {
    if (hydrated) useTrace.getState().markHistoryRead(entry.slug, records.length);
  }, [hydrated, entry.slug, records.length]);

  return (
    <div className="mx-auto max-w-[760px]">
      <div className="flex flex-wrap items-center gap-1 text-[13px] text-gray-500">
        <Link href={`/entry/${entry.slug}/`} className="hover:text-link">
          {entry.title}
        </Link>
        <span aria-hidden className="text-gray-300">
          ›
        </span>
        <span>编辑历史</span>
      </div>
      <h1 className="mt-2 flex items-center gap-2 text-[24px] font-semibold leading-9 text-ink">
        <span aria-hidden className="h-5 w-1 rounded-full bg-accent" />
        编辑历史
      </h1>
      <p className="mt-2 border-b border-line pb-4 text-[13px] leading-6 text-gray-500">
        以下为本条目全部登记记录，共 {records.length} 条。记录登记后不再更新。
      </p>

      <ul className="mt-2">
        {records.map((r, i) => (
          <li key={`${r.at}-${i}`} className="border-b border-line py-4 last:border-b-0">
            <div className="flex flex-wrap items-baseline gap-x-3 text-[13px] text-gray-500">
              <span className="font-mono tnum text-gray-400">{stamp(r.at)}</span>
              <span className="text-gray-700">{r.by}</span>
              {r.overwritten ? <span>本条为覆盖型登记</span> : null}
            </div>

            <div className="mt-1 text-[15px] text-gray-800">
              {r.verifyHref ? (
                <Link href={r.verifyHref} className="text-link hover:underline">
                  {r.note}
                </Link>
              ) : (
                r.note
              )}
            </div>

            {r.blockId ? (
              <p
                data-bid={r.blockId}
                className="mt-2 rounded-r-md border-l-2 border-line bg-soft px-3 py-2 text-[14px] leading-6 text-gray-600"
              >
                {hydrated ? staleOr(r.blockId, blockText(r.blockId)) : blockText(r.blockId)}
              </p>
            ) : null}

            {r.overwritten && r.underlyingText ? (
              <details className="mt-2">
                <summary className="cursor-pointer text-[13px] text-gray-500 hover:text-link">
                  展开被覆盖的版本
                </summary>
                <p className="mt-2 bg-soft px-3 py-2 text-[14px] leading-6 text-gray-700">
                  {r.underlyingText}
                </p>
              </details>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
