'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { CATEGORY_LABEL, ENTRIES, getEntry, VERIFY_DOCS, VERIFY_SLUGS } from '@/data/entries';
import type { RevealRule } from '@/types';
import { dupRecordsFor } from '@/lib/resolve/duplicates';
import { meetsRule } from '@/lib/resolve/reveal';
import { useRevealState } from '@/lib/resolve/useRevealState';
import { staleOr } from '@/lib/resolve/snapshots';
import { useTrace } from '@/lib/traceStore';
import { useHydrated } from '@/lib/useHydrated';
import { SearchBar } from '@/components/SearchBar';

/** 检索时可选作摘要的段落。摘要取文一律经 staleOr。 */
interface Piece {
  id: string;
  text: string;
}

interface Doc {
  key: string;
  /**
   * 去重单位。同一个对象只出现一次：
   * "北环路"命中条目也命中它的复核文书，但结果里只留下条目。
   * 复核文书因此没有入口——除非查询本身指向它（"北环路 复核"）。
   */
  group: string;
  kind: 'entry' | 'verify';
  href: string;
  title: string;
  meta: string;
  body: string;
  pieces: Piece[];
}

function piecesOf(text?: string, items?: string[]): string {
  return text ?? (items ?? []).join('；');
}

function buildDocs(): Doc[] {
  const out: Doc[] = [];

  for (const e of ENTRIES) {
    const pieces: Piece[] = e.blocks
      .map((b) => ({ id: b.id, text: piecesOf(b.text, b.items) }))
      .filter((p) => p.text.length > 0);
    out.push({
      key: `entry:${e.slug}`,
      group: e.slug,
      kind: 'entry',
      href: `/entry/${e.slug}/`,
      title: e.title,
      meta: `${CATEGORY_LABEL[e.category]}条目`,
      body: pieces.map((p) => p.text).join('\n'),
      pieces,
    });
  }

  for (const slug of VERIFY_SLUGS) {
    const d = VERIFY_DOCS[slug];
    const pieces: Piece[] = [{ id: d.excerpt.id, text: d.excerpt.text ?? '' }];
    out.push({
      key: `verify:${slug}`,
      group: slug,
      kind: 'verify',
      href: `/verify/${slug}/`,
      title: `复核记录 · ${d.target}`,
      meta: `系统文书 · ${d.at}`,
      body: [d.target, d.conclusion, d.footer, d.excerpt.text ?? ''].join('\n'),
      pieces,
    });
  }

  return out;
}

const DOCS = buildDocs();

function count(hay: string, needle: string): number {
  if (!needle) return 0;
  let n = 0;
  let i = hay.indexOf(needle);
  while (i >= 0) {
    n++;
    i = hay.indexOf(needle, i + needle.length);
  }
  return n;
}

function clip(s: string, n = 110): string {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

interface Hit {
  doc: Doc;
  score: number;
}

function search(q: string): Hit[] {
  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const hits: Hit[] = [];
  for (const doc of DOCS) {
    let score = 0;
    let ok = true;
    for (const t of tokens) {
      // 标题命中计分更高，正文命中按出现次数计
      const c = count(doc.title, t) * 2 + count(doc.body, t);
      if (c === 0) {
        ok = false;
        break;
      }
      score += c;
    }
    if (ok) hits.push({ doc, score });
  }

  // 同一 group 只留分最高的一条；同分时条目优先于其复核文书
  const byGroup = new Map<string, Hit>();
  for (const h of hits) {
    const prev = byGroup.get(h.doc.group);
    if (
      !prev ||
      h.score > prev.score ||
      (h.score === prev.score && h.doc.kind === 'entry')
    ) {
      byGroup.set(h.doc.group, h);
    }
  }
  return [...byGroup.values()].sort((a, b) => b.score - a.score);
}

/** 摘要段落：优先含检索词的那一段，其次第一段。 */
function pickPiece(doc: Doc, tokens: string[]): Piece | undefined {
  for (const t of tokens) {
    const hit = doc.pieces.find((p) => p.text.includes(t));
    if (hit) return hit;
  }
  return doc.pieces[0];
}

/** 一条结果的投放声明：词条取自己的，系统文书（对照物）取自己的。 */
function gateOf(doc: Doc): RevealRule | undefined {
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

  const tokens = q.split(/\s+/).filter(Boolean);
  // 投放过滤：未满足投放条件的一律不进结果——与目录、首页一个口径。
  // 系统文书（对照物）同样受门管：门未开时它不在检索里存在，
  // 否则第一天搜“复核”就能把对照物主动调出来（`04 §八` 禁止）。
  // 页面本身照常静态生成：投放只控制露出渠道，不控制存在。
  const hydrated = useHydrated();
  const reveal = useRevealState();
  const hits = search(q).filter((h) => {
    const rule = gateOf(h.doc);
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
                {hits.map((h) => {
                  // 重复条目：命中主对象时，给出两条同名同链接、编号不同的记录。
                  // 点过任意一条之后，只剩那一条——系统不认为发生过删除，
                  // 因此不存在任何"已删除"的痕迹可查。判定收在 dupRecordsFor 里。
                  const dups = h.doc.kind === 'entry' ? dupRecordsFor(h.doc.group, picked) : null;
                  if (dups) {
                    return dups.map((r) => (
                      <li
                        key={`${h.doc.key}:${r.id}`}
                        className="border-b border-line py-4 last:border-b-0"
                      >
                        <Link
                          href={h.doc.href}
                          onClick={() => useTrace.getState().pickRecord(h.doc.group, r.id)}
                          className="text-[16px] leading-7 text-link hover:underline"
                        >
                          {h.doc.title}
                        </Link>
                        <div className="mt-1 text-[12px] leading-5 text-gray-400">{r.meta}</div>
                        <p className="mt-1 text-[14px] leading-6 text-gray-600">{r.summary}</p>
                      </li>
                    ));
                  }

                  const piece = pickPiece(h.doc, tokens);
                  // 摘录取留存版（staleOr）。它来自 localStorage，服务端那份 HTML 里
                  // 只可能是规范版，而 suppressHydrationWarning 不负责用客户端的值覆盖——
                  // 不用 ref 在首次绘制前写入，摘要就会静默停在规范版上，
                  // "化石只在一处生效"会被玩家当成随机故障。
                  const summary = piece ? clip(staleOr(piece.id, piece.text)) : '';
                  return (
                    <li key={h.doc.key} className="border-b border-line py-4 last:border-b-0">
                      <Link
                        href={h.doc.href}
                        className="text-[16px] leading-7 text-link hover:underline"
                      >
                        {h.doc.title}
                      </Link>
                      <div className="mt-1 text-[12px] leading-5 text-gray-400">{h.doc.meta}</div>
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
