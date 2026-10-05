'use client';

import { useTrace } from '@/lib/traceStore';
import { buildLedger } from '@/lib/resolve/ledger';
import { useHydrated } from '@/lib/useHydrated';

/**
 * 玩家台账的渲染：须知增补的统计（notice）与见证人函的核对清册（receipt）。
 *
 * 纪律与帧重建区一致：接手前这一段不存在（服务端与首帧都不渲染），
 * 台账出现在接手之后——它读的是一份玩家自己的存档，不该有"渲染中"的占位形态。
 * 行文全部来自 buildLedger 的纯函数输出：数字是真的，名字是真的，
 * 但那句话不解释、不催促——它只是把记录摆出来。
 */
export function ViewerLedger({ variant, intro }: { variant: 'notice' | 'receipt'; intro: string }) {
  const hydrated = useHydrated();
  const seen = useTrace((s) => s.seen);
  const snapshots = useTrace((s) => s.snapshots);
  const visits = useTrace((s) => s.visits);
  const days = useTrace((s) => s.days);

  if (!hydrated) return null;

  const data = buildLedger({ seen, snapshots, visits, days });
  const titles = data.openedTitles;
  const shown =
    titles.length > 3
      ? `${titles
          .slice(0, 3)
          .map((t) => `《${t}》`)
          .join('')}……等 ${titles.length} 个`
      : titles.map((t) => `《${t}》`).join('');

  return (
    <div className="my-3 text-gray-800">
      <p className="my-3 leading-7">{intro}</p>
      <div className="my-2 space-y-0.5 border-l-2 border-line pl-4 text-[14px] leading-7">
        <p>· 观察者编号：{data.viewerId}</p>
        {variant === 'receipt' && data.firstDay ? <p>· 首次查阅：{data.firstDay}</p> : null}
        {variant === 'receipt' ? (
          <p>
            · 涉及条目：{shown || '（无）'}
            {data.otherOpened > 0 ? `（另有栏目材料 ${data.otherOpened} 份）` : ''}
          </p>
        ) : (
          <p>
            · 打开过的条目：{data.entriesOpened} 个
            {data.otherOpened > 0 ? `（另有栏目材料 ${data.otherOpened} 份）` : ''}
          </p>
        )}
        {data.revisits > 0 ? (
          <p>
            · 回访：{data.revisits} 次
            {data.spanDays > 1 ? `，跨 ${data.spanDays} 个自然日` : ''}
          </p>
        ) : null}
        <p>
          · 停留最久的一段：
          {data.longest
            ? `${data.longest.title ? `《${data.longest.title}》` : ''}“${data.longest.excerpt}”，共 ${data.longest.dur}`
            : '（未记录到显著停留）'}
        </p>
        {data.copied ? (
          <p>
            · 复制过的段落：“{data.copied.excerpt}”（共 {data.copied.count} 处）
          </p>
        ) : null}
      </div>
      {variant === 'notice' ? (
        <div className="my-3 leading-7">
          <p>以上记录与你的实际行为一致。</p>
          <p>本词条正在因为你而不再变化。这是好事。我们只是让你知道它发生了。</p>
        </div>
      ) : (
        <p className="my-3 leading-7">以上记录构成你与本站的事实关联。</p>
      )}
    </div>
  );
}