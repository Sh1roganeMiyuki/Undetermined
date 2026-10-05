'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import type { WikiEntry } from '@/types';
import { CATEGORY_LABEL, ENTRIES, getEntry } from '@/data/entries';
import { TALKS } from '@/data/talk';
import { BlockList, EntryBody } from '@/components/EntryBody';
import { stamp } from '@/lib/format';
import { visibleHistory } from '@/lib/resolve/history';
import { revisionShown } from '@/lib/resolve/reveal';
import { roundFromDn } from '@/lib/resolve/roundFor';
import { useRevealState } from '@/lib/resolve/useRevealState';
import { useTrace } from '@/lib/traceStore';
import { useHydrated } from '@/lib/useHydrated';

/**
 * 词条页。左栏正文、右栏条目信息，全部是正常的协作百科排版：
 * 没有提示条、没有"本条目可能已变化"的警告、没有任何强调色。
 *
 * 凡涉及编辑记录的展示（最近登记、登记次数、历史条数）一律取可见口径：
 * 接手前按第 0 轮、接手后按真实轮次。不同口径混用，会让"最近登记"
 * 指向一条历史页里根本不存在的记录。
 *
 * 文书编号是登记秩序的投影：分类代码 + 同类登记顺序 + 登记年份，
 * 全部可由数据重建，不额外存一份——和正文版本的口径一致。
 */
const DOC_CODE: Record<WikiEntry['category'], string> = {
  location: 'LOC',
  event: 'EVT',
  personnel: 'PER',
  protocol: 'PRT',
  record: 'REC',
  special: 'SPC',
};

