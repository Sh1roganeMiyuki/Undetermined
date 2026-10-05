'use client';

import { hasReturnedBefore } from '@/lib/traceStore';
import { useHydrated } from '@/lib/useHydrated';

const LINE = '你查阅的内容不会因为你的查阅行为而改变。';

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
        <li className="flex gap-4 px-4 py-3 text-[14px] leading-6">
          <span className="shrink-0 text-gray-400">TZ-0117</span>
          <p className="min-w-0 text-gray-700">
            <span className="text-ink">关于条目内容一致性的说明：</span>
            {LINE}
            {LINE}
            {LINE}
            <span className="mt-1 block text-[13px] text-gray-400">
              内容审核组发布，不设答复时限。
            </span>
          </p>
        </li>
      </ul>
    </section>
  );
}
