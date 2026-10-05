'use client';

import { useState } from 'react';
import { CLIMB_PATH } from '@/data/qinglan';
import { useTrace } from '@/lib/traceStore';
import { useHydrated } from '@/lib/useHydrated';

/**
 * 环山夜爬（章 3 登顶交互）：分步推进；山脊岔口是两个按钮之一。
 *
 * 进度不存档（半途离开就是半途离开）；只有走完（end）才记下"登过一次"。
 * 走山脊不设任何阻拦——没有巡山的人，也没有"出了什么事"：
 * 只有一块写着 17:30 的牌子，你从它旁边走过去了。
 */
export function ClimbPath() {
  const hydrated = useHydrated();
  const climbed = useTrace((s) => s.climbedAt);
  const [node, setNode] = useState<string | null>(null);

  if (!hydrated) return null;

  if (node === null) {
    return (
      <div className="my-4 border border-line px-4 py-3">
        {climbed ? (
          <p className="text-[14px] leading-7 text-gray-600">你上去过一次了。（山还在那儿。）</p>
        ) : null}
        <button
          type="button"
          onClick={() => setNode('gate')}
          className="mt-2 rounded border border-line px-3 py-1 text-[13px] text-gray-700 hover:border-link hover:text-link"
        >
          出发
        </button>
      </div>
    );
  }

  const cur = CLIMB_PATH[node];
  if (!cur) return null;

  return (
    <div className="my-4 border border-line px-4 py-3">
      <p className="whitespace-pre-line text-[14px] leading-7 text-gray-800">{cur.text}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {cur.choices
          ? cur.choices.map((c) => (
              <button
                key={c.to}
                type="button"
                onClick={() => setNode(c.to)}
                className="rounded border border-line px-3 py-1 text-[13px] text-gray-700 hover:border-link hover:text-link"
              >
                {c.label}
              </button>
            ))
          : null}
        {cur.next ? (
          <button
            type="button"
            onClick={() => setNode(cur.next!)}
            className="rounded border border-line px-3 py-1 text-[13px] text-gray-700 hover:border-link hover:text-link"
          >
            {cur.cta ?? '继续'}
          </button>
        ) : null}
        {cur.end ? (
          <button
            type="button"
            onClick={() => {
              useTrace.getState().markClimbed();
              setNode(null);
            }}
            className="rounded border border-line px-3 py-1 text-[13px] text-gray-700 hover:border-link hover:text-link"
          >
            {cur.cta ?? '结束'}
          </button>
        ) : null}
      </div>
    </div>
  );
}