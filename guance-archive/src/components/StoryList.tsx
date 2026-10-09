'use client';

import Link from 'next/link';
import type { Story } from '@/types';
import { stamp } from '@/lib/format';
import { meetsRule } from '@/lib/resolve/reveal';
import { useRevealState } from '@/lib/resolve/useRevealState';
import { useTrace } from '@/lib/traceStore';
import { useHydrated } from '@/lib/useHydrated';
import { useVisitTimeline } from '@/lib/signals/useVisitTimeline';

/**
 * 连载栏目的通用列表（《城北口述》与《城北纪事》共用）。
 *
 * 与目录同一个投放模式：接手前按静态口径（与服务端一致），接手后按真实状态——
 * 未满足投放条件的期在这里完全不存在，不存在任何"待发布"的空位。
 * 红点：未读的期次提示；进入该期即消失（连载新期是红点允许的第二类场景）。
 */
export function StoryList({
  items,
  basePath,
  title,
  intro,
  speakerLabel,
  timeLabel,
  showSpeaker = true,
}: {
  items: Story[];
  basePath: string;
  title: string;
  intro: string;
  speakerLabel: string;
  timeLabel: string;
  /** 作品频道（纪事）不显示作者行——小说不署名 */
  showSpeaker?: boolean;
}) {
  const hydrated = useHydrated();
  const reveal = useRevealState();
  const readRevisions = useTrace((s) => s.readRevisions);

  // 栏目录入页与 ArchiveIndex、HotBoard 同一口径：进栏目也要进台账。
  // 此前只有这个列表不记，于是同一份自称“自动生成”的文书里，
  // 看榜单算数、看纪事不算数——而纪事恰恰是本作的主线。
  useVisitTimeline(basePath.replace(/^\//, ''));

  const visible = items.filter((s) => (hydrated ? meetsRule(s.reveal, reveal) : !s.reveal));

  return (
    <div className="mx-auto max-w-[760px]">
      <h1 className="flex items-center gap-2 text-[24px] font-semibold leading-9 text-ink">
        <span aria-hidden className="h-5 w-1 rounded-full bg-accent" />
        {title}
      </h1>
      <p className="mt-2 border-b border-line pb-4 text-[13px] leading-6 text-gray-500">{intro}</p>

      {visible.length === 0 ? (
        <p className="mt-6 text-[14px] leading-6 text-gray-500">目前暂无已发布的稿件。</p>
      ) : (
        <ul className="mt-2">
          {visible.map((s) => {
            // 红点只给"投放后出现、还没读过"的新期；基线期与漂移不点亮。
            const unread = hydrated && Boolean(s.reveal) && (readRevisions[s.id] ?? 0) < 1;
            return (
              <li key={s.id} className="border-b border-line last:border-b-0">
                <Link
                  href={`${basePath}/${s.id}/`}
                  className="-mx-2 block rounded-md px-2 py-4 transition-colors hover:bg-soft"
                >
                  <span className="text-[16px] leading-7 text-link hover:underline">
                    {s.title}
                    {unread ? (
                      <span
                        aria-hidden
                        className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-red-500 align-middle"
                      />
                    ) : null}
                  </span>
                  {showSpeaker ? (
                    <span className="mt-1 block text-[12px] leading-5 text-gray-400">
                      {speakerLabel}：{s.speaker}
                    </span>
                  ) : null}
                  <span className="mt-1 block text-[12px] leading-5 text-gray-400">
                    {timeLabel}：{stamp(s.at)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}