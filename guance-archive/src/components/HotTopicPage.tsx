'use client';

import Link from 'next/link';
import type { HotSnapshot, HotTopic } from '@/types';
import { useSeenBlocks } from '@/lib/signals/useSeenBlocks';
import { useHighPrecisionActions } from '@/lib/signals/useHighPrecisionActions';
import { useVisitTimeline } from '@/lib/signals/useVisitTimeline';

/**
 * 热搜话题页：点入榜面条目后所见。
 * 话题描述、数据行与讨论摘录一律按导出时刻抄录——
 * 话题页不随时间重排，与榜单快照同一口径。
 */
export function HotTopicPage({ topic, snapshot }: { topic: HotTopic; snapshot: HotSnapshot }) {
  useVisitTimeline(`hot:${topic.id}`);
  useSeenBlocks(topic.id);
  useHighPrecisionActions(`hot:${topic.id}`);

  return (
    <div className="mx-auto max-w-[760px]">
      <div className="text-[13px] text-gray-500">
        <Link href="/hot/" className="hover:text-link">
          城北同城榜
        </Link>
        <span className="px-1 text-gray-300">/</span>
        {snapshot.label} 话题
      </div>

      <h1 className="mt-1 text-[24px] font-semibold leading-9 text-ink">{topic.topic}</h1>
      <p className="mt-2 border-b border-line pb-4 text-[13px] leading-6 text-gray-500">
        {snapshot.label} · 同城榜第 {topic.rank} 位　｜　热度：{topic.heat}
      </p>

      <div data-bid={topic.id} className="mt-6">
        {topic.stat ? <p className="text-[13px] leading-6 text-gray-400">{topic.stat}</p> : null}
        <p className="mt-3 text-gray-800">{topic.desc}</p>

        {topic.posts && topic.posts.length > 0 ? (
          <div className="mt-8">
            <h2 className="border-b border-line pb-2 text-[16px] font-semibold text-ink">
              相关讨论（摘录）
            </h2>
            <ul className="mt-3">
              {topic.posts.map((p) => (
                <li
                  key={p}
                  className="border-b border-line py-2 text-[14px] leading-6 text-gray-700 last:border-b-0"
                >
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <p className="mt-8 border-t border-line pt-4 text-[13px] leading-6 text-gray-500">
        （话题页由本站按榜单导出时刻抄录归档，未做整理。）
      </p>
    </div>
  );
}