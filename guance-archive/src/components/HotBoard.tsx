'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { HOT_SNAPSHOTS } from '@/data/hot';
import { stamp } from '@/lib/format';
import { meetsRule } from '@/lib/resolve/reveal';
import { useRevealState } from '@/lib/resolve/useRevealState';
import { useTrace } from '@/lib/traceStore';
import { useHydrated } from '@/lib/useHydrated';
import { useSeenBlocks } from '@/lib/signals/useSeenBlocks';
import { useVisitTimeline } from '@/lib/signals/useVisitTimeline';

/** 榜面标签的字样。只出现在榜上，不参与站内任何判定。
 *  黄底用深字：白字在 yellow-500 上对比不足 2:1，读不清。 */
const TAG_CLASS: Record<string, string> = {
  爆: 'bg-red-600 text-white',
  沸: 'bg-red-500 text-white',
  热: 'bg-orange-500 text-white',
  新: 'bg-sky-500 text-white',
  荐: 'bg-yellow-500 text-gray-900',
};

/**
 * 同城榜存档页。一期一档，逐期切换——榜单不随时间重排，
 * "变化"只发生在快照之间，这一点由数据结构本身保证。
 *
 * 与目录同一个投放模式：接手前按静态口径，接手后按真实状态；
 * 新的一期就这样在回访时"上榜"。默认停在最新可见的一期。
 */
export function HotBoard() {
  const hydrated = useHydrated();
  const reveal = useRevealState();
  const readRevisions = useTrace((s) => s.readRevisions);

  const visible = HOT_SNAPSHOTS.filter((s) => (hydrated ? meetsRule(s.reveal, reveal) : !s.reveal));
  const [picked, setPicked] = useState<string | null>(null);
  const current = visible.find((s) => s.id === picked) ?? visible[visible.length - 1];

  useVisitTimeline('hot');
  // 切换快照会换掉 DOM 里的 data-bid 集合：依赖跟着换，重新扫描。
  useSeenBlocks(current ? `hot:${current.id}` : 'hot');

  // 榜面水位：把"可见期数"记入已读水位（只前进）。新一期投放后，
  // 期次按钮与顶部导航亮红点，直到读者再次站上榜面——与全站红点同一口径。
  useEffect(() => {
    if (hydrated) useTrace.getState().markDocRead('hot', visible.length);
  }, [hydrated, visible.length]);
  const hotWm = readRevisions.hot;

  if (!current) return null;

  return (
    <div className="mx-auto max-w-[760px]">
      <h1 className="flex items-center gap-2 text-[24px] font-semibold leading-9 text-ink">
        <span aria-hidden className="h-5 w-1 rounded-full bg-accent" />
        城北同城榜
      </h1>
      <p className="mt-2 border-b border-line pb-4 text-[13px] leading-6 text-gray-500">
        本页为《城北同城榜》公开页面的按期存档。排名与热度按导出时刻照录，未做排序调整。
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {visible.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setPicked(s.id)}
            className={`rounded-md border px-3 py-1 text-[13px] leading-5 transition-colors ${
              s.id === current.id
                ? 'border-brand bg-brand text-white'
                : 'border-line text-gray-600 hover:border-link hover:text-link'
            }`}
          >
            {s.label}
            {hotWm !== undefined && i >= hotWm ? (
              <span
                aria-hidden
                className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-red-500 align-middle"
              />
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-5">
        <div className="flex items-baseline justify-between border-b border-line pb-2">
          <h2 className="text-[15px] font-semibold text-ink">{current.label} · 快照</h2>
          <span className="text-[12px] text-gray-400">导出于 {stamp(current.at)}</span>
        </div>
        <ol className="mt-1">
          {current.topics.map((t) => (
            <li
              key={t.id}
              data-bid={t.id}
              className="flex items-center gap-3 border-b border-line py-2.5 last:border-b-0"
            >
              <span
                className={`w-6 shrink-0 text-right text-[15px] font-semibold ${
                  t.rank <= 3 ? 'text-red-500' : 'text-gray-400'
                }`}
              >
                {t.rank}
              </span>
              <Link
                href={`/hot/${t.id}/`}
                className="min-w-0 text-[15px] leading-6 text-ink hover:text-link hover:underline"
              >
                {t.topic}
              </Link>
              {t.tag ? (
                <span
                  className={`shrink-0 rounded-sm px-1 text-[11px] leading-4 ${
                    TAG_CLASS[t.tag] ?? 'bg-gray-400 text-white'
                  }`}
                >
                  {t.tag}
                </span>
              ) : null}
              <span className="ml-auto shrink-0 text-[12px] text-gray-400">{t.heat}</span>
            </li>
          ))}
        </ol>
        {current.footer ? (
          <p className="mt-3 text-[12px] leading-5 text-gray-400">{current.footer}</p>
        ) : null}
      </div>
    </div>
  );
}