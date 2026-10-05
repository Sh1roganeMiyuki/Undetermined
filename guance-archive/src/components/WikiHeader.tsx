'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import type { RevealRule } from '@/types';
import { CHRONICLES } from '@/data/chronicle';
import { ENTRIES } from '@/data/entries';
import { GOV_DOCS } from '@/data/gov';
import { HOT_SNAPSHOTS } from '@/data/hot';
import { NET_RECORDS } from '@/data/net';
import { NEWS_ISSUES } from '@/data/news';
import { STORIES } from '@/data/stories';
import { meetsRule, entryUnread } from '@/lib/resolve/reveal';
import { useRevealState } from '@/lib/resolve/useRevealState';
import { useTrace } from '@/lib/traceStore';
import { useHydrated } from '@/lib/useHydrated';
import { clock } from '@/lib/format';
import { startTabSync, tabId } from '@/lib/signals/tabSync';
import { SearchBar } from '@/components/SearchBar';

/**
 * "今天"：模块加载时取一次，render 只读常量（纯度规则不允许渲染内读时钟）。
 * 页面只在 hydration 之后才显示它——服务端不替读者断言今天是几号，
 * 也就不会与读者的本地时钟产生 hydration 差异。
 */
const TODAY = clock(Date.now()).slice(0, 10);

/**
 * 站点头部。多标签的布线放在这里：它在每一页都在，
 * 因此"同一时间存在其他查阅会话"是全站持续成立的真实事实，
 * 而不是日志页打开的一瞬间才去数的东西。
 *
 * 栏目入口渐进显示：栏里没有任何可读内容时，不挂入口——
 * 初访只显示"有东西可看"的栏目；此后每解锁一批，入口自己
 * "长出来"（与目录同一个投放模式：接手前按静态口径，接手后按真实状态）。
 * 不解释、不提示——它就是这么长出来的。
 *
 * 视觉：深蓝政务导航条。当前所在栏目以金色下划线标出——
 * 用户在任意深度都能回答"我在哪、还能去哪"。
 */
export function WikiHeader() {
  const hydrated = useHydrated();
  const reveal = useRevealState();
  const pathname = usePathname();

  useEffect(() => {
    useTrace.getState().recordTab(tabId());
    return startTabSync(
      (peer) => useTrace.getState().recordTab(peer),
      () => useTrace.getState().pruneTabs(),
    );
  }, []);

  /** 栏目是否已有可读内容（与目录同一判定模式）。 */
  const hasAny = (items: { reveal?: RevealRule }[]) =>
    items.some((s) => (hydrated ? meetsRule(s.reveal, reveal) : !s.reveal));

  // 栏目级红点：栏内存在"出现后还没读过"的新内容时点亮。
  // 与侧栏同一口径（reveal.entryUnread）；漂移不点亮。
  const visits = useTrace((s) => s.visits);
  const readRevisions = useTrace((s) => s.readRevisions);
  const readHistory = useTrace((s) => s.readHistory);
  const marks = { readRevisions, readHistory, visits };
  const unseenIn = (items: { id: string; reveal?: RevealRule }[], prefix: string) =>
    hydrated &&
    items.some((x) => x.reveal && meetsRule(x.reveal, reveal) && !visits[`${prefix}:${x.id}`]);
  const unreadStory = (items: { id: string; reveal?: RevealRule }[]) =>
    hydrated &&
    items.some((x) => x.reveal && meetsRule(x.reveal, reveal) && (readRevisions[x.id] ?? 0) < 1);
  const hotWm = readRevisions.hot;
  const hotNew =
    hydrated &&
    hotWm !== undefined &&
    HOT_SNAPSHOTS.filter((s) => meetsRule(s.reveal, reveal)).length > hotWm;
  const entryNew = hydrated && ENTRIES.some((e) => !e.unlisted && entryUnread(e, reveal, marks));

  // 导航结构：入口的显隐仍由 hasAny 决定，这里只补上"当前栏目"与红点判定。
  const nav = [
    { href: '/', label: '首页', on: pathname === '/', dot: entryNew },
    {
      href: '/news/',
      label: '城北新闻',
      on: pathname.startsWith('/news'),
      show: hasAny(NEWS_ISSUES),
      dot: unseenIn(NEWS_ISSUES, 'news'),
    },
    {
      href: '/gov/',
      label: '城北政务',
      on: pathname.startsWith('/gov'),
      show: hasAny(GOV_DOCS),
      dot: unseenIn(GOV_DOCS, 'gov'),
    },
    {
      href: '/hot/',
      label: '同城榜',
      on: pathname.startsWith('/hot'),
      show: hasAny(HOT_SNAPSHOTS),
      dot: hotNew,
    },
    {
      href: '/net/',
      label: '网络存档',
      on: pathname.startsWith('/net'),
      show: hasAny(NET_RECORDS),
      dot: unseenIn(NET_RECORDS, 'net'),
    },
    {
      href: '/stories/',
      label: '城北口述',
      on: pathname.startsWith('/stories'),
      show: hasAny(STORIES),
      dot: unreadStory(STORIES),
    },
    {
      href: '/chronicle/',
      label: '城北纪事',
      on: pathname.startsWith('/chronicle'),
      show: hasAny(CHRONICLES),
      dot: unreadStory(CHRONICLES),
    },
    { href: '/trace/', label: '查阅记录', on: pathname.startsWith('/trace') },
  ].filter((x) => x.show !== false);

  return (
    <header className="sticky top-0 z-20 shadow-[0_1px_10px_rgba(0,0,0,0.55)]">
      {/* 顶部细条：政务站点常见的信息带，交代维护主体与"今天"。
          日期取读者本地时钟且仅在客户端渲染——站点存在于此刻，
          而服务端不该替读者断言今天是几号。 */}
      <div className="bg-brand-deep text-[12px] leading-4 text-white/55">
        <div className="mx-auto flex h-7 w-full max-w-[1200px] items-center gap-3 px-6">
          <span>城北新区市政养护中心 · 内容审核组 联合维护</span>
          <span className="ml-auto hidden shrink-0 font-mono tnum sm:block">
            {hydrated ? `今日 ${TODAY}` : '\u00A0'}
          </span>
        </div>
      </div>

      {/* 主导航条 */}
      <div className="bg-gradient-to-r from-brand-deep to-brand">
        <div className="mx-auto flex min-h-14 w-full max-w-[1200px] flex-wrap items-center gap-x-5 gap-y-1 px-6 py-2">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span
              aria-hidden
              className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-seal text-[12px] font-bold leading-none tracking-[0.1em] text-white shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.4)]"
            >
              城北
            </span>
            <span className="text-[16px] font-semibold tracking-wide text-white">
              城北新区资料协作平台
            </span>
          </Link>

          <nav className="flex shrink-0 items-center gap-0.5 text-[14px]">
            {nav.map((x) => (
              <Link
                key={x.href}
                href={x.href}
                aria-current={x.on ? 'page' : undefined}
                className={`relative flex items-center whitespace-nowrap px-3 py-3 transition-colors ${
                  x.on ? 'font-medium text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {x.label}
                {x.dot ? (
                  <span
                    aria-hidden
                    className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-red-500 align-middle"
                  />
                ) : null}
                {x.on ? (
                  <span
                    aria-hidden
                    className="absolute inset-x-2 bottom-1 h-[3px] rounded-t-sm bg-accent"
                  />
                ) : null}
              </Link>
            ))}
          </nav>

          <div className="ml-auto w-[180px] shrink-0 md:w-[220px] xl:w-[260px]">
            <SearchBar />
          </div>
        </div>
      </div>
    </header>
  );
}