function docNo(entry: WikiEntry): string {
  const first = entry.history[0];
  const year = first ? stamp(first.at).slice(0, 4) : '0000';
  const idx = ENTRIES.filter((e) => e.category === entry.category).findIndex(
    (e) => e.slug === entry.slug,
  );
  return `CB-${year}-${DOC_CODE[entry.category]}-${String(idx + 1).padStart(2, '0')}`;
}
export function EntryPage({ entry }: { entry: WikiEntry }) {
  const hydrated = useHydrated();
  const round = useTrace((s) => roundFromDn(s.visits[entry.slug]?.dn ?? 1));
  const records = visibleHistory(entry.history, hydrated ? round : 0);
  const last = records[records.length - 1];
  const thread = TALKS[entry.slug];
  const reveal = useRevealState();
  const revIdx = revisionShown(entry, reveal);

  // 到访即已读：把已读水位推到当前展示到的修订（只前进，幂等）。
  // 目录红点由这个水位决定——"读完即消失"的实现就是这一段。
  useEffect(() => {
    if (!hydrated) return;
    useTrace.getState().markDocRead(entry.slug, revIdx);
  }, [hydrated, entry.slug, revIdx]);

  // 历史水位播种：只在键不存在时写入当前可见登记条数。
  // 基线条数不是"新内容"——首访不满屏红点；此后多出的记录才点亮。
  useEffect(() => {
    if (!hydrated) return;
    useTrace.getState().seedHistory(entry.slug, records.length);
  }, [hydrated, entry.slug, records.length]);

  const related = (entry.related ?? [])
    .map((s) => getEntry(s))
    .filter((e): e is WikiEntry => Boolean(e));

  return (
    <div className="flex flex-col gap-8 xl:flex-row">
      <article className="relative min-w-0 flex-1">
        {/* 登记章：淡到几乎是纸的一部分。它盖在文字上，就像真的章那样。
            深纸上透明度得比浅纸高一些才留得住那一点印泥色，但仍然不抢正文 */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-1 flex h-24 w-24 rotate-[-14deg] select-none items-center justify-center rounded-md border-[3px] border-seal/25"
        >
          <span className="text-[20px] font-bold leading-tight tracking-[0.2em] text-seal/25 [writing-mode:vertical-rl]">
            城北档案
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1 text-[13px] text-gray-500">
          <Link href="/" className="hover:text-link">
            首页
          </Link>
          <span aria-hidden className="text-gray-300">
            ›
          </span>
          <span className="text-brand">{CATEGORY_LABEL[entry.category]}</span>
          <span aria-hidden className="text-gray-300">
            ›
          </span>
          <span className="trunc max-w-[240px] text-gray-500">{entry.title}</span>
        </div>

        <h1 className="mt-2 text-[26px] font-semibold leading-10 text-ink">{entry.title}</h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line pb-4 text-[13px] leading-6 text-gray-500">
          <span className="rounded bg-soft px-1.5 py-px font-mono text-[12px]">
            最近登记 {stamp(last.at)}
          </span>
          <span className="text-gray-400">{last.by}</span>
          <Link
            href={`/history/${entry.slug}/`}
            className="rounded border border-line px-2 py-px text-[12px] transition-colors hover:border-link/40 hover:text-link"
          >
            编辑历史（{records.length}）
          </Link>
          {thread ? (
            <Link
              href={`/talk/${entry.slug}/`}
              className="rounded border border-line px-2 py-px text-[12px] transition-colors hover:border-link/40 hover:text-link"
            >
              讨论（{thread.posts.length}）
            </Link>
          ) : null}
        </div>

        <div className="mt-6">
          {/* 文书元数据条：编号 / 首次登记 / 状态 / 维护，一眼可验的登记秩序 */}
          <dl className="flex flex-wrap gap-x-6 gap-y-1 rounded-md border border-line bg-soft px-4 py-2 font-mono text-[12px] text-gray-500 tnum">
            <div className="flex gap-1.5">
              <dt>编号</dt>
              <dd className="text-gray-700">{docNo(entry)}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt>首次登记</dt>
              <dd className="text-gray-700">{stamp(entry.history[0].at).slice(0, 10)}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt>状态</dt>
              <dd className="text-gray-700">已定稿</dd>
            </div>
            <div className="flex gap-1.5">
              <dt>维护</dt>
              <dd className="text-gray-700">市政养护中心</dd>
            </div>
          </dl>
        </div>

        <div className="mt-6">
          {/* revKey：修订区在接手后渲染，修订数变化让观察器重扫、捕获修订块 */}
          <EntryBody entry={entry} revKey={revIdx} />
        </div>

        {/*
         * 文档修订区：满足条件的修订追加在正文之后（不替换，新旧并列）。
         * 接手前不渲染——修订区在页面底部，接手后的出现发生在视口之外，
         * 不会让文字在眼前换掉。未满足条件的修订在这里不存在，
         * 也不存在任何“已锁定”的痕迹。
         */}
        {hydrated && revIdx > 0 && entry.revisions
          ? entry.revisions.slice(0, revIdx).map((rev, i) => (
              <section key={i} className="mt-10 border-t border-line pt-6">
                <h2 className="mb-3 text-[17px] font-semibold leading-7 text-ink">{rev.title}</h2>
                <BlockList blocks={rev.blocks} slug={entry.slug} />
              </section>
            ))
          : null}
      </article>

      <aside className="w-full xl:sticky xl:top-[104px] xl:w-[280px] xl:shrink-0 xl:self-start">
        <section className="panel">
          <h2 className="panel-h flex items-center gap-2">
            <span aria-hidden className="h-3.5 w-1 rounded-full bg-accent" />
            条目信息
          </h2>
          <dl className="divide-y divide-line text-[13px] leading-6">
            <div className="flex justify-between gap-3 px-4 py-2">
              <dt className="text-gray-500">分类</dt>
              <dd className="font-medium text-brand">{CATEGORY_LABEL[entry.category]}</dd>
            </div>
            <div className="flex justify-between gap-3 px-4 py-2">
              <dt className="text-gray-500">登记次数</dt>
              <dd className="text-gray-700">{records.length} 次</dd>
            </div>
            <div className="flex justify-between gap-3 px-4 py-2">
              <dt className="text-gray-500">最近登记</dt>
              <dd className="font-mono text-[12px] text-gray-700">{stamp(last.at)}</dd>
            </div>
          </dl>
        </section>

        <section className="panel mt-4">
          <h2 className="panel-h">最近一次登记</h2>
          <div className="px-4 py-3 text-[13px] leading-6 text-gray-600">
            <p>{last.note}</p>
            <p className="mt-1 text-gray-400">
              {last.by} · {stamp(last.at)}
            </p>
            <Link
              href={`/history/${entry.slug}/`}
              className="mt-2 inline-block text-link hover:underline"
            >
              查看全部登记记录 →
            </Link>
          </div>
        </section>

        {related.length > 0 ? (
          <section className="panel mt-4">
            <h2 className="panel-h">相关词条</h2>
            <ul className="px-2 py-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/entry/${r.slug}/`}
                    className="flex items-baseline justify-between gap-2 rounded-md px-2 py-1 text-[13px] leading-6 transition-colors hover:bg-soft"
                  >
                    <span className="text-link hover:underline">{r.title}</span>
                    <span className="shrink-0 text-[12px] text-gray-400">
                      {CATEGORY_LABEL[r.category]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className="mt-4 px-1 text-[12px] leading-5 text-gray-400">
          本条目不接受在线编辑。如需更正，请在编辑历史页提交说明。
        </p>
      </aside>
    </div>
  );
}
