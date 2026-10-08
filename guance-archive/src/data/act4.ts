import type { WikiEntry } from '@/types';

/* ------------------------------------------------------------------ *
 * 第四幕（对抗）· 尾声组。按批次加入，当前五件。
 *
 * - 《复核底稿补遗》：许衡的私档。他的气质是“不解释，只留痕”——
 *   底稿不归档（复核记录不设答复时限），这份补遗由他于 12 月单独提交。
 *   五条补注逐条扣回他经手过的事（字形断口、屏白、三人失联、时间戳前移、须知附则）。
 *   投放：读过《新编辑须知》增补里的附则块——读到“不得代为签收”，再读到它没有被谁拦下。
 * - 《登记簿备注栏（摘录）》：档案层批次（2026-10-07）——回收 07 §7.2 三颗种子。
 *   补遗写“事”，本件写“他的登记动作”；两者互不重复、互不引用。
 *   门挂在补遗的须知附则补注上（note-xuheng-buyi-5）：先见第 8 条，再见“留了号”。
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

/* ------------------------------------------------------------------ *
 * 《登记簿备注栏（摘录）》——档案层批次（2026-10-07）：回收 07 §7.2 三颗种子。
 *
 * 备注栏是登记簿里唯一由经办人自填、不设格式的一栏，所以它能容纳“报一下”
 * 这种句子——他连自己加的一个称呼都报备（07 §5.2：全站最像作者的人）。
 * 三颗种子各归其位，且逐条可与在档事实核对：
 * - 11.02「第八条留了号，没写。」↔ entries.ts：须知临时版由许衡 11-02 10:06 发布、
 *   正文自称“以下七条”；12 月增补由系统直接写入第 8 条（07 §6.1 已成环钩子）。
 * - 12.11「四件材料互不引用，依例。」↔ records.ts 四份 12·07 记录（现场／设备／
 *   值班／家属；转写稿为第五件，不计入）——给“互不引用”一个制度来源：
 *   依例，不是共谋。
 * - 11.05「‘先生’是我加的」↔ annals：来信落款“一名观众”、正文“寄信人姓陆”，
 *   而汇编标题与调阅登记 1107 行都写“陆先生”。
 *
 * 纪律：不解释第 8 条从哪来（留号≠知情），不解释他为何加称呼；两句都登记不合并
 * （10.25 行）是他的方法，不是对导向牌钩子的解释。
 * 门挂在补遗的须知附则补注上：读者先见第 8 条、再见“留了号”，顺序不得反。
 * ------------------------------------------------------------------ */
const ledgerRemarks: WikiEntry = {
  slug: 'record-ledger-remarks',
  title: '登记簿备注栏（摘录）',
  category: 'record',
  unlisted: true,
  reveal: { afterSeen: ['note-xuheng-buyi-5'] },
  blocks: [
    {
      id: 'record-ledger-remarks-intro',
      type: 'paragraph',
      text: '以下为内容审核组登记簿备注栏的摘录，按登记时间排列。登记簿按卷归档；备注栏由经办人自填，不设格式，收录时未作删改。',
    },
    {
      id: 'record-ledger-remarks-table',
      type: 'table',
      rows: [
        ['日期', '事项', '备注'],
        [
          '10.24',
          '观众来电两件（屏、导向牌）',
          '来电人只说“姓贾”，未留全名。入簿按原话写作“姓贾的来电人”，未加称呼。',
        ],
        [
          '10.25',
          '养护中心回执（导向牌）',
          '回执写运输磕碰所致、已更换；工作单备注栏另有“报废牌面留存备查”一行。两句都登记，不合并。',
        ],
        ['11.02', '《新编辑须知（临时版）》发布', '七条。第八条留了号，没写。'],
        [
          '11.05',
          '观众来信一件（附手写观察表）',
          '来信落款“一名观众”，正文自称姓陆。汇编标题里的“先生”是我加的，报一下。',
        ],
        [
          '11.19',
          '条目状态改为“临时版”',
          '不设复核人。按细则，复核记录不设答复时限，故无逾期一项。',
        ],
        [
          '12.11',
          '12·07 材料四件（现场记录／设备日志／值班报告／家属陈述）',
          '四件材料互不引用，依例。',
        ],
        ['12.20', '调阅登记摘录件', '摘录与原簿同页序。原簿不外借。'],
      ],
    },
    {
      id: 'record-ledger-remarks-note',
      type: 'paragraph',
      text: '（备注栏不进入正式卷宗，仅供经办人自查。本件按原样抄录，未作整理。）',
    },
    {
      id: 'record-ledger-remarks-tail',
      type: 'paragraph',
      text: '（摘录到此。其后页次按月归卷。）',
    },
  ],
  history: [{ at: '2025-01-28T15:00:00+08:00', by: '记录室', note: '摘录收录' }],
  related: ['person-xuheng', 'note-xuheng-buyi'],
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
  // 终局 meta 登记点（07 §2.4 / 04 §11.4 封顶清单之末）：
  // 登记最终选择之后，这本簿子多出一行——编号栏是读者本人，动词是“交”，
  // 日期早于读者到来（与 EX-05 同族：对照物的时间戳本来就该早于第一个痕迹）。
  // 两种读法同时成立且都不被确认：你是第十一份文稿的交稿人，
  // 或者这本簿子连“谁交了什么”都不再可靠。
  // 它不是系统说话，是 paperwork 把你归档进去；无宣告、无第二人称。
  revisions: [
    {
      title: '2025 年 4 月补录',
      reveal: { afterChoice: true },
      blocks: [
        {
          id: 'manuscript-ledger-rev1-line11',
          type: 'register',
          text: '2025.04.07　{id}　交：别卷原稿（四册，未署）。编号 WG-11。备注：（未填）',
        },
      ],
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

export const ACT4_ENTRIES: WikiEntry[] = [xuhengBuyi, ledgerRemarks, manuscriptLedger, accessRegister, applicationForms];