'use client';

import Link from 'next/link';
import type { RevealRule } from '@/types';
import { meetsRule } from '@/lib/resolve/reveal';
import { useRevealState } from '@/lib/resolve/useRevealState';
import { useTrace } from '@/lib/traceStore';
import { useHydrated } from '@/lib/useHydrated';
import { useVisitTimeline } from '@/lib/signals/useVisitTimeline';

export interface IndexItem {
  id: string;
  /** 主行 */
  title: string;
  /** 副行（渠道 / 存档时间） */
  sub?: string;
  /** 行尾小标（如"已不可见"） */
  flag?: string;
  reveal?: RevealRule;
}

/**
 * 存档目录（子菜单式列表）：一行一条，点入即单独文档。
 * 与连载栏目同一个投放模式：接手前按静态口径，接手后按真实状态——
 * 新解锁的期次就这样在回访时"多出一行"，不存在任何"待发布"的空位。
 */
export function ArchiveIndex({
  slug,
  title,
  intro,
  basePath,
  items,
  empty = '暂无存档。',
}: {
  slug: string;
  title: string;
  intro: string;
  basePath: string;
  items: IndexItem[];
  empty?: string;
}) {
  const hydrated = useHydrated();
  const reveal = useRevealState();
  const visits = useTrace((s) => s.visits);
  // 详情页的到访键带栏目前缀（news:<id> / gov:<id> / net:<id>），与 useVisitTimeline 对齐。
  const prefix = basePath.replace(/^\//, '');

  const visible = items.filter((it) => (hydrated ? meetsRule(it.reveal, reveal) : !it.reveal));

  useVisitTimeline(slug);

  return (
    <div className="mx-auto max-w-[760px]">
      <h1 className="flex items-center gap-2 text-[24px] font-semibold leading-9 text-ink">
        <span aria-hidden className="h-5 w-1 rounded-full bg-accent" />
        {title}
      </h1>
      <p className="mt-2 border-b border-line pb-4 text-[13px] leading-6 text-gray-500">{intro}</p>

      {visible.length === 0 ? (
        <p className="mt-6 text-[14px] leading-6 text-gray-500">{empty}</p>
      ) : (
        <ul className="mt-2">
          {visible.map((it) => (
            <li key={it.id} className="border-b border-line last:border-b-0">
              <Link
                href={`${basePath}/${it.id}/`}
                className="-mx-2 block rounded-md px-2 py-3.5 transition-colors hover:bg-soft"
              >
                <span className="text-[16px] leading-7 text-link hover:underline">{it.title}</span>
                {hydrated && it.reveal && !visits[`${prefix}:${it.id}`] ? (
                  <span
                    aria-hidden
                    className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-red-500 align-middle"
                  />
                ) : null}
                {it.flag ? <span className="ml-2 text-[12px] text-red-400">{it.flag}</span> : null}
                {it.sub ? (
                  <span className="mt-1 block text-[12px] leading-5 text-gray-400">{it.sub}</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}