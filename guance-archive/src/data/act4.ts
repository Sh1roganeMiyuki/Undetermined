import type { WikiEntry } from '@/types';

/* ------------------------------------------------------------------ *
 * 第四幕（对抗）· 尾声组。按批次加入，当前四件。
 *
 * - 《复核底稿补遗》：许衡的私档。他的气质是“不解释，只留痕”——
 *   底稿不归档（复核记录不设答复时限），这份补遗由他于 12 月单独提交。
 *   五条补注逐条扣回他经手过的事（字形断口、屏白、三人失联、时间戳前移、须知附则）。
 *   投放：读过《新编辑须知》增补里的附则块——读到“不得代为签收”，再读到它没有被谁拦下。
 * - 《档案调阅登记（摘录）》：调阅侧；尾两行动态行由 RegisterEntry 接手后填充（meta 一击）。
 * - 《观测配置申请表》：双窗玩法的降级版（02 §3.5）——两份申请、先后提交、
 *   不可撤回；回执各带一条未申请的第三条处理意见。投放要求两边立场都读过。
 * - 《文稿入档登记（节选）》：入档侧，许衡卷的直接下一页——十份未署名文稿的
 *   登记行；备注栏唯一一处被划掉的两个字。来源与作者身份永不解释。
 * ------------------------------------------------------------------ */

export const xuhengBuyi: WikiEntry = {
  slug: 'note-xuheng-buyi',
  title: '复核底稿补遗',
  category: 'record',
  reveal: { afterSeen: ['new-editor-guide-rev8-note'] },
  blocks: [
    {
      id: 'note-xuheng-buyi-intro',
      type: 'paragraph',
      text: '以下为许衡复核底稿的补遗部分。底稿不归档（复核记录不设答复时限）；此份由本人于 12 月 26 日单独提交，随卷保存。',
    },
    {
      id: 'note-xuheng-buyi-1',
      type: 'paragraph',
      text: '10.24　导向牌字形断口。补注：字两次都在同一个地方。那两帧我各存了一份，不在站里。',
    },
    {
      id: 'note-xuheng-buyi-2',
      type: 'paragraph',
      text: '11.29　2 号屏屏白。补注：事后我把屏的曲线翻了一遍。异常前，亮度有一下轻微的抬升，幅度小到不像故障。我没有把它写进报告——不是不敢，是报告里没有这一栏。',
    },
    {
      id: 'note-xuheng-buyi-3',
      type: 'paragraph',
      text: '12.07　三人失联。补注：复核意见是我出的。出完，我在底稿上补了半句：建议不再复核。第二天划掉了。划痕在。',
    },
    {
      id: 'note-xuheng-buyi-4',
      type: 'paragraph',
      text: '时间戳前移那条。补注：不删的理由登记过了，不重复。补一条没登记的：那个时间点到了之后，我盯着那一页看了四分钟。覆盖发生了。过程很平静，像一次正常保存。',
    },
    {
      id: 'note-xuheng-buyi-5',
      type: 'paragraph',
      text: '《新编辑须知》附则。补注：那行字，出处我核过——不在任何一版底稿里。按权限，我可以处理它。我没有处理。理由：来路不明的东西里，就这一句对读的人没有坏处。',
    },
    {
      id: 'note-xuheng-buyi-tail',
      type: 'paragraph',
      text: '（补遗到此。底稿仍由本人保存。）',
    },
  ],
  history: [{ at: '2024-12-26T09:00:00+08:00', by: '许衡', note: '单独提交补遗' }],
  related: ['person-xuheng', 'new-editor-guide'],
};

