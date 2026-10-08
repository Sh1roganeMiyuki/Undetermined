'use client';

import { useState } from 'react';
import type { ReconstructSceneData, ReconstructVerdict } from '@/types';
import { useTrace } from '@/lib/traceStore';
import { useHydrated } from '@/lib/useHydrated';
import {
  findConflict,
  frameUnlocked,
  passVerdictId,
  verdictSelectable,
} from '@/lib/resolve/reconstruct';

/**
 * 还原台：物证比对 / 人证比对。
 *
 * 交互纪律：
 * - 记录（比对材料）是折叠的原生 details：嵌套交互不需要任何 JS 状态，也就没有接手期的
 *   闪烁问题。点选比对、矛盾登记、处置意见都在组件事件里完成——它们不是渲染门控。
 * - 每次比对（无论是否构成矛盾）都被记入台账：比对动作本身就是观测。
 * - 处置意见可改选；终章一旦解锁不再收回。
 * - 处置选项由场景声明（verdicts）；未声明时用缺省三项——那是 12·07 的首场。
 * - “无锁、无空槽”：未解锁的处置选项与终章区在这里完全不存在，没有占位、没有提示。
 */

const NO_MARKS: string[] = [];

/** 缺省处置三项（12·07 首场）：设备故障 / 记录未写入 / 两条都成立。 */
const DEFAULT_VERDICTS: ReconstructVerdict[] = [
  { id: 'fault', label: '设备故障', note: '已按设备故障登记。本页比对结束。' },
  { id: 'blank', label: '记录未写入', note: '已按未写入段登记。' },
  { id: 'both', label: '两条都成立', note: '已按“两条都成立”登记。', hidden: true },
];

/** 行 id -> 时间与来源短名（展示辅助，非判定）。 */
function rowMeta(scene: ReconstructSceneData, rowId: string): { t: string; short: string } {
  for (const rec of scene.records) {
    for (const row of rec.rows) {
      if (row.id === rowId) return { t: row.t, short: rec.short };
    }
  }
  return { t: '', short: '' };
}

