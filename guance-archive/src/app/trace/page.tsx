'use client';

import type { ReactNode } from 'react';
import { blockText, getEntry } from '@/data/entries';
import { clock, duration } from '@/lib/format';
import { ghostActions } from '@/lib/resolve/ghosts';
import { staleOr } from '@/lib/resolve/snapshots';
import { tabId } from '@/lib/signals/tabSync';
import { countPeers, useTrace, viewerId } from '@/lib/traceStore';
import { useHydrated } from '@/lib/useHydrated';

const KIND_LABEL: Record<string, string> = {
  visit: '打开条目',
  history: '查看编辑历史',
  verify: '查看复核记录',
  talk: '查看讨论页',
  compare: '登记比对',
  settle: '提交处置意见',
  leave: '离开页面',
  copy: '复制原句',
  select: '选中原句',
};

const LINE = '你查阅的内容不会因为你的查阅行为而改变。';
const EMPTY = '本项暂无记录。';
const LIST_CAP = 80; // store 里最多 300 条，页面只列最新的一段
const QUOTE_CHARS = 12;

/** 留存类记录的 target 是"条目:段落"两段式；台账只写条目名，段落编号不进文书。 */
function targetName(target: string): string {
  const slug = target.split(':')[0];
  return getEntry(slug)?.title ?? target;
}

function quote(s: string): string {
  const t = s.trim();
  return t.length > QUOTE_CHARS ? `${t.slice(0, QUOTE_CHARS)}…` : t;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel">
      <h2 className="panel-h flex items-center gap-2">
        <span aria-hidden className="h-3.5 w-1 rounded-full bg-accent" />
        {title}
      </h2>
      <div className="px-4 py-3 text-[14px] leading-6 text-gray-700">{children}</div>
    </section>
  );
}

/**
 * 查阅记录。它是台账，不是仪表盘：
 * 没有分数、没有百分比、没有等级、没有"完成度"，也不给任何一条记录加提示。
 * 这里全部数字都来自真实行为的直接投影，一个也不许是编出来的。
 *
 * 本页允许 hydration 门控——它显示的是玩家自己的时钟与本地记录，
 * 服务端不可能有，且它不承担"该显示哪一版正文"的判定。
 */
