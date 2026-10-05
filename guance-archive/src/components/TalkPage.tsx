'use client';

import Link from 'next/link';
import type { TalkThread } from '@/types';
import { getEntry } from '@/data/entries';
import { stamp } from '@/lib/format';
import { usePageLog } from '@/lib/signals/useVisitTimeline';
import { useSeenBlocks } from '@/lib/signals/useSeenBlocks';

/**
 * 讨论页。发言是站内员工的零碎记录，不是给读者的说明——
 * 页面里没有任何"这里有蹊跷"的痕迹，对照物（一处被引用的旧版本）不解释自己。
 *
 * 讨论帖不参与定稿：定稿的语义是"把会变的东西钉住"，而讨论记录本来就不会变；
 * 此处只记录到访与停留，不挂高精度动作——避免"留存原句"被讨论帖刷屏。
 */
export function TalkPage({ thread }: { thread: TalkThread }) {
  usePageLog('talk', thread.slug);
  useSeenBlocks(thread.slug);

  const entry = getEntry(thread.slug);

  return (
    <div className="mx-auto max-w-[760px]">
      <div className="flex flex-wrap items-center gap-1 text-[13px] text-gray-500">
        <Link href={`/entry/${thread.slug}/`} className="hover:text-link">
          {entry?.title ?? thread.slug}
        </Link>
        <span aria-hidden className="text-gray-300">
          ›
        </span>
        <span>讨论页</span>
      </div>

      <h1 className="mt-2 flex items-center gap-2 text-[24px] font-semibold leading-9 text-ink">
        <span aria-hidden className="h-5 w-1 rounded-full bg-accent" />
        讨论：{entry?.title ?? thread.slug}
      </h1>
      <p className="mt-2 border-b border-line pb-4 text-[13px] leading-6 text-gray-500">
        本页为条目讨论记录，按时间顺序排列。讨论内容不改变条目正文，不设答复时限。
      </p>

      <ul className="mt-2">
        {thread.posts.map((p) => (
          <li key={p.id} data-bid={p.id} className="border-b border-line py-4 last:border-b-0">
            <div className="flex flex-wrap items-baseline gap-x-3 text-[13px] text-gray-500">
              <span className="font-mono tnum text-gray-400">{stamp(p.at)}</span>
              <span className="text-gray-700">{p.by}</span>
            </div>

            {p.quote ? (
              <blockquote className="mt-2 border-l-2 border-line pl-3 text-[14px] leading-6 text-gray-600">
                {p.quote}
              </blockquote>
            ) : null}

            {p.text.split('\n\n').map((seg, i) => (
              <p key={i} className="mt-2 text-[14px] leading-6 text-gray-800">
                {seg}
              </p>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}