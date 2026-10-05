'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ContentBlock, GovDoc } from '@/types';
import { GOV_IMPL_CUT_ID, GOV_RECEIPT_LINES } from '@/data/gov';
import { SEEN_GATE_MS } from '@/lib/reader';
import { useSeenBlocks } from '@/lib/signals/useSeenBlocks';
import { useHighPrecisionActions } from '@/lib/signals/useHighPrecisionActions';
import { useVisitTimeline } from '@/lib/signals/useVisitTimeline';
import { useTrace } from '@/lib/traceStore';
import { useHydrated } from '@/lib/useHydrated';
import { InterceptNotice } from '@/components/InterceptNotice';

/**
 * 城北政务单篇页。
 *
 * 与其它栏目最大的不同：正文区走接手门控（"接手前不渲染"）——
 * 正文与撤稿回执是互斥的两个版本，而回执状态只存在于本地记录里。
 * 服务端产物不能预知读者是否已被拦截；若先渲染正文再替换，
 * 慢网下玩家会亲眼看到"文字被换掉"——那正是呈现规范禁止的事。
 *
 * 拦截态取"进入时快照"（useState 初值只求一次）：
 * 弹层弹出的同一场访问里，页面保持截断现场——回执留给下次到访。
 * 这是有意的：没有人当场把纸收走；下次回来，处置已经完成。
 */
export function GovDocPage({ doc }: { doc: GovDoc }) {
  const hydrated = useHydrated();
  useVisitTimeline(`gov:${doc.id}`);
  // 正文在接手后才进 DOM：钥匙带一段后缀，接手后钥匙变化，观察器重扫。
  useSeenBlocks(hydrated ? doc.id : `${doc.id}#pre`);
  useHighPrecisionActions(`gov:${doc.id}`);

  // 进入时的拦截快照：本次到访内不因弹层写入而切换。
  const [entryIntercepted] = useState(() => useTrace.getState().interceptedAt !== null);

  // 公文走仿宋栈 + 首行缩进：行政公文的排印惯例，与协作词条区分开
  return (
    <div className="doc-gov doc-indent mx-auto max-w-[760px]">
      <div className="text-[13px] text-gray-500">
        <Link href="/gov/" className="hover:text-link">
          城北政务
        </Link>
        <span className="px-1 text-gray-300">/</span>
        {doc.kind}
      </div>

      <h1 className="mt-1 text-[24px] font-semibold leading-9 text-ink">{doc.title}</h1>

      {!hydrated ? null : entryIntercepted ? (
        <Receipt />
      ) : (
        <>
          <div className="mt-6">
            {doc.blocks.map((b) => (
              <GovBlock key={b.id} block={b} />
            ))}
          </div>
          {doc.id === 'gov-impl' ? <InterceptWatcher /> : null}
        </>
      )}
    </div>
  );
}

/**
 * 拦截观察：全站唯一一次弹层的触发。
 *
 * 观察截断块——入视口并停留达到阅读门槛（真正看过）即触发：
 * 落盘 interceptedAt + 弹出通知；未满门槛就划出的，撤计时（划过不算）。
 * 一旦落盘，本栏目对他撤稿——下次到访，回执生效。
 */
function InterceptWatcher() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = document.querySelector(`[data-bid="${GOV_IMPL_CUT_ID}"]`);
    if (!el) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const io = new IntersectionObserver(
      (records) => {
        for (const r of records) {
          if (r.isIntersecting) {
            if (!timer) {
              timer = setTimeout(() => {
                timer = null;
                useTrace.getState().setIntercepted();
                setShown(true);
              }, SEEN_GATE_MS);
            }
          } else if (timer) {
            clearTimeout(timer);
            timer = null;
          }
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!shown) return null;
  return <InterceptNotice onClose={() => setShown(false)} />;
}

/** 撤稿回执：正文的替代态。只陈述处置事实，不解释。 */
function Receipt() {
  return (
    <div className="mt-6 border border-line px-5 py-5">
      <p className="text-[13px] leading-6 text-gray-500">城北政务 · 内容维护说明</p>
      {GOV_RECEIPT_LINES.map((t) => (
        <p key={t} className="mt-2 text-[14px] leading-7 text-gray-800">
          {t}
        </p>
      ))}
    </div>
  );
}

/** 公文条目：段落与表格两种形态，其余类型安静地不渲染。 */
function GovBlock({ block }: { block: ContentBlock }) {
  if (block.type === 'table') {
    return (
      <div data-bid={block.id} className="overflow-x-auto">
        <table className="ledger-table my-4 w-full border-collapse text-[14px]">
          <tbody>
            {(block.rows ?? []).map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} className="px-3 py-2 align-top text-gray-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (block.type !== 'paragraph') return null;
  return (
    <p data-bid={block.id} className="my-3 min-h-7 text-gray-800">
      {block.text}
    </p>
  );
}