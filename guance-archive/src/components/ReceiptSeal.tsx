'use client';

import { clock } from '@/lib/format';
import { receiptState } from '@/lib/resolve/receipt';
import { useTrace } from '@/lib/traceStore';
import { useHydrated } from '@/lib/useHydrated';

/**
 * 签收交互区（《见证人确认函》文末）。
 *
 * 三条路：
 * - 确认 / 更正：都完成代签（更正也是主动动作），回执立即出现，不可撤销；
 * - 不点：不需要任何记录——缺一个签收记录本身就是全部证据。
 *   过了送达当日，函自行落成"未生效"，按细则系统不得代签。
 *
 * 纪律与帧重建区一致：接手前这一段不存在。回访的玩家（已签 / 已过期）
 * 进来直接看到结果，不会先瞥见两个按钮再被换掉。
 */
export function ReceiptSeal({ slug }: { slug: string }) {
  const hydrated = useHydrated();
  const receipt = useTrace((s) => s.receipt);
  const firstAt = useTrace((s) => s.visits[slug]?.firstAt);

  if (!hydrated) return null;

  const state = receiptState({ sealed: Boolean(receipt), firstAt });

  if (state === 'sealed' && receipt) {
    return (
      <div className="my-4 border border-line bg-soft px-4 py-3 text-[14px] leading-7 text-gray-700">
        {receipt.kind === 'confirm' ? (
          <p>已收到你的确认（{clock(receipt.at)}）。本函已归档。</p>
        ) : (
          <p>已收到你的更正（{clock(receipt.at)}）。更正已并入底档，见证关系不变。本函已归档。</p>
        )}
      </div>
    );
  }

  if (state === 'expired') {
    return (
      <div className="my-4 border border-line bg-soft px-4 py-3 text-[14px] leading-7 text-gray-700">
        <p>本函未生效。</p>
        <p>你未作确认。按细则，未主动确认的内容，系统不得代为签收。</p>
      </div>
    );
  }

  return (
    <div className="my-4 border border-line bg-soft px-4 py-3">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => useTrace.getState().sealReceipt('confirm')}
          className="rounded border border-line px-3 py-1 text-[13px] text-gray-700 hover:border-link hover:text-link"
        >
          确认
        </button>
        <button
          type="button"
          onClick={() => useTrace.getState().sealReceipt('correct')}
          className="rounded border border-line px-3 py-1 text-[13px] text-gray-700 hover:border-link hover:text-link"
        >
          更正
        </button>
      </div>
    </div>
  );
}