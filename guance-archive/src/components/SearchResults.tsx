'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { getEntry, VERIFY_DOCS } from '@/data/entries';
import type { RevealRule } from '@/types';
import { dupRecordsFor } from '@/lib/resolve/duplicates';
import { meetsRule } from '@/lib/resolve/reveal';
import { useRevealState } from '@/lib/resolve/useRevealState';
import { staleOr } from '@/lib/resolve/snapshots';
import {
  buildSearchDocs,
  pickSearchPiece,
  searchDocs,
  type SearchDoc,
} from '@/lib/searchIndex';
import { useTrace } from '@/lib/traceStore';
import { useHydrated } from '@/lib/useHydrated';
import { SearchBar } from '@/components/SearchBar';

/** 索引在模块加载时建一次：全站文本是构建期常量，没有理由每次查询重建。 */
const DOCS = buildSearchDocs();

function clip(s: string, n = 110): string {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

/** 一条结果的投放声明：词条取自己的，系统文书（对照物）取自己的。 */
function gateOf(doc: SearchDoc): RevealRule | undefined {
  return doc.kind === 'entry'
    ? getEntry(doc.group)?.reveal
    : VERIFY_DOCS[doc.group]?.reveal;
}

export function SearchResults() {
  const params = useSearchParams();
  const q = (params.get('q') ?? '').trim();

  // 同一次查询只登记一条（StrictMode 下 effect 会跑两遍）
  const logged = useRef<string | null>(null);
  useEffect(() => {
    if (!q || logged.current === q) return;
    logged.current = q;
    useTrace.getState().log('search', q);
  }, [q]);

  // 投放过滤：未满足投放条件的一律不进结果——与目录、首页一个口径。
  // 系统文书（对照物）同样受门管：门未开时它不在检索里存在，
  // 否则第一天搜“复核”就能把对照物主动调出来（`04 §八` 禁止）。
  // 页面本身照常静态生成：投放只控制露出渠道，不控制存在。
  const hydrated = useHydrated();
  const reveal = useRevealState();
  const hits = searchDocs(q, DOCS).filter((doc) => {
    const rule = gateOf(doc);
    if (!rule) return true; // 无投放声明 = 建站即在，任何时候都可检索
    return hydrated ? meetsRule(rule, reveal) : false;
  });
  // 重复条目的塌缩状态。旧存档里没有这个字段也没关系：persist 的默认合并是
  // 浅合并，缺失的键会保留 store 初始值（空表），无需在这里兜底。
  const picked = useTrace((s) => s.picked);

  return (
    <div className="flex gap-10">
      <div className="min-w-0 flex-1">
        <h1 className="flex items-center gap-2 text-[24px] font-semibold leading-9 text-ink">
          <span aria-hidden className="h-5 w-1 rounded-full bg-accent" />
          检索
        </h1>
        <div className="mt-3 max-w-[520px]">
          <SearchBar initial={q} variant="light" />
        </div>

        {!q ? (
          <p className="mt-8 text-[14px] leading-6 text-gray-500">
            请输入检索词。检索范围为全部条目与系统文书，检索词之间以空格分隔，须全部命中。
          </p>
        ) : (
          <>
            <p className="mt-6 border-b border-line pb-3 text-[13px] leading-6 text-gray-500">
              {/* 计数按去重单位算，列表却会把重复条目展开成两行——这个"说 N 条、列 N+1 行"
                  的不对称不是缺陷：索引与列表本就统计口径不同，不要去"修"它。 */}
              检索词“{q}”，命中 {hits.length} 条。检索结果按相关度排列，同名对象只列出一次。
            </p>

            {hits.length === 0 ? (
              <p className="mt-6 text-[14px] leading-6 text-gray-500">
                未检索到相符的条目。若确信该内容曾登记在案，请核对名称后重新检索；本站不提供已删除内容的检索。
              </p>
            ) : (
              <ul className="mt-2">
                {hits.map((doc) => {
                  // 重复条目：命中主对象时，给出两条同名同链接、编号不同的记录。
                  // 点过任意一条之后，只剩那一条——系统不认为发生过删除，
                  // 因此不存在任何"已删除"的痕迹可查。判定收在 dupRecordsFor 里。
                  const dups = doc.kind === 'entry' ? dupRecordsFor(doc.group, picked) : null;
                  if (dups) {
                    return dups.map((r) => (
                      <li
                        key={`${doc.key}:${r.id}`}
                        className="border-b border-line py-4 last:border-b-0"
                      >
                        <Link
                          href={doc.href}
                          onClick={() => useTrace.getState().pickRecord(doc.group, r.id)}
                          className="text-[16px] leading-7 text-link hover:underline"
                        >
                          {doc.title}
                        </Link>
                        <div className="mt-1 text-[12px] leading-5 text-gray-400">{r.meta}</div>
                        <p className="mt-1 text-[14px] leading-6 text-gray-600">{r.summary}</p>
                      </li>
                    ));
                  }

                  const piece = pickSearchPiece(doc, q);
                  // 摘录取留存版（staleOr）。它来自 localStorage，服务端那份 HTML 里
                  // 只可能是规范版，而 suppressHydrationWarning 不负责用客户端的值覆盖——
                  // 不用 ref 在首次绘制前写入，摘要就会静默停在规范版上，
                  // "化石只在一处生效"会被玩家当成随机故障。
                  const summary = piece ? clip(staleOr(piece.id, piece.text)) : '';
                  return (
                    <li key={doc.key} className="border-b border-line py-4 last:border-b-0">
                      <Link
                        href={doc.href}
                        className="text-[16px] leading-7 text-link hover:underline"
                      >
                        {doc.title}
                      </Link>
                      <div className="mt-1 text-[12px] leading-5 text-gray-400">{doc.meta}</div>
                      {piece ? (
                        <p
                          suppressHydrationWarning
                          ref={(el) => {
                            if (el && el.textContent !== summary) el.textContent = summary;
                          }}
                          className="mt-1 text-[14px] leading-6 text-gray-600"
                        >
                          {summary}
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>

      <aside className="w-[280px] shrink-0">
        <section className="border border-line">
          <h2 className="border-b border-line bg-soft px-4 py-2 text-[14px] font-semibold text-ink">
            检索说明
          </h2>
          <div className="px-4 py-3 text-[13px] leading-6 text-gray-600">
            <p>检索仅覆盖本站已登记的条目与系统文书。</p>
            <p className="mt-2">摘要文字以本站留存版本为准，可能与条目当前显示的文字不一致。</p>
            <p className="mt-2 text-gray-400">本站不记录检索目的，只记录检索行为。</p>
          </div>
        </section>
      </aside>
    </div>
  );
}
