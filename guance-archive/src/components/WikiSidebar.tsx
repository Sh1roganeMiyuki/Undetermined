'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CATEGORY_LABEL, ENTRIES } from '@/data/entries';
import { clock, stamp } from '@/lib/format';
import { entryRevealed, entryUnread } from '@/lib/resolve/reveal';
import { viewerIdOf } from '@/lib/resolve/identity';
import { useRevealState } from '@/lib/resolve/useRevealState';
import { useTrace } from '@/lib/traceStore';
import { useHydrated } from '@/lib/useHydrated';
import type { WikiEntry } from '@/types';

/** 目录顺序固定：地点、事件、规程。不按玩家行为重排。 */
const ORDER: WikiEntry['category'][] = ['location', 'event', 'personnel', 'protocol', 'record'];

/** 目录行尾的登记日期：只取 YY-MM-DD，台账式排布，等宽数字。 */
function regDate(e: WikiEntry): string {
  const first = e.history[0];
  return first ? stamp(first.at).slice(2, 10) : '';
}

export function WikiSidebar() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const reveal = useRevealState();
  const readRevisions = useTrace((s) => s.readRevisions);
  const readHistory = useTrace((s) => s.readHistory);
  const visits = useTrace((s) => s.visits);
  const days = useTrace((s) => s.days);

  // 阅读模式：纪事单篇不展示维基侧栏——从列表点进去，就是离开了资料库。
  const isReading = pathname.startsWith('/chronicle/') && pathname !== '/chronicle/';
  if (isReading) return null;

  // 未列入目录的词条（如几份互相不印证的记录）不出现——
  // 目录页底部的口径已经写好："未列入目录的文书不参与站内浏览"。
  // 投放：接手前按静态口径（无投放声明的才显示，与服务端一致）；
  // 接手后按真实状态——满足条件的内容就这样"突然多出来"。
  const groups = ORDER.map((c) => ({
    c,
    list: ENTRIES.filter(
      (e) => e.category === c && !e.unlisted && (hydrated ? entryRevealed(e, reveal) : !e.reveal),
    ),
  })).filter((g) => g.list.length > 0);

  // 指引只给还没上路的人：打开过任何一份文书之后，它自行撤下，
  // 原位换成"读者登记"——站点不口头夸你学会了，它只是开始把你当在册读者。
  // 但《新编辑须知》本身不算"上路"：读说明书的人恰恰是还需要说明书的人。
  const novice =
    !hydrated || !Object.keys(visits).some((k) => k !== 'new-editor-guide');
  const firstAt = novice
    ? 0
    : Math.min(...Object.values(visits).map((v) => v.firstAt));

  return (
    <aside className="hidden w-60 shrink-0 lg:sticky lg:top-[104px] lg:block lg:self-start">
      <nav className="panel">
        <h2 className="panel-h flex items-center gap-2">
          <span aria-hidden className="h-3.5 w-1 rounded-full bg-accent" />
          条目目录
        </h2>
        <div className="px-3 py-3">
          {groups.map((g) => (
            <div key={g.c} className="mb-4 last:mb-0">
              <div className="flex items-baseline justify-between px-2">
                <span className="text-[12px] font-semibold tracking-[0.2em] text-brand/80">
                  {CATEGORY_LABEL[g.c]}
                </span>
                <span className="text-[11px] text-gray-400 tnum">{g.list.length}</span>
              </div>
              <ul className="mt-1">
                {g.list.map((e) => {
                  // 红点口径唯一出口：新文书 / 未读修订 / 未读新登记记录；漂移不点亮。
                  const unread =
                    hydrated && entryUnread(e, reveal, { readRevisions, readHistory, visits });
                  const on = pathname === `/entry/${e.slug}/`;
                  return (
                    <li key={e.slug}>
                      <Link
                        href={`/entry/${e.slug}/`}
                        className={`flex items-baseline justify-between gap-2 rounded-md px-2 py-1 text-[14px] leading-6 transition-colors ${
                          on
                            ? 'bg-brand-soft font-medium text-brand'
                            : 'text-gray-700 hover:bg-soft hover:text-link'
                        }`}
                      >
                        <span className="trunc min-w-0">
                          {e.title}
                          {unread ? (
                            <span
                              aria-hidden
                              className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-red-500 align-middle"
                            />
                          ) : null}
                        </span>
                        <span
                          aria-hidden
                          className="shrink-0 font-mono text-[11px] text-gray-400 tnum"
                        >
                          {regDate(e)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {novice ? (
        /* 查阅指引：只在新读者第一次进门时在。口吻是平台对协作者的例行告知。 */
        <section className="panel mt-4">
          <h2 className="panel-h flex items-center gap-2">
            <span aria-hidden className="h-3.5 w-1 rounded-full bg-accent" />
            查阅指引
          </h2>
          <ol className="space-y-2 px-4 py-3 text-[13px] leading-5 text-gray-600">
            <li className="flex gap-2">
              <span aria-hidden className="mt-[2px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand">
                1
              </span>
              <span>从左侧目录或顶部搜索进入任一词条；未列入目录的文书可经检索调阅。</span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden className="mt-[2px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand">
                2
              </span>
              <span>词条页内可查看该条的编辑历史与讨论，用于对照不同时间的登记内容。</span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden className="mt-[2px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand">
                3
              </span>
              <span>新闻、政务、同城榜等栏目入口在页面顶部，随资料归档进度逐步开放。</span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden className="mt-[2px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand">
                4
              </span>
              <span>
                你的查阅行为会记入本地
                <Link href="/trace/" className="text-link hover:underline">
                  查阅记录
                </Link>
                ，仅在本浏览器内有效。
              </span>
            </li>
          </ol>
        </section>
      ) : (
        /* 读者登记：指引撤下后原位出现。编号与日期全部来自真实行为，一个也不编。 */
        <section className="panel mt-4">
          <h2 className="panel-h flex items-center gap-2">
            <span aria-hidden className="h-3.5 w-1 rounded-full bg-accent" />
            读者登记
          </h2>
          <dl className="divide-y divide-line text-[13px] leading-6">
            <div className="flex justify-between gap-3 px-4 py-2">
              <dt className="text-gray-500">编号</dt>
              <dd className="font-mono text-brand">{viewerIdOf(visits)}</dd>
            </div>
            <div className="flex justify-between gap-3 px-4 py-2">
              <dt className="text-gray-500">首次到访</dt>
              <dd className="font-mono text-[12px] text-gray-700 tnum">
                {clock(firstAt).slice(0, 10)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 px-4 py-2">
              <dt className="text-gray-500">到访日数</dt>
              <dd className="text-gray-700 tnum">{days.length} 日</dd>
            </div>
          </dl>
          <p className="border-t border-line px-4 py-2 text-[12px] leading-5 text-gray-400">
            编号由本浏览器首次查阅行为生成，不随查阅次数变化。
          </p>
        </section>
      )}

      <p className="mt-4 px-1 text-[12px] leading-5 text-gray-400">
        目录由内容审核组维护。未列入目录的文书不参与站内浏览。
      </p>
    </aside>
  );
}
