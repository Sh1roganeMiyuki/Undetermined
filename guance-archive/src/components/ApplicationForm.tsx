'use client';

import { APPLICATION_FORM } from '@/data/act4';
import { clock } from '@/lib/format';
import { viewerIdOf } from '@/lib/resolve/identity';
import { applicationOrder } from '@/lib/resolve/receipt';
import { useTrace } from '@/lib/traceStore';
import { useHydrated } from '@/lib/useHydrated';

/**
 * 观测配置申请表（双窗降级版）：两份申请，先后提交，不可撤回。
 *
 * - 立场引用是预先摆好的：玩家不是填理由的人，是选边的人（或者两边都递）；
 * - 回执编号按提交顺序（-01 / -02），只提交一份时它就是 -01；
 * - 每份回执都带一条未申请的"第三项处理意见"——两份回执里是同一句。
 *   它不是被申请出来的；它把"你继续读下去"这件事写成了正在执行的方案。
 *
 * 纪律同签收区：接手前不渲染；回访的玩家进来看见的是结果（已有回执的卡不再出现按钮）。
 */
export function ApplicationForm() {
  const hydrated = useHydrated();
  const apps = useTrace((s) => s.applications);
  const visits = useTrace((s) => s.visits);

  if (!hydrated) return null;

  const order = applicationOrder(apps);
  const vid = viewerIdOf(visits);

  return (
    <div className="my-4 space-y-4">
      {APPLICATION_FORM.entries.map((e) => {
        const at = apps[e.key];
        const no = String(order.indexOf(e.key) + 1).padStart(2, '0');
        return (
          <section key={e.key} className="border border-line">
            <h3 className="border-b border-line bg-soft px-4 py-2 text-[14px] font-semibold text-ink">
              {e.title}
            </h3>
            <div className="px-4 py-3 text-[14px] leading-7 text-gray-800">
              <p>{e.body}</p>
              <p className="mt-1 text-gray-600">理由：{e.rationale}</p>
              {at ? (
                <div className="mt-3 border-t border-line pt-3 text-[13px] leading-6 text-gray-700">
                  <p>
                    回执　编号：{vid}-{no}　时间：{clock(at)}
                  </p>
                  <p className="mt-1">处理意见：</p>
                  <p>一、受理。</p>
                  <p>二、{e.receiptItem}</p>
                  <p>三、{APPLICATION_FORM.ghost}</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => useTrace.getState().submitApplication(e.key)}
                  className="mt-3 rounded border border-line px-3 py-1 text-[13px] text-gray-700 hover:border-link hover:text-link"
                >
                  提交
                </button>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}