export default function TracePage() {
  const hydrated = useHydrated();

  // 订阅稳定引用；派生在 render 体内做。
  // zustand v5 的 selector 一旦返回新数组/新对象，getSnapshot 每次都变，会死循环。
  const actions = useTrace((s) => s.actions);
  const snapshots = useTrace((s) => s.snapshots);
  const days = useTrace((s) => s.days);
  const seen = useTrace((s) => s.seen);
  const tabs = useTrace((s) => s.tabs);
  const visits = useTrace((s) => s.visits);
  // 自我化石：存在即“停留最久的一段”已停在某一次定稿的那一刻。
  const frozen = useTrace((s) => s.frozenLongest);

  // 页面到访：真实台账与幽灵记录混排。幽灵不算操作、不落存档，只在显示时合并（见 ghosts.ts）。
  const pages = [...actions.filter((a) => a.kind !== 'search'), ...ghostActions(days)]
    .sort((a, b) => b.at - a.at)
    .slice(0, LIST_CAP);
  const searches = actions
    .filter((a) => a.kind === 'search')
    .slice(-LIST_CAP)
    .reverse();
  const kept = Object.values(snapshots);

  let topId = '';
  let topMs = 0;
  for (const [id, ms] of Object.entries(seen)) {
    if (ms > topMs) {
      topMs = ms;
      topId = id;
    }
  }
  // 停留可能落在台账取文覆盖不到的数据源上：此时不给引号、只报时长。
  // 不给空引号（那看起来像排版错误），也不解释原因——台账的口径就是“未留存”。
  const topText = topId ? quote(staleOr(topId, blockText(topId))) : '';

  // 首次到访：全部 visits 里最早的 firstAt。它是读者在这个世界里的起点，
  // 只从真实行为里取，不编。
  const firstAt = Object.values(visits).length
    ? Math.min(...Object.values(visits).map((v) => v.firstAt))
    : 0;

  return (
    <div className="mx-auto max-w-[760px]">
      <h1 className="flex items-center gap-2 text-[24px] font-semibold leading-9 text-ink">
        <span aria-hidden className="h-5 w-1 rounded-full bg-accent" />
        查阅记录
      </h1>
      <p className="mt-2 border-b border-line pb-4 text-[13px] leading-6 text-gray-500">
        本页由本站自动生成，记录范围限于本浏览器。记录不上传、不可编辑，本站不受理更正申请。
      </p>

      {hydrated ? (
        <div className="mt-4 space-y-4">
          <Section title="查阅会话编号">
            <p className="font-mono text-[15px] text-brand">{viewerId()}</p>
            <p className="mt-1 text-[13px] text-gray-400">
              编号由本浏览器的首次查阅行为生成，不随查阅次数变化。
            </p>
            {firstAt ? (
              <p className="mt-1 text-[13px] text-gray-500 tnum">
                首次到访 {clock(firstAt).slice(0, 10)} · 累计到访 {days.length} 个自然日
              </p>
            ) : null}
          </Section>

          <Section title="页面到访">
            {pages.length === 0 ? (
              <p className="text-gray-500">{EMPTY}</p>
            ) : (
              <ul>
                {pages.map((a, i) => (
                  <li key={`${a.at}-${i}`} className="flex flex-wrap gap-x-4">
                    <span className="shrink-0 text-gray-400">{clock(a.at)}</span>
                    <span>{KIND_LABEL[a.kind] ?? a.kind}</span>
                    <span className="text-gray-500">{targetName(a.target)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="搜索记录">
            {searches.length === 0 ? (
              <p className="text-gray-500">{EMPTY}</p>
            ) : (
              <ul>
                {searches.map((a, i) => (
                  <li key={`${a.at}-${i}`} className="flex flex-wrap gap-x-4">
                    <span className="shrink-0 text-gray-400">{clock(a.at)}</span>
                    <span>检索词“{a.target}”</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-[13px] text-gray-400">本站只记录检索行为，不记录检索目的。</p>
          </Section>

          <Section title="留存原句">
            {kept.length === 0 ? (
              <p className="text-gray-500">{EMPTY}</p>
            ) : (
              <>
                {kept.map((s) => (
                  <p key={s.key} suppressHydrationWarning className="text-gray-800">
                    “{s.text}”
                  </p>
                ))}
                <p className="mt-2 text-[13px] text-gray-400">
                  以上文字于查阅过程中留存，留存后不再更新。
                </p>
              </>
            )}
          </Section>

          <Section title="出现过记录的自然日">
            {days.length === 0 ? (
              <p className="text-gray-500">{EMPTY}</p>
            ) : (
              <ul>
                {days.map((d) => (
                  <li key={d} className="text-gray-700">
                    {d}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="停留最久的一段">
            {frozen ? (
              /* 化石行：引号与时长都停在冻结那一刻，而本页其余数字照常走。
                 不加任何标注——台账里“留存后不再更新”的话只说过原句，
                 没说过读数；读者自己发现某一格不再动。 */
              <p suppressHydrationWarning>
                {frozen.text ? `“${quote(frozen.text)}”` : '（该项文本未留存。）'}
                <span className="ml-2 text-gray-400">累计 {duration(frozen.ms)}</span>
              </p>
            ) : topId ? (
              <p suppressHydrationWarning>
                {topText ? `“${topText}”` : '（该项文本未留存。）'}
                <span className="ml-2 text-gray-400">累计 {duration(topMs)}</span>
              </p>
            ) : (
              <p className="text-gray-500">{EMPTY}</p>
            )}
          </Section>

          <Section title="并发查阅">
            <p>同一时间存在其他查阅会话：{countPeers(tabs, tabId())}</p>
          </Section>

          <div className="py-6 text-[13px] leading-6 text-gray-500">
            <p>以上记录由本站自动生成。</p>
            <p>{LINE}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
