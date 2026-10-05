'use client';

/**
 * 拦截通知：全站唯一一次弹层。
 *
 * 额度只有一次（见 04 §11.4 的登记）：
 * - 出现前提：《实施现场纪要》的截断块被真正看过；
 * - 它只有一句话——"你的观测已被拦截。"——没有标题、没有图标、
 *   没有第二条说明。公文的形态（回执）留给下一次到访的页面承担；
 * - 无动画、无音效、不可拖动。点"关闭"后，本次到访保持截断现场，
 *   处置的回执在下次到访时生效。
 *
 * 配色：深底下遮罩必须够重（black/60），否则弹层与背后页面连成一片，
 * “全站唯一一次被打断”这件事就没了重量。仍不加动画、不加图标。
 */
export function InterceptNotice({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    >
      <div className="border border-line bg-surface px-8 py-6 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
        <p className="text-[15px] leading-7 text-ink">你的观测已被拦截。</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 rounded border border-line px-3 py-1 text-[13px] text-gray-700 hover:border-link hover:text-link"
        >
          关闭
        </button>
      </div>
    </div>
  );
}