import type { WikiEntry } from '@/types';

/* ------------------------------------------------------------------ *
 * 章 5 · 冷库：尾声组（第二批）。
 *
 * 三件，把全篇的深线收拢到一处：
 * - 《人员状态摘录》：EX-07 的实体——原件仅一栏：“状态：未定稿。”
 *   本章最硬的一行。站内不解释这个词（04 纪律：名词只该被撞见）。
 * - 《交接单（内容审核组）》：程露的最后交接——她的三条未了事项
 *   （北环路 / 白昼馆 508 / 冷库调阅申请）在此合流；接收人栏是空的。
 * - 《处理方案》：幕五的最终选择界面（ABCD ＋缺席后出现的 D ＋签名栏）。
 *   选择不可在站内修改；签名栏可以被签，也可以一直空着。
 *
 * 纪律：不解释“未定稿”，不解释任何选项的“正确答案”（没有正确答案）。
 * ------------------------------------------------------------------ */

export const personStatus: WikiEntry = {
  slug: 'record-person-status',
  title: '人员状态摘录',
  category: 'record',
  // 读过冷库《关于何某有关情况的说明》之后，本页可检索。
  reveal: { afterSeen: ['coldstore-explain-end'] },
  blocks: [
    {
      id: 'record-person-status-head',
      type: 'paragraph',
      text: '本页为权限封存件的收录。原件仅一栏。',
    },
    {
      id: 'record-person-status-body',
      type: 'paragraph',
      text: '姓名：何某。状态：未定稿。',
    },
    {
      id: 'record-person-status-note',
      type: 'paragraph',
      text: '（原件无落款、无日期、无经办人。收录时未作删改。）',
    },
  ],
  history: [
    { at: '2025-01-10T09:00:00+08:00', by: '记录室', note: '依申请收录' },
  ],
  related: ['record-coldstore-explain', 'coldstore'],
};

export const chengluHandover: WikiEntry = {
  slug: 'chenglu-handover',
  title: '交接单（内容审核组）',
  category: 'record',
  // 她的两条线合流之后（白昼馆手记断页 + 冷库链读过），本件可检索。
  reveal: { afterSeenAll: ['note-chenglu-break', 'coldstore-explain-end'] },
  blocks: [
    {
      id: 'chenglu-handover-head',
      type: 'paragraph',
      text: '本页为交接单扫描件（个人留存联）。移交人：程露。岗位变动，另有任用。',
    },
    { id: 'chenglu-handover-h-items', type: 'heading', text: '移交物品' },
    {
      id: 'chenglu-handover-items',
      type: 'list',
      items: [
        '复核记录、复核底稿共四册（2021—2024）。',
        '北环路地下通道条目复核件一件（2024-12-02）。',
        '白昼馆材料一组（询问记录三份、巡楼记录、监控摘要；2024-11 至 12 月）。',
        '冷库卷宗调阅申请及答复一件（未获批准）。',
      ],
    },
    { id: 'chenglu-handover-h-open', type: 'heading', text: '未了事项' },
    {
      id: 'chenglu-handover-open',
      type: 'list',
      items: [
        '一、北环路：按季度复核，未见变化。',
        '二、白昼馆 508 房：状态无变更。房间物品保持原地。',
        '三、冷库：调阅申请未获批准。建议后续接手人重新申请。',
      ],
    },
    {
      id: 'chenglu-handover-sign',
      type: 'paragraph',
      text: '移交人：程露（已签）　接收人：',
    },
    {
      id: 'chenglu-handover-note',
      type: 'paragraph',
      text: '（本联无接收人签收。存档时归入待办。此后未再更新。）',
    },
  ],
  history: [
    { at: '2025-02-08T16:20:00+08:00', by: '内容审核组', note: '扫描留存' },
  ],
  related: ['note-chenglu', 'record-person-status'],
};

export const finalPlan: WikiEntry = {
  slug: 'final-plan',
  title: '处理方案',
  category: 'record',
  reveal: {
    afterSeenAll: [
      'chenglu-handover-open',
      'record-person-status-body',
      'chronicle-08-p54',
    ],
  },
  blocks: [
    {
      id: 'final-plan-intro',
      type: 'paragraph',
      text: '本页为放置于待决卷宗之首的处理方案。方案共四项；其中第四项为未申请项，是否出现视情形而定。本页可签署；签署与否，方案均照常试行。',
    },
    { id: 'final-plan-choice', type: 'final-choice' },
    {
      id: 'final-plan-note',
      type: 'paragraph',
      text: '（本页由系统生成。选择一经登记，本站不再提供修改入口。）',
    },
  ],
  history: [
    { at: '2025-02-20T10:00:00+08:00', by: '系统', note: '生成' },
  ],
  related: ['chenglu-handover', 'record-person-status'],
};

/* ----------------------------- 四选项数据（组件用） ----------------------------- */

export interface PlanOptionData {
  key: string;
  /** 选项标题 */
  title: string;
  /** 提案理由（转述立场，不署名） */
  reason: string;
  /** 登记后的结果文本 */
  result: string[];
  /** 隐藏项：在长期缺席后出现 */
  hidden?: boolean;
}

export const FINAL_PLAN = {
  options: [
    {
      key: 'A',
      title: '恢复全精度观测',
      reason: '不能在黑暗中失去人。',
      result: [
        '方案已登记。评估自本周开始。',
        '在全面恢复运行之前，本区域将先经历一小段稳定期。一切都会显得很正常，好得不像真的。请照常生活。',
      ],
    },
    {
      key: 'B',
      title: '全面降级观测',
      reason: '没有人在看，就没有事发生。这可能也是真的。',
      result: [
        '方案已登记。系统将逐步回到最低运行态。',
        '此后：一切顺畅，一切干净。什么都不会再发生。包括不该发生的，和该发生的。',
      ],
    },
    {
      key: 'C',
      title: '选择性观测',
      reason: '肩挑一半，剩下的留白。',
      result: [
        '方案已登记。本方案不指定执行者；档案执行人栏保持空白。',
        '（若愿意，可在本页下方签署。）',
      ],
    },
    {
      key: 'D',
      title: '接受不确定性',
      reason: '未申请项。',
      result: ['方案已登记。', '（此后无后续记录。）'],
      hidden: true,
    },
  ] as PlanOptionData[],
  /** 缺席说明：D 出现时页首附加的一行 */
  absentNote: '您离开了一段时间。在这段时间里，没有任何一页因此变得更好或更坏。',
  /** 已登记后页脚 */
  locked: '本页已归档。此决定不可在本站修改。',
  /** 签名区文案 */
  signIntro: '本页可签署。签署即表示：自签署之日起，本人承担持续观测。',
  signed: '已记录。观测者：',
  signedTail: '　自今日起。',
  signHint: '（如无法长期执行，请勿签署。）',
};

export const HANDOVER_ENTRIES: WikiEntry[] = [personStatus, chengluHandover, finalPlan];