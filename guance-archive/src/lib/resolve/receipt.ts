import { localDay } from '@/lib/traceStore';

/**
 * 见证人确认函的三态：
 * - `sealed`：已签（确认与更正都完成代签，不可撤销）；
 * - `expired`：未签且已隔日——"未主动确认"的判定不需要记录点击，缺一个签收记录
 *   本身就是全部证据。首次到访当日的本地自然日已过，函即未生效；
 * - `open`：未签且仍在送达当日，可签。
 *
 * 判定只看两个量：签收记录、函页首次到访的时刻。
 * now 可注入，测试不依赖真实时钟。
 */
export type ReceiptState = 'sealed' | 'expired' | 'open';

export function receiptState(input: {
  sealed: boolean;
  firstAt?: number;
  now?: number;
}): ReceiptState {
  if (input.sealed) return 'sealed';
  if (input.firstAt === undefined) return 'open';
  const now = input.now ?? Date.now();
  return localDay(new Date(input.firstAt)) === localDay(new Date(now)) ? 'open' : 'expired';
}

/**
 * 函件回执行的动态文案：签了写代签结果，没签写“（未填）”。
 * “不点”（第三条路）的收据正在于此——系统没有替任何人填过这一栏；
 * 函尾的“无需回执”对不点者成立，对动过手的人失效。
 */
export function sealText(receipt: { kind: 'confirm' | 'correct' } | null): string {
  if (!receipt) return '（未填）';
  return receipt.kind === 'confirm' ? '已确认（代签）' : '已更正（代签）';
}

/**
 * 申请的提交顺序：按提交时刻升序返回 kind 列表。
 * 回执编号（-01 / -02）由它决定——先提交的排在前面，只提交一份时它就是 -01。
 * 两次申请可先后提交、不可撤回；顺序本身就是一份真实记录。
 */
export function applicationOrder(apps: Record<string, number>): string[] {
  return Object.entries(apps)
    .sort((a, b) => a[1] - b[1])
    .map(([kind]) => kind);
}