export const manuscriptLedger: WikiEntry = {
  slug: 'manuscript-ledger',
  title: '文稿入档登记（节选）',
  category: 'record',
  // 投放：读过《复核底稿补遗》结尾后——许衡卷的下一页：文稿从哪来、怎么进档。
  // 十行“未署名”；备注栏唯一一处被划掉的两个字。来源与作者身份永不解释。
  reveal: { afterSeen: ['note-xuheng-buyi-tail'] },
  blocks: [
    {
      id: 'manuscript-ledger-intro',
      type: 'paragraph',
      text: '以下节选自内容审核组文稿入档登记簿，自 2025 年 1 月起。每行照原簿抄录。',
    },
    {
      id: 'manuscript-ledger-1',
      type: 'paragraph',
      text: '2025.01.06　收到文稿一份，未署名，九页。编号 WG-01。备注：（未填）',
    },
    {
      id: 'manuscript-ledger-2',
      type: 'paragraph',
      text: '2025.01.13　收到文稿一份，未署名，十七页。编号 WG-02。备注：（未填）',
    },
    {
      id: 'manuscript-ledger-3',
      type: 'paragraph',
      text: '2025.01.20　收到文稿一份，未署名，八页。编号 WG-03。备注：（未填）',
    },
    {
      id: 'manuscript-ledger-4',
      type: 'paragraph',
      text: '2025.01.20　收到文稿一份，未署名，十一页。编号 WG-04。备注：（未填）',
    },
    {
      id: 'manuscript-ledger-5',
      type: 'paragraph',
      text: '2025.02.03　收到文稿一份，未署名，二十一页。编号 WG-05。备注：（未填）',
    },
    {
      id: 'manuscript-ledger-6',
      type: 'paragraph',
      text: '2025.02.17　收到文稿一份，未署名，十六页。编号 WG-06。备注：（未填）',
    },
    {
      id: 'manuscript-ledger-7',
      type: 'paragraph',
      text: '2025.03.03　收到文稿一份，未署名，十六页。编号 WG-07。备注：（未填）',
    },
    {
      id: 'manuscript-ledger-8',
      type: 'paragraph',
      text: '2025.03.17　收到文稿一份，未署名，十七页。编号 WG-08。备注：（未填）',
    },
    {
      id: 'manuscript-ledger-9',
      type: 'paragraph',
      text: '2025.03.24　收到文稿一份，未署名，十二页。编号 WG-09。备注：（原有两字，被横线划去。首字可辨：“阅”。）',
    },
    {
      id: 'manuscript-ledger-10',
      type: 'paragraph',
      text: '2025.03.31　收到文稿一份，未署名，十二页。编号 WG-10。备注：（未填）',
    },
    {
      id: 'manuscript-ledger-tail',
      type: 'paragraph',
      text: '（摘录到此。登记簿其余页次从略。）',
    },
  ],
  history: [{ at: '2025-04-08T10:00:00+08:00', by: '内容审核组', note: '整理影印入卷' }],
  related: ['note-xuheng-buyi', 'person-xuheng'],
};

