'use client';

import { FINAL_PLAN } from '@/data/handover';
import { absentLongEnough } from '@/lib/resolve/absence';
import { viewerIdOf } from '@/lib/resolve/identity';
import { useTrace } from '@/lib/traceStore';
import { useHydrated } from '@/lib/useHydrated';

/**
 * 处理方案：最终选择区（幕五收官）。
 *
 * - 四项：A/B/C 常驻；D 为“未申请项”，只在一次足量缺席之后出现（不解释、不宣传）。
 * - 选择一经登记，本站不再提供修改入口（修改的唯一方式不在本站）。
 * - 签名区独立于选项：可以被签，也可以一直空着——空着也是一种答案。
 *
 * 纪律同签收区/申请表：接手前不渲染；回访的玩家进来看到的是结果本身。
 */
export function FinalChoice() {
  const hydrated = useHydrated();
  const choice = useTrace((s) => s.finalChoice);
  const signature = useTrace((s) => s.signature);
  const days = useTrace((s) => s.days);
  const visits = useTrace((s) => s.visits);

  if (!hydrated) return null;

  const absent = absentLongEnough(days);
  const options = FINAL_PLAN.options.filter((o) => !o.hidden || absent);
  const picked = choice ? FINAL_PLAN.options.find((o) => o.key === choice) : undefined;

  return (
    <div className="my-4">
      {absent && !choice ? (
        <p className="mb-3 text-[13px] leading-6 text-gray-500">{FINAL_PLAN.absentNote}</p>
      ) : null}

      {picked ? (
        <section className="border border-line">
          <h3 className="border-b border-line bg-soft px-4 py-2 text-[14px] font-semibold text-ink">
            {picked.key} · {picked.title}
          </h3>
          <div className="px-4 py-3 text-[14px] leading-7 text-gray-800">
            {picked.result.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
            <p className="mt-2 text-[13px] leading-6 text-gray-500">{FINAL_PLAN.locked}</p>
          </div>
        </section>
      ) : (
        <div className="space-y-3">
          {options.map((o) => (
            <section key={o.key} className="border border-line">
              <h3 className="border-b border-line bg-soft px-4 py-2 text-[14px] font-semibold text-ink">
                {o.key} · {o.title}
              </h3>
              <div className="px-4 py-3 text-[14px] leading-7 text-gray-800">
                <p className="text-gray-600">理由：{o.reason}</p>
                <button
                  type="button"
                  onClick={() => useTrace.getState().setFinalChoice(o.key)}
                  className="mt-3 rounded border border-line px-3 py-1 text-[13px] text-gray-700 hover:border-link hover:text-link"
                >
                  登记本方案
                </button>
              </div>
            </section>
          ))}
        </div>
      )}

      {signature ? (
        <p className="mt-4 border-t border-line pt-3 text-[14px] leading-7 text-gray-800">
          {FINAL_PLAN.signed}
          {viewerIdOf(visits)}
          {FINAL_PLAN.signedTail}
        </p>
      ) : (
        <div className="mt-4 border-t border-line pt-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[13px] leading-6 text-gray-600">{FINAL_PLAN.signIntro}</span>
            <button
              type="button"
              onClick={() => useTrace.getState().signLedger()}
              className="rounded border border-line px-3 py-1 text-[13px] text-gray-700 hover:border-link hover:text-link"
            >
              签署
            </button>
          </div>
          <p className="mt-1 text-[13px] leading-6 text-gray-400">{FINAL_PLAN.signHint}</p>
        </div>
      )}
    </div>
  );
}