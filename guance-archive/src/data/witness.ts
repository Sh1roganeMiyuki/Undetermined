import type { WikiEntry } from '@/types';

/**
 * 《见证人确认函》—— 第四幕（对抗）的核心件。
 *
 * 系统把读者的全部交互行为整理成一份正式文档，声称他已是"见证人"。
 * 两个显式选项（确认 / 更正）都会完成代签——更正也是主动动作，
 * 动了手就承认了函在管你。真正的第三条路不在本页：
 * 是《新编辑须知》12 月增补里那行"未主动确认的内容，系统不得代为签收"，
 * 以及照做——什么都不点。什么都不点的结果不需要记录点击：
 * 缺一个签收记录本身就是全部证据（见 resolve/receipt 的三态）。
 *
 * 投放：读过须知增补的台账块之后——先被"通知"，再被"办手续"。
 * 函件本身无人格、不催促：尾注写的是"无需回执"，一个陷阱式的宽慰。
 */
export const witnessReceipt: WikiEntry = {
  slug: 'witness-receipt',
  title: '见证人确认函',
  category: 'record',
  reveal: { afterSeen: ['new-editor-guide-rev8-ledger'] },
  blocks: [
    {
      id: 'witness-receipt-intro',
      type: 'paragraph',
      text: '本函由系统自动生成，用于核对与你有关的事实记录。',
    },
    {
      id: 'witness-receipt-ledger',
      type: 'ledger',
      ledgerVariant: 'receipt',
      text: '经整理，与你有关的客观记录如下：',
    },
    {
      id: 'witness-receipt-body',
      type: 'paragraph',
      text: '上述记录已构成见证关系。你已被登记为本站见证人。',
    },
    {
      id: 'witness-receipt-correct',
      type: 'paragraph',
      text: '如对记录有异议，可在文末提交更正。更正不改变见证关系，仅并入底档。',
    },
    { id: 'witness-receipt-seal', type: 'receipt-seal' },
    {
      id: 'witness-receipt-tail',
      type: 'paragraph',
      text: '本函自送达之日起有效，无需回执。',
    },
  ],
  history: [
    { at: '2024-12-24T09:00:00+08:00', by: '系统', note: '自动生成并送达' },
  ],
  related: ['new-editor-guide', 'event-1207'],
};

export const WITNESS_ENTRIES: WikiEntry[] = [witnessReceipt];