export const accessRegister: WikiEntry = {
  slug: 'access-register',
  title: '档案调阅登记（摘录）',
  category: 'record',
  // Meta 一击（章 4 收官，05 §7.2）：读过《见证人确认函》的核对清册之后，
  // 登记簿出现——里面有一行 2024.11.03 的调阅记录，编号是读者本人。
  // 三行动态行由 RegisterEntry 在接手后填充：{id} / {day} / {seal}。
  // 函件回执行是签收的收据：签了留代签足迹，不点留“（未填）”——
  // 函的“无需回执”对不点者成立，对动过手的人失效。
  // 不解释、不加注：它就是一本枯燥的登记簿，恐怖在于它觉得这很平常。
  reveal: { afterSeen: ['witness-receipt-ledger'] },
  blocks: [
    {
      id: 'access-register-intro',
      type: 'paragraph',
      text: '以下为档案调阅登记的摘录。本站材料按调阅记录管理；摘录按原簿顺序抄录，未做整理。',
    },
    {
      id: 'access-register-line-1028',
      type: 'paragraph',
      text: '2024.10.28　值班室　调阅：《10·24 相关材料汇编》初编稿　事由：装订核对',
    },
    {
      id: 'access-register-line-1103',
      type: 'register',
      // 编号留存一处（02 §3.6）：清档之后全站的读者编号归零，
      // 只有这一行继续写着清档前的旧编号。簿子不承认有人清过档。
      retainsId: true,
      text: '2024.11.03　{id}　调阅：《10·24 相关材料汇编》　事由：（略）',
    },
    {
      id: 'access-register-line-1107',
      type: 'paragraph',
      text: '2024.11.07　陆先生　调阅：观察用表（空白）　事由：领用',
    },
    {
      id: 'access-register-line-1121',
      type: 'paragraph',
      text: '2024.11.21　内容审核组　调阅：白昼馆在馆人员登记　事由：例行',
    },
    {
      id: 'access-register-line-1202',
      type: 'paragraph',
      text: '2024.12.02　（编号未载）　调阅：《11·29 电子屏异常》底稿　事由：（略）',
    },
    {
      id: 'access-register-line-1215',
      type: 'paragraph',
      text: '2024.12.15　综合管理平台　调阅：同城榜全部期次　事由：口径执行',
    },
    {
      id: 'access-register-line-seal',
      type: 'register',
      text: '{day}　{id}　函件：见证人确认函　回执：{seal}',
    },
    {
      id: 'access-register-line-current',
      type: 'register',
      text: '{day}　{id}　调阅：本登记簿　事由：（略）',
    },
    {
      id: 'access-register-tail',
      type: 'paragraph',
      text: '（摘录到此。原簿不对外提供。）',
    },
  ],
  history: [{ at: '2024-12-20T09:00:00+08:00', by: '值班室', note: '摘录抄录' }],
  related: ['witness-receipt', 'case-qx-2410'],
};

export const applicationForms: WikiEntry = {
  slug: 'application-forms',
  title: '观测配置申请表',
  category: 'record',
  // 两边立场（唐继的立场句、许衡的附则补注）都读过之后，表格开放。
  reveal: { afterSeenAll: ['person-tangji-rev1-4', 'note-xuheng-buyi-5'] },
  blocks: [
    {
      id: 'application-forms-intro',
      type: 'paragraph',
      text: '本表用于观测配置的申请与调整。提交后由平台受理并返回回执，回执随卷归档。',
    },
    { id: 'application-forms-form', type: 'application' },
    {
      id: 'application-forms-tail',
      type: 'paragraph',
      text: '受理不代表批准，提交不代表立场。',
    },
  ],
  history: [{ at: '2024-12-27T10:00:00+08:00', by: '综合管理平台', note: '表样开放' }],
  related: ['person-tangji', 'person-xuheng'],
};

/* ----------------------------- 申请表数据（组件用） ----------------------------- */

export interface ApplicationEntryData {
  key: string;
  title: string;
  body: string;
  /** 立场引用：理由不是玩家填的，是两条路线各自摆好的 */
  rationale: string;
  /** 回执第二项（第一项固定为受理；第三项是两卡共用的未申请项） */
  receiptItem: string;
}

export const APPLICATION_FORM = {
  entries: [
    {
      key: 'full',
      title: '全精度恢复',
      body: '申请恢复北环路沿线全精度观测配置。',
      rationale: '“我宁愿在过载中维持稳定，也不愿在黑暗中失去人。”',
      receiptItem: '按全精度方案进入评估。',
    },
    {
      key: 'reduced',
      title: '降级维持',
      body: '申请维持现行降级观测配置。',
      rationale: '“你我手上做的事，一半在修，一半在拆。”',
      receiptItem: '备案归档，维持现行配置。',
    },
  ] as ApplicationEntryData[],
  /** 第三项处理意见：两份回执共有——它不是被申请出来的。 */
  ghost: '维持现状。本项无需申请——由现行观测自动执行。',
};

export const ACT4_ENTRIES: WikiEntry[] = [xuhengBuyi, manuscriptLedger, accessRegister, applicationForms];