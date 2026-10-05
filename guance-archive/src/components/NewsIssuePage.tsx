'use client';

import Link from 'next/link';
import type { ContentBlock, NewsIssue } from '@/types';
import { useSeenBlocks } from '@/lib/signals/useSeenBlocks';
import { useHighPrecisionActions } from '@/lib/signals/useHighPrecisionActions';
import { useVisitTimeline } from '@/lib/signals/useVisitTimeline';

/**
 * 播出稿单档页。与连载单篇同一套信号——
 * "看过的段落"同样可以成为后续内容的解锁钥匙（afterSeen）。
 */
export function NewsIssuePage({ issue }: { issue: NewsIssue }) {
  useVisitTimeline(`news:${issue.id}`);
  useSeenBlocks(issue.id);
  useHighPrecisionActions(`news:${issue.id}`);

  return (
    <div className="mx-auto max-w-[760px]">
      <div className="text-[13px] text-gray-500">
        <Link href="/news/" className="hover:text-link">
          城北新闻
        </Link>
        <span className="px-1 text-gray-300">/</span>
        {issue.label} · {issue.slot}
      </div>

      <h1 className="mt-1 text-[24px] font-semibold leading-9 text-ink">
        {issue.label} · {issue.slot}
      </h1>
      <p className="mt-2 border-b border-line pb-4 text-[13px] leading-6 text-gray-500">
        本稿按存档音频转录，未做删改。
      </p>

      <div className="mt-6">
        {issue.items.map((b) => (
          <NewsItem key={b.id} block={b} />
        ))}
      </div>

      {issue.note ? (
        <p className="mt-6 border-t border-line pt-4 text-[13px] leading-6 text-gray-500">
          {issue.note}
        </p>
      ) : null}
    </div>
  );
}

/** 播出稿条目：只出现段落与列表两种形态，其余类型安静地不渲染。 */
function NewsItem({ block }: { block: ContentBlock }) {
  if (block.type === 'list') {
    return (
      <ul data-bid={block.id} className="my-4 list-disc space-y-1 pl-6 text-gray-800">
        {(block.items ?? []).map((it) => (
          <li key={it}>{it}</li>
        ))}
      </ul>
    );
  }
  if (block.type !== 'paragraph') return null;
  return (
    <p data-bid={block.id} className="my-3 min-h-7 text-gray-800">
      {block.text}
    </p>
  );
}