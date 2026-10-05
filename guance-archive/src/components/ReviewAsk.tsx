'use client';

import { DAYLIGHT_REVIEW } from '@/data/daylight';
import { useTrace } from '@/lib/traceStore';
import { useHydrated } from '@/lib/useHydrated';

/**
 * 白昼馆复核意见征询（幕三核心选择）：两方向择一，一经登记不设更改。
 *
 * “增加记录 vs 停止记录”——两边的后果都写成日常文书的口吻；
 * 站内不给任何优缺比较，也没有正确答案。
 * 纪律同其他交互区：接手前不渲染；回访者直接看到登记结果。
 */
export function ReviewAsk() {
  const hydrated = useHydrated();
  const choice = useTrace((s) => s.reviewChoice);

  if (!hydrated) return null;

  const picked = choice ? DAYLIGHT_REVIEW.options.find((o) => o.key === choice) : undefined;

  return (
    <div className="my-4">
      {picked ? (
        <section className="border border-line">
          <h3 className="border-b border-line bg-soft px-4 py-2 text-[14px] font-semibold text-ink">
            {picked.title}
          </h3>
          <div className="px-4 py-3 text-[14px] leading-7 text-gray-800">
            {picked.result.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
            <p className="mt-2 text-[13px] leading-6 text-gray-500">{DAYLIGHT_REVIEW.locked}</p>
          </div>
        </section>
      ) : (
        <div className="space-y-3">
          <p className="text-[13px] leading-6 text-gray-500">{DAYLIGHT_REVIEW.prompt}</p>
          {DAYLIGHT_REVIEW.options.map((o) => (
            <section key={o.key} className="border border-line">
              <h3 className="border-b border-line bg-soft px-4 py-2 text-[14px] font-semibold text-ink">
                {o.title}
              </h3>
              <div className="px-4 py-3 text-[14px] leading-7 text-gray-800">
                <p className="text-gray-600">{o.body}</p>
                <button
                  type="button"
                  onClick={() => useTrace.getState().setReviewChoice(o.key)}
                  className="mt-3 rounded border border-line px-3 py-1 text-[13px] text-gray-700 hover:border-link hover:text-link"
                >
                  登记本方向
                </button>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}