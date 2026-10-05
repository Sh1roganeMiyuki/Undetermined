'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import type { Story } from '@/types';
import { BlockList } from '@/components/EntryBody';
import { stamp } from '@/lib/format';
import { useSeenBlocks } from '@/lib/signals/useSeenBlocks';
import { useHighPrecisionActions } from '@/lib/signals/useHighPrecisionActions';
import { useVisitTimeline } from '@/lib/signals/useVisitTimeline';
import { useTrace } from '@/lib/traceStore';
import { useHydrated } from '@/lib/useHydrated';

/**
 * 连载单期页（口述与纪事共用）。与词条页同一套信号（停留、捕获、到访记录）——
 * "看过的段落"同样可以成为后续内容的解锁钥匙（afterSeen）。
 * 到访即把该期标记为已读：栏目列表中的红点消失。
 */
export function StoryPage({
  story,
  config,
}: {
  story: Story;
  config: {
    basePath: string;
    label: string;
    speakerLabel: string;
    timeLabel: string;
    /** 阅读模式：不渲染任何元信息行与尾注，标题之后直接是正文 */
    minimal?: boolean;
  };
}) {
  useVisitTimeline(story.id);
  useSeenBlocks(story.id);
  useHighPrecisionActions(story.id);
  const hydrated = useHydrated();

  useEffect(() => {
    if (!hydrated) return;
    useTrace.getState().markDocRead(story.id, 1);
  }, [hydrated, story.id]);

  return (
    <div className="mx-auto max-w-[760px]">
      <div className="text-[13px] text-gray-500">
        <Link href={`${config.basePath}/`} className="hover:text-link">
          {config.label}
        </Link>
        <span className="px-1 text-gray-300">/</span>
        {story.title}
      </div>

      <h1 className="mt-1 text-[24px] font-semibold leading-9 text-ink">{story.title}</h1>
      {config.minimal ? null : (
        <p className="mt-2 border-b border-line pb-4 text-[13px] leading-6 text-gray-500">
          {config.speakerLabel}：{story.speaker}　｜　{config.timeLabel}：{stamp(story.at)}
        </p>
      )}

      <div className={config.minimal ? 'mt-8' : 'mt-6'}>
        <BlockList blocks={story.blocks} slug={story.id} />
      </div>

      {config.minimal ? null : (
        <p className="mt-8 border-t border-line pt-4 text-[13px] leading-6 text-gray-500">
          （本辑转写稿未经当事人复核。内容不代表本站立场。）
        </p>
      )}
    </div>
  );
}