export function ReconstructScene({ scene, slug }: { scene: ReconstructSceneData; slug: string }) {
  const hydrated = useHydrated();
  const marks = useTrace((s) => s.reconstruct[scene.id]?.marks) ?? NO_MARKS;
  const verdict = useTrace((s) => s.reconstruct[scene.id]?.verdict);
  const [picked, setPicked] = useState<string[]>([]);
  const [note, setNote] = useState('');

  const toggleRow = (rowId: string) => {
    setNote('');
    const next = picked.includes(rowId)
      ? picked.filter((x) => x !== rowId)
      : [...picked, rowId].slice(-2);

    if (next.length === 2) {
      const { markConflict, log } = useTrace.getState();
      log('compare', slug);
      const hit = findConflict(scene, next[0], next[1]);
      if (hit) markConflict(scene.id, hit.id);
      else setNote('未发现不一致。');
      setPicked([]);
      return;
    }
    setPicked(next);
  };

  const choose = (v: string) => {
    // 通过项（隐藏项）的硬门槛在判定函数里；这里只负责把不满足的情形安静地挡回去。
    if (v === passVerdictId(scene) && marks.length < scene.conflicts.length) {
      setNote('本处置暂无法登记。');
      return;
    }
    const { setVerdict, log } = useTrace.getState();
    setVerdict(scene.id, v);
    log('settle', slug);
  };

  const declared = scene.verdicts ?? DEFAULT_VERDICTS;
  const markedConflicts = scene.conflicts.filter((c) => marks.includes(c.id));
  const selectable = verdictSelectable(marks);
  const unlocked = frameUnlocked(scene, marks, verdict);
  const verdictOptions = (selectable ? declared : declared.filter((v) => !v.hidden)).map((v) => v.id);
  const labelOf = (id: string) => declared.find((v) => v.id === id)?.label ?? '';
  const noteOf = (id: string) => declared.find((v) => v.id === id)?.note ?? '';

  return (
    <section className="border border-line">
      <h2 className="border-b border-line bg-soft px-4 py-2 text-[14px] font-semibold text-ink">
        比对台
      </h2>
      <p className="px-4 pt-3 text-[12px] leading-5 text-gray-400">点选两处记录进行比对。</p>

      <div className="space-y-2 px-4 py-3">
        {scene.records.map((rec) => (
          <details key={rec.id} className="border border-line">
            <summary className="cursor-pointer px-3 py-2 text-[14px] text-gray-700">
              {rec.title}
            </summary>
            <ul className="border-t border-line">
              {rec.rows.map((row) => {
                const isPicked = picked.includes(row.id);
                const isMarked =
                  hydrated &&
                  markedConflicts.some((c) => c.rowA === row.id || c.rowB === row.id);
                return (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => toggleRow(row.id)}
                      className={`flex w-full items-baseline gap-3 px-3 py-[5px] text-left text-[13px] leading-6 ${
                        isPicked ? 'bg-soft text-ink' : 'text-gray-600 hover:text-ink'
                      }`}
                    >
                      <span className="shrink-0 text-gray-400">{row.t}</span>
                      <span>{row.text}</span>
                      {isMarked ? (
                        <span className="ml-auto shrink-0 text-[12px] text-gray-400">已登记</span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </details>
        ))}
      </div>

      {note ? <p className="px-4 pb-2 text-[13px] leading-6 text-gray-500">{note}</p> : null}

      <div className="border-t border-line px-4 py-3">
        <div className="text-[13px] font-semibold text-gray-500">推断台</div>
        {hydrated && markedConflicts.length > 0 ? (
          <ul className="mt-1">
            {markedConflicts.map((c) => {
              const a = rowMeta(scene, c.rowA);
              const b = rowMeta(scene, c.rowB);
              return (
                <li key={c.id} className="text-[13px] leading-6 text-gray-600">
                  {a.t} · {a.short} ／ {b.t} · {b.short}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-1 text-[13px] leading-6 text-gray-500">暂无登记。</p>
        )}

        <div className="mt-3 border-t border-line pt-3">
          <div className="text-[13px] text-gray-500">处置意见：</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {verdictOptions.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => choose(v)}
                className={`rounded border px-3 py-1 text-[13px] ${
                  verdict === v
                    ? 'border-link text-link'
                    : 'border-line text-gray-700 hover:border-link hover:text-link'
                }`}
              >
                {labelOf(v)}
              </button>
            ))}
          </div>
          {hydrated && verdict ? (
            <p className="mt-2 text-[13px] leading-6 text-gray-600">{noteOf(verdict)}</p>
          ) : null}
        </div>
      </div>

      {/*
       * 帧数据重建。未解锁时它在这里完全不存在。
       * 解锁状态来自存档，服务端无从得知——接手后才渲染；
       * 它在折叠记录与推断台之后，出现通常发生在视口之外。
       */}
      {hydrated && unlocked ? (
        <div className="border-t border-line px-4 py-4">
          <div className="text-[13px] font-semibold text-gray-500">{scene.finale.title}</div>
          <div className="mt-2 text-[14px] leading-6 text-gray-700">
            {scene.finale.lines.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          {/* 填图后渲染真图（限高保比例——本图是上下拼接的比对示意图，裁切就只剩中缝）；
              无图时 h-40 alt 框；两种形态加载前高度都确定（`08` §七 2 红线②）。
              本 figure 不携 data-bid：还原台的阅读结算记在矛盾块上，不记在比对图。 */}
          <figure
            className={
              scene.finale.photo.src
                ? 'mt-3 flex min-h-40 items-center justify-center overflow-hidden border border-line bg-soft'
                : 'mt-3 flex h-40 items-center justify-center border border-line bg-soft'
            }
          >
            {scene.finale.photo.src ? (
              // eslint-disable-next-line @next/next/no-img-element -- images.unoptimized 已开，next/image 在此无优化收益；限高保比例避免裁切
              <img
                src={scene.finale.photo.src}
                alt={scene.finale.photo.alt}
                className="block max-h-[480px] w-auto max-w-full"
              />
            ) : (
              <span className="flex h-40 items-center justify-center px-4 text-center text-[13px] text-gray-500">
                {scene.finale.photo.alt}
              </span>
            )}
          </figure>
          <p className="mt-2 text-[13px] leading-6 text-gray-600">{scene.finale.photo.caption}</p>
        </div>
      ) : null}
    </section>
  );
}