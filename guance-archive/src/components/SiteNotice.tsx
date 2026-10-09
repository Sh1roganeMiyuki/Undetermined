'use client';

import { hasReturnedBefore } from '@/lib/traceStore';
import { useHydrated } from '@/lib/useHydrated';

const LINE = '你查阅的内容不会因为你的查阅行为而改变。';
/**
 * 同一条通知被下发三次（02 §3.2 要的是"正文三遍重复"）。
 *
 * 曾经三句无分隔连排成一段——两路实测读者都把它当成渲染故障
 * （"像卡带""像打印坏了"），而本作最贵的失败模式正是玩家把异常当成故障
 * （`04 §五`）。拆成三条同编号、同正文的独立条目之后，重复落在**文书结构**上：
 * 读者看到的是"同一份通知出现了三次"（世界层面的异常），
 * 而不是"一句话被打印了三遍"（工艺层面的失误）。
 */
const COPIES = 3;

/**
 * 站内通知：不是弹窗，是首页通知栏里的一条列表项。
 * 第二次会话开始时才出现，出现之后一直在。
 *
 * 这里是全站少数允许 hydration 门控的位置之一：它投不投本身就是会话级事实，
 * 不存在"该显示哪一版文字"的判定，因此不涉及接手期的文本替换。
 */
export function SiteNotice() {
  const hydrated = useHydrated();
  if (!hydrated || !hasReturnedBefore()) return null;

  return (
    <section className="panel">
      <h2 className="panel-h flex items-center gap-2">
        <span aria-hidden className="h-3.5 w-1 rounded-full bg-accent" />
        站内通知
      </h2>
      <ul className="divide-y divide-line">
        {Array.from({ length: COPIES }, (_, i) => (
          <li key={i} className="flex gap-4 px-4 py-3 text-[14px] leading-6">
            <span className="shrink-0 text-gray-400">TZ-0117</span>
            <p className="min-w-0 text-gray-700">
              <span className="text-ink">关于条目内容一致性的说明：</span>
              {LINE}
            </p>
          </li>
        ))}
      </ul>
      {/* 落款是全节共用的：三条是同一次下发的三份，发布者只有一个。 */}
      <p className="border-t border-line px-4 py-2 text-[13px] leading-5 text-gray-400">
        内容审核组发布，不设答复时限。
      </p>
    </section>
  );
}
