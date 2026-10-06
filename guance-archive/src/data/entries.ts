import type { ContentBlock, RevealRule, WikiEntry } from '@/types';
import { CASE1207_ENTRIES } from '@/data/case1207';
import { ANNALS_ENTRIES } from '@/data/annals';
import { CHAPTER1_ENTRIES } from '@/data/chapter1';
import { DAYLIGHT_ENTRIES } from '@/data/daylight';
import { OVERLOAD_ENTRIES } from '@/data/overload';
import { WITNESS_ENTRIES } from '@/data/witness';
import { ACT4_ENTRIES } from '@/data/act4';
import { QINGLAN_ENTRIES } from '@/data/qinglan';
import { COLDSTORE_ENTRIES } from '@/data/coldstore';
import { HANDOVER_ENTRIES } from '@/data/handover';
import { B1_ENTRIES } from '@/data/b1';
import { RECORD_ENTRIES } from '@/data/records';
import { PERSON_ENTRIES } from '@/data/people';
import { talkPostText } from '@/data/talk';
import { storyBlockText } from '@/data/stories';
import { chronicleBlockText } from '@/data/chronicle';
import { hotBlockText } from '@/data/hot';
import { newsBlockText } from '@/data/news';
import { govBlockText } from '@/data/gov';
import { netRecordText } from '@/data/net';

/* ------------------------------------------------------------------ *
 * 词条数据。站内全部文本共享一个前提：它是这个虚构 Wiki 自己的资料。
 * 变体按轮次显式声明（{ round, text }[]），不取模、不随机、不按标识分桶。
 * ------------------------------------------------------------------ */

const newEditorGuide: WikiEntry = {
  slug: 'new-editor-guide',
  title: '新编辑须知（临时版）',
  category: 'protocol',
  blocks: [
    {
      id: 'new-editor-guide-account',
      type: 'paragraph',
      text: '你的账号已激活。初始权限：内容复核员（试用）。',
    },
    {
      id: 'new-editor-guide-scope',
      type: 'paragraph',
      // 检索口径：未列入目录的文书（如几份互不印证的记录）只能经检索抵达，
      // 而玩家无从得知"该去搜"——这一行是站内行政口径，不是游戏提示：
      // 不指任何具体文书、不提示数量，与 404 页既有口径同一句式。
      text: '未列入目录的文书不参与站内浏览；如需调阅，请以题名或关键词经站内检索获取。检索范围为本站全部已登记文书。',
    },
    {
      id: 'new-editor-guide-intro',
      type: 'paragraph',
      text: '以下七条由内容审核组发布，为临时版，不设复核人，不设答复时限。阅读后不需回执。',
    },
    { id: 'new-editor-guide-h-rules', type: 'heading', text: '规则' },
    {
      id: 'new-editor-guide-r1',
      type: 'paragraph',
      text: '1. 如果你在阅读某个词条时感到页面变慢了，不要刷新。停下来，等一会儿，然后继续。',
    },
    {
      id: 'new-editor-guide-r2',
      type: 'paragraph',
      text: '2. 如果你同时打开了多个词条，请关掉最早打开的那个。不要看它最后一眼。',
    },
    {
      id: 'new-editor-guide-r3',
      type: 'paragraph',
      text: '3. 如果你发现两个词条提到了同一张照片，而照片内容不同，不要对比。关掉其中一个。',
    },
    {
      id: 'new-editor-guide-r4',
      type: 'paragraph',
      text: '4. 如果你看到某段文字“好像和上次不一样”，不要查编辑历史。它没有变。',
    },
    {
      id: 'new-editor-guide-r5',
      type: 'paragraph',
      text: '5. 搜索时，如果结果中出现两条同名、链接相同、内容不同的条目，不要点进任何一条。',
    },
    {
      id: 'new-editor-guide-r6',
      type: 'paragraph',
      text: '6. 如果你已经隔了一天再回到同一个页面，而那里的一切与你离开时相同——不要当成好事。',
    },
    {
      id: 'new-editor-guide-r7',
      type: 'paragraph',
      text: '7. 不要反复阅读同一条规则。',
    },
    {
      id: 'new-editor-guide-tail',
      type: 'paragraph',
      text: '',
      driftable: true,
      minRound: 2,
      // "变空"与"变稠"是同一条数据路径上的两个版本：规范版为空，第 3 个自然日起填一句站内文书。
      // 不携带数字——对照物的独占集合已把可用的短数字占满。
      variants: [{ round: 2, text: '——已核对' }],
    },
    {
      id: 'new-editor-guide-note',
      type: 'paragraph',
      text: '对本须知有疑问，请在词条讨论页提出。讨论页不设答复时限，也不保证有人阅读。',
    },
  ],
  history: [
    { at: '2024-11-02T10:06:00+08:00', by: '许衡', note: '发布临时版' },
    {
      at: '2024-11-19T16:42:00+08:00',
      by: '内容审核组',
      note: '条目状态改为“临时版”，不设复核人',
    },
  ],
  // 第四幕开场（系统主动推送）：读过白溢口径的“工作词”条目后，
  // 须知自己多出一条“8”——随后附读者本人的真实台账（由行为数据生成）。
  // “附”那行是签收单第三选项的钥匙：它随本增补先行送达，读到的人在收函时才知道“不点”有用。
  revisions: [
    {
      title: '2024 年 12 月增补',
      reveal: { afterSeen: ['record-baiyi-items'] },
      blocks: [
        {
          id: 'new-editor-guide-rev8-head',
          type: 'paragraph',
          text: '以下增补由系统直接写入，未经内容审核组。',
        },
        {
          id: 'new-editor-guide-rev8-r8',
          type: 'paragraph',
          text: '8. 不要反复阅读同一条规则。你已经读了很多遍了。',
        },
        {
          id: 'new-editor-guide-rev8-ledger',
          type: 'ledger',
          ledgerVariant: 'notice',
          text: '按存档核对，与你有关的阅读记录如下：',
        },
        {
          id: 'new-editor-guide-rev8-note',
          type: 'paragraph',
          text: '附：未主动确认的内容，系统不得代为签收。',
        },
      ],
    },
  ],
  related: ['north-loop-tunnel', 'event-1129'],
};

const northLoopTunnel: WikiEntry = {
  slug: 'north-loop-tunnel',
  title: '北环路地下通道',
  category: 'location',
  blocks: [
    {
      id: 'north-loop-tunnel-overview',
      type: 'paragraph',
      text: '北环路地下通道位于城北新区北环路下方，连接北环路与站前街，供行人与非机动车通行。通道全长 340 米，宽 6.4 米，净高 3.2 米，2019 年 6 月投入使用，产权归城北新区市政养护中心。',
    },
    { id: 'north-loop-tunnel-h-infra', type: 'heading', text: '基础设施' },
    {
      id: 'north-loop-tunnel-facilities',
      type: 'paragraph',
      text: '通道内设有照明灯具、排水泵房、电子广告屏（4 块）、导向标识系统和紧急呼叫装置。紧急呼叫装置每 80 米一组，直接接入市政养护中心值班室。',
    },
    {
      id: 'north-loop-tunnel-infra',
      type: 'paragraph',
      text: '监控点位共 16 个，信号接入城北新区综合管理平台。',
      driftable: true,
      // 16 → 14 → 13。绝不用 15：15 是复核文书的独占值，撞上它，"16 对 15"就没了。
      variants: [
        { round: 1, text: '监控点位共 14 个，信号接入城北新区综合管理平台。' },
        { round: 2, text: '监控点位共 13 个，信号接入城北新区综合管理平台。' },
      ],
    },
    { id: 'north-loop-tunnel-h-maint', type: 'heading', text: '运维' },
    {
      id: 'north-loop-tunnel-maint',
      type: 'paragraph',
      text: '每日清扫两次（06:00、22:00），由城北新区市政养护中心负责。照明灯具按季度巡检，排水泵房在汛期前完成一次全面检查。',
      driftable: true,
      variants: [
        {
          round: 1,
          text: '每日清扫两次（06:00、22:30），由城北新区市政养护中心负责。照明灯具按季度巡检，排水泵房在汛期前完成一次全面检查。',
        },
        {
          round: 2,
          text: '每日清扫两次（06:30、22:00），由城北新区市政养护中心负责。照明灯具按季度巡检，排水泵房在汛期前完成一次全面检查。',
        },
      ],
    },
    {
      id: 'north-loop-tunnel-note',
      type: 'paragraph',
      text: '通信方面，4G/5G 覆盖完整。Wi-Fi 热点“BEI-LOOP-FREE”可用，无需认证。',
      driftable: true,
      // 只声明 round 1：缺掉的字串不再加深。第 2、3 天沿用这一版缺字的样子。
      variants: [
        { round: 1, text: '通信方面，4G/5G 覆盖完整。Wi-Fi 热点可用，无需认证。' },
      ],
    },
    { id: 'north-loop-tunnel-h-access', type: 'heading', text: '通行信息' },
    {
      id: 'north-loop-tunnel-access',
      type: 'paragraph',
      text: '通道开放时间 05:30–23:30。关闭时段内导向标识系统保持供电，广告屏与监控点位断电。',
    },
    {
      id: 'north-loop-tunnel-record',
      type: 'paragraph',
      text: '2024 年 11 月 29 日，通道内 2 号电子广告屏出现一次显示异常，已单独归档。',
    },
    {
      id: 'north-loop-tunnel-maint-log',
      type: 'paragraph',
      // 层 1 痕迹：作业记录与巡检台账对不上（具体两表见《北环路通行与设备台账》）。
      text: '2024 年 12 月，北段照明进行过三次作业。作业记录与巡检台账的时间填报不一致，已另行说明。',
    },
    {
      id: 'north-loop-tunnel-patch',
      type: 'paragraph',
      // “修补”一词的第一次出现，与 12·07 对比页的照片、张工的手记三处联动。
      text: '通道北段第三组灯具下方的一段墙面于 2024 年 12 月做过修补。修补原因未登记。',
    },
  ],
  history: [
    {
      at: '2024-08-14T11:02:00+08:00',
      by: '市政养护中心',
      note: '录入基础设施与运维信息',
    },
    {
      at: '2024-11-30T08:47:00+08:00',
      by: '市政养护中心',
      note: '补充 11 月 29 日事件的归档链接',
      blockId: 'north-loop-tunnel-record',
    },
    {
      at: '2024-12-02T11:40:00+08:00',
      by: '程露',
      note: '复核',
      verifyHref: '/verify/north-loop-tunnel/',
      blockId: 'north-loop-tunnel-infra',
    },
    {
      at: '2024-12-10T16:22:00+08:00',
      by: '市政养护中心',
      note: '修订作业情况表述',
      blockId: 'north-loop-tunnel-maint-log',
      overwritten: true,
      // 对照物（04 §8）：这一句曾经是“已核对，与巡检台账一致”。
      // 旧版本可展开、不可主动刷新——查历史的人看到的正是它改过口。
      underlyingText: '2024 年 12 月，北段照明进行过三次作业。作业时间已核对，与巡检台账一致。',
    },
  ],
  related: ['event-1129', 'new-editor-guide'],
  refs: [
    {
      blockId: 'north-loop-tunnel-record',
      target: 'event-1129',
      text: '参见《11·29 电子屏异常》',
    },
    {
      blockId: 'north-loop-tunnel-maint-log',
      target: 'record-loop-log',
      text: '参见《北环路通行与设备台账》',
    },
  ],
};

const event1129: WikiEntry = {
  slug: 'event-1129',
  title: '11·29 电子屏异常',
  category: 'event',
  blocks: [
    { id: 'event-1129-h-course', type: 'heading', text: '事件经过' },
    {
      id: 'event-1129-summary',
      type: 'paragraph',
      text: '2024 年 11 月 29 日 03:17，北环路地下通道内 2 号电子广告屏出现一次显示异常，数秒后自行恢复。值班记录于 03:19 生成，编号 BX-1129-03。',
    },
    {
      id: 'event-1129-cam3',
      type: 'paragraph',
      text: '3 号摄像头捕捉到广告屏前方区域出现白色模糊影像，持续约 1.2 秒。2 号广告屏自身的运行日志未记录到该时段的帧丢失。',
      driftable: true,
      // 两步剥细节：先改时长，再掉"模糊"二字。第二步更像人在改稿，所以放后面。
      variants: [
        {
          round: 1,
          text: '3 号摄像头捕捉到广告屏前方区域出现白色模糊影像，持续约 1.7 秒。2 号广告屏自身的运行日志未记录到该时段的帧丢失。',
        },
        {
          round: 2,
          text: '3 号摄像头捕捉到广告屏前方区域出现白色影像，持续约 1.7 秒。2 号广告屏自身的运行日志未记录到该时段的帧丢失。',
        },
      ],
    },
    {
      id: 'event-1129-repair',
      type: 'paragraph',
      text: '03:22:15，维修人员张工到达现场。03:31 完成断电检查，03:46 恢复供电。现场未发现设备损伤。',
      driftable: true,
      // 只声明 round 1，第 3 天沿用这一版
      variants: [
        {
          round: 1,
          text: '03:26:15，维修人员张工到达现场。03:31 完成断电检查，03:46 恢复供电。现场未发现设备损伤。',
        },
      ],
    },
    { id: 'event-1129-h-review', type: 'heading', text: '系统复核' },
    {
      id: 'event-1129-review',
      type: 'paragraph',
      text: '复核结论：设备瞬时故障，无异常。本条已于 2024 年 12 月 1 日登记，登记后不再更新。',
      // 已登记的结论是化石：永不漂移
      driftable: false,
    },
    { id: 'event-1129-h-attach', type: 'heading', text: '附件' },
    {
      id: 'event-1129-attach',
      type: 'list',
      items: [
        '现场照片 3 张（2024-11-29 03:40 拍摄）',
        '2 号广告屏运行日志导出（缺 03:10–03:20 段）',
        '3 号摄像头视频片段（时长 40 秒）',
      ],
    },
    {
      id: 'event-1129-quote',
      type: 'quote',
      text: '值班记录 BX-1129-03 原文：“屏面出现整片白，像有人站在前面。回看时没有了。”',
    },
  ],
  history: [
    {
      at: '2024-11-29T08:05:00+08:00',
      by: '值班记录',
      note: '生成事件条目',
    },
    {
      at: '2024-12-01T09:14:00+08:00',
      by: '许衡',
      note: '添加现场处置细节',
      blockId: 'event-1129-repair',
    },
    {
      at: '2024-12-01T09:14:00+08:00',
      by: '系统',
      note: '复核确认：设备瞬时故障，无异常',
      overwritten: true,
      // 2.4 摄氏度与 2019 冷库温度记录同数：登记在案的同构签名（07 §6.2），
      // 隔八年同一次现象留下同一个数字。不是笔误，不得“修正”任一处。
      underlyingText:
        '通道内地面有微弱震动，广告屏旁有轻微温升。断电后三分钟内局部温度上升 2.4 摄氏度。',
    },
  ],
  related: ['north-loop-tunnel', 'new-editor-guide'],
  refs: [
    {
      blockId: 'event-1129-summary',
      target: 'north-loop-tunnel',
      text: '参见《北环路地下通道》',
    },
  ],
};

/* ------------------------------------------------------------------ *
 * 12·07 三人失联事件。
 * 编辑历史里藏着两道裂缝：
 *  一、许衡的修改与系统覆盖发生在同一秒（同 11·29）；
 *  二、一条时间戳比覆盖发生的那一秒晚 4 分钟的覆盖型记录，在跨天回访后才现身——
 *      10:30 的覆盖完成时，10:34 的记录已经写好了。
 * "未来时间戳"不由渲染时动态生成（那样每次刷新都会动），只由 fromRound 门控，
 * 门控在数据里，渲染层不做判断。
 * ------------------------------------------------------------------ */
const event1207: WikiEntry = {
  slug: 'event-1207',
  title: '12·07 三人失联事件',
  category: 'event',
  blocks: [
    { id: 'event-1207-h-course', type: 'heading', text: '事件经过' },
    {
      id: 'event-1207-summary',
      type: 'paragraph',
      text: '2024 年 12 月 7 日晚，三名人员在北环路地下通道内失联。三人于 21:33 前后自北口进入通道，此后未出现在任何出口记录中。',
      driftable: true,
      // 只到 21:36：正文自己写着"最长偏差 4 分钟"，这句为漂移提供了自洽的解释面。
      // 不用 21:41（那是值班报告里三人"出站"的时刻，撞上会让两份文书互扣死结）。
      variants: [
        {
          round: 1,
          text: '2024 年 12 月 7 日晚，三名人员在北环路地下通道内失联。三人于 21:36 前后自北口进入通道，此后未出现在任何出口记录中。',
        },
      ],
    },
    {
      id: 'event-1207-drift-note',
      type: 'paragraph',
      // 讨论页里许衡引用的是这句的"旧版本"（5 分钟），见 data/talk.ts。
      text: '值班记录称，事发时段 2 号至 5 号监控点位存在时间戳漂移，最长偏差 4 分钟。该偏差已按设备日志格式登记归档。',
    },
    { id: 'event-1207-h-review', type: 'heading', text: '系统复核' },
    {
      id: 'event-1207-review',
      type: 'paragraph',
      // 已登记的结论是化石：永不漂移
      text: '复核结论：未发现人员异常。三人信息未匹配到当日任何出入记录，不予检索。',
      driftable: false,
    },
    {
      id: 'event-1207-site',
      type: 'paragraph',
      // 这是"按标准格式重建"后的版本，许衡的原件（含 8 秒未写入的细节）只在编辑历史底层。
      text: '现场处置：巡视人员 21:47 到场，通道内无异常。',
    },
    { id: 'event-1207-h-attach', type: 'heading', text: '附件' },
    {
      id: 'event-1207-attach',
      type: 'list',
      items: [
        '2 号—5 号点位录像片段（时长 90 秒）',
        '通道平面图（1 张）',
        '当日通行记录导出（删减版）',
      ],
    },
    {
      id: 'event-1207-quote',
      type: 'quote',
      text: '值班记录 QX-1207-02 原文：“三个年轻人从北口进，没见出来。回看的时候，进出记录里没有他们。”',
    },
  ],
  history: [
    {
      at: '2024-12-08T08:12:00+08:00',
      by: '值班记录',
      note: '生成事件条目',
    },
    {
      at: '2024-12-08T10:30:00+08:00',
      by: '许衡',
      note: '添加现场处置细节',
      blockId: 'event-1207-site',
    },
    {
      at: '2024-12-08T10:30:00+08:00',
      by: '系统',
      note: '复核确认：未发现人员异常，不予检索',
      overwritten: true,
      underlyingText:
        '巡视人员反馈：21:47 到场复核，通道内无滞留人员。21:33 至 21:41 之间，3 号点位有 8 秒录像未写入。地面未见遗留物。',
    },
    {
      // 时间戳比覆盖发生的那一秒晚 4 分钟：登记在 10:30，记录写着 10:34。
      // 跨天回访后它才出现，出现之后不再消失。
      at: '2024-12-08T10:34:00+08:00',
      by: '系统',
      note: '复核登记：现场处置段已按标准格式重建。被覆盖的原始版本见本条底层。',
      overwritten: true,
      underlyingText:
        '巡视人员反馈：21:47 到场复核，通道内无滞留人员。21:33 至 21:41 之间，3 号点位有 8 秒录像未写入。地面未见遗留物。',
      fromRound: 1,
    },
  ],
  related: ['north-loop-tunnel'],
  refs: [
    {
      blockId: 'event-1207-summary',
      target: 'north-loop-tunnel',
      text: '参见《北环路地下通道》',
    },
  ],
};

/* ------------------------------------------------------------------ *
 * 白昼馆。住客场所，初始地点之一。
 * 监控全覆盖与唐继的职责描述互证；住客登记里先埋下一个名字，
 * 深层事件（那个名字后来怎么了）属于第三幕，此处的语气必须全程正常。
 * ------------------------------------------------------------------ */
const daylightHouse: WikiEntry = {
  slug: 'daylight-house',
  title: '白昼馆',
  category: 'location',
  blocks: [
    {
      id: 'daylight-house-summary',
      type: 'paragraph',
      text: '白昼馆位于城北新区站前街东段，为区属短租驿站，面向新入职人员和短期驻留人员。建筑地上六层，共 46 间客房，2021 年投入使用。',
      driftable: true,
      // 年份漂移：高成本属性里最不起眼的一类。
      variants: [
        {
          round: 1,
          text: '白昼馆位于城北新区站前街东段，为区属短租驿站，面向新入职人员和短期驻留人员。建筑地上六层，共 46 间客房，2020 年投入使用。',
        },
      ],
    },
    { id: 'daylight-house-h-ops', type: 'heading', text: '运营' },
    {
      id: 'daylight-house-ops',
      type: 'paragraph',
      text: '白昼馆不设常驻前台，入住与非入住时段均实行刷卡管理。楼道与公共区域监控覆盖完整，图像接入城北新区综合管理平台。',
    },
    { id: 'daylight-house-h-notes', type: 'heading', text: '住客须知' },
    {
      id: 'daylight-house-notes',
      type: 'list',
      items: [
        '夜间返回请刷卡进入，请勿为他人开门。',
        '公共区域请勿长时间停留。',
        '如需续住，请提前一日在自助机登记。',
        '如需调阅本人出入记录，请向管理组提交申请。',
      ],
    },
    { id: 'daylight-house-h-register', type: 'heading', text: '长住登记（摘录）' },
    {
      id: 'daylight-house-register',
      type: 'paragraph',
      text: '丁茂，四层，自 2024 年 11 月 18 日起长住。登记状态：正常。',
    },
    { id: 'daylight-house-h-roll', type: 'heading', text: '在住名录（摘录）' },
    {
      id: 'daylight-house-roll',
      // 列表里每一行都普通，包括最后一行：一个没有称呼、在 4 人夜之后入住的住客。
      type: 'table',
      rows: [
        ['房号', '称呼', '入住日期', '状态'],
        ['302', '罗某', '2024-10-11', '在住'],
        ['415', '丁茂', '2024-11-18', '在住'],
        ['420', '徐某', '2024-09-02', '在住'],
        ['508', '（未登记称呼）', '2024-11-27', '在住'],
      ],
    },
    {
      id: 'daylight-house-roll-note',
      type: 'paragraph',
      text: '以上为 2024 年 11 月 30 日导出记录。名录只登记在住人员，不登记访客。',
    },
  ],
  history: [
    { at: '2024-10-22T09:15:00+08:00', by: '管理组', note: '录入基础信息' },
    { at: '2024-11-18T16:30:00+08:00', by: '管理组', note: '更新长住登记' },
  ],
  // 章末收束：读完白昼馆章的材料链（程露手记的断页处）之后，12 月修订并入正文。
  // 未读时目录带红点——红点允许的第二类场景（文档修订）。
  revisions: [
    {
      title: '2024 年 12 月修订',
      reveal: { afterSeen: ['note-chenglu-break'] },
      blocks: [
        {
          id: 'daylight-house-rev1-summary',
          type: 'paragraph',
          text: '12 月复核摘要：11 月 21 日连廊画面经复核，判定为缓存复用所致，画面内容与在住人员无关。相关材料按系统口径归档。',
        },
        {
          id: 'daylight-house-rev1-roll',
          type: 'paragraph',
          text: '在住名录（12 月 6 日更新）：415 丁茂，在住；508（未登记称呼），在住。302、420 已退房。',
        },
      ],
    },
  ],
  related: ['person-tangji'],
};

/* ------------------------------------------------------------------ *
 * B1 夜间阅览室。初始地点之一。
 * 阅览须知里那条"复制资料请登记"是本项目机制的站内自述；
 * 结尾那句"未发生资料遗失事件"平静但留下味道，不作任何解释。
 * ------------------------------------------------------------------ */
const b1ReadingRoom: WikiEntry = {
  slug: 'b1-reading-room',
  title: 'B1 夜间阅览室',
  category: 'location',
  blocks: [
    {
      id: 'b1-reading-room-summary',
      type: 'paragraph',
      text: 'B1 夜间阅览室位于城北新区图书馆分馆地下一层，开放时间为每日 21:00 至次日 05:00，刷卡进入，不设常驻管理员。',
      driftable: true,
      variants: [
        {
          round: 1,
          text: 'B1 夜间阅览室位于城北新区图书馆分馆地下一层，开放时间为每日 21:00 至次日 04:30，刷卡进入，不设常驻管理员。',
        },
      ],
    },
    { id: 'b1-reading-room-h-rules', type: 'heading', text: '阅览须知' },
    {
      id: 'b1-reading-room-rules',
      type: 'list',
      items: [
        '室内图书不得带出。',
        '如需复制资料，请在登记簿填写复制内容与时间。',
        '离开时请将资料归位，并在登记簿签注。',
      ],
    },
    {
      id: 'b1-reading-room-archive',
      type: 'paragraph',
      text: '图书馆 B1 层另设资料交接柜，供内容审核组交接纸质复核件使用，由夜班管理员定期整理。',
    },
    {
      id: 'b1-reading-room-note',
      type: 'paragraph',
      text: '阅览室自开放以来未发生资料遗失事件。',
    },
  ],
  history: [
    { at: '2024-09-28T10:05:00+08:00', by: '图书馆分馆', note: '录入基础信息' },
    { at: '2024-11-05T09:40:00+08:00', by: '图书馆分馆', note: '补充阅览须知' },
  ],
  related: ['person-xuheng'],
};

/* ------------------------------------------------------------------ *
 * 值班守则（节选）。与新编辑须知并列的规程类。
 * 每条都是制度性的"少看、少对比、错过就不算"——玩家读过第二幕的
 * 解释后再回头看它，才会发现这是一份操作指南。
 * ------------------------------------------------------------------ */
const dutyGuide: WikiEntry = {
  slug: 'duty-guide',
  title: '值班守则（节选）',
  category: 'protocol',
  blocks: [
    {
      id: 'duty-guide-intro',
      type: 'paragraph',
      text: '本守则节选自《城北新区值班工作细则》第三、七章。全文以印发版为准，本处不收录。',
    },
    {
      id: 'duty-guide-rules',
      type: 'list',
      items: [
        '1. 交接班时，如上一班留下的记录与现场不符，以记录为准，另行标注。',
        '2. 复核申请须当日提出。隔日提出的复核申请不再受理。',
        '3. 现场复核结论写"正常"即可，不必写明正常的具体情况。',
        '4. 值班日志不记录未发生的事。',
        '5. 同一事项一日内不重复登记。',
        '6. 遇无法归类的事项，按最接近的类别登记，不另立类别。',
      ],
    },
    {
      id: 'duty-guide-note',
      type: 'paragraph',
      text: '对本守则的疑问，请以书面形式提交值班室。答复不承诺时限。',
    },
  ],
  history: [
    { at: '2024-06-20T09:00:00+08:00', by: '值班室', note: '节选并录入' },
    { at: '2024-10-15T14:30:00+08:00', by: '值班室', note: '核对印发版' },
  ],
  related: ['new-editor-guide', 'person-xuheng'],
};

export const ENTRIES: WikiEntry[] = [
  newEditorGuide,
  northLoopTunnel,
  daylightHouse,
  b1ReadingRoom,
  event1129,
  event1207,
  dutyGuide,
  ...PERSON_ENTRIES,
  ...RECORD_ENTRIES,
  ...CHAPTER1_ENTRIES,
  ...CASE1207_ENTRIES,
  ...DAYLIGHT_ENTRIES,
  ...ANNALS_ENTRIES,
  ...OVERLOAD_ENTRIES,
  ...WITNESS_ENTRIES,
  ...ACT4_ENTRIES,
  ...QINGLAN_ENTRIES,
  ...COLDSTORE_ENTRIES,
  ...HANDOVER_ENTRIES,
  ...B1_ENTRIES,
];
export const ENTRY_SLUGS = ENTRIES.map((e) => e.slug);

export function getEntry(slug: string): WikiEntry | undefined {
  return ENTRIES.find((e) => e.slug === slug);
}

/**
 * 由 blockId 取规范版文本。日志页"停留最久的一段"要显示这段文字的前若干字，
 * 而它手上只有一个 id。取到的文本还要经 staleOr 走一遍：
 * 玩家看见的可能已经是变体或化石，台账不该替他改口。
 *
 * 修订块自本轮起参与本函数与 seen 追踪（修订区接手后重扫，见 EntryBody 的 revKey）：
 * 它们不再只是"附录文本"，也可以承担投放条件。
 */
export function blockText(id: string): string {
  for (const e of ENTRIES) {
    for (const b of e.blocks) {
      if (b.id === id) return b.text ?? (b.items ?? []).join('；');
    }
    for (const rev of e.revisions ?? []) {
      for (const b of rev.blocks) {
        if (b.id === id) return b.text ?? (b.items ?? []).join('；');
      }
    }
  }
  const v = VERIFY_BLOCKS[id];
  if (v?.text) return v.text;
  const talk = talkPostText(id);
  if (talk) return talk;
  const story = storyBlockText(id);
  if (story) return story;
  const chronicle = chronicleBlockText(id);
  if (chronicle) return chronicle;
  const hot = hotBlockText(id);
  if (hot) return hot;
  const news = newsBlockText(id);
  if (news) return news;
  const gov = govBlockText(id);
  if (gov) return gov;
  return netRecordText(id);
}

/**
 * 由 blockId 反查所属词条（台账里给"停留最久的一段"配书名号用）。
 * 只管词条正文与修订块；讨论页/连载等来源的块没有词条归属，返回 undefined。
 */
export function blockOwner(id: string): WikiEntry | undefined {
  for (const e of ENTRIES) {
    for (const b of e.blocks) if (b.id === id) return e;
    for (const rev of e.revisions ?? []) for (const b of rev.blocks) if (b.id === id) return e;
  }
  return undefined;
}

export const CATEGORY_LABEL: Record<WikiEntry['category'], string> = {
  location: '地点',
  event: '事件',
  personnel: '人员',
  protocol: '规程',
  record: '记录',
  special: '特殊',
};

/* ----------------------------- 对照物 ----------------------------- */

/**
 * 复核文书中真正承担“对照”功能、因此被本页独占的值。
 * 只有参与对照的数才写在这里：时间戳与日期不属于对照物。
 */
export const RESERVED_NUMBERS = ['15', '4 块'];

const northLoopExcerpt: ContentBlock = {
  id: 'verify-north-loop-tunnel-excerpt',
  type: 'quote',
  text: '…电子广告屏（4 块）、导向标识系统和紧急呼叫装置。监控点位共 15 个，信号接入城北新区综合管理平台。',
};

export interface VerifyDoc {
  slug: string;
  target: string;
  at: string;
  conclusion: string;
  by: string;
  footer: string;
  excerpt: ContentBlock;
  /**
   * 投放条件：未满足时不进检索结果（页面本身照常静态生成，与词条同口径）。
   *
   * 对照物必须“只能被动撞见”（`04 §八`）。它本来就是检索可达的——
   * `04 §八` 把“检索摘要与正文差一个字”列为合法对照物形式——但不得在
   * 读者还没读到被它否定的那一句之前就可被检索到：那时它无从反驳任何记忆，
   * 只是一份提早送到的底牌。门控把它推到“撞见”的位置上。
   */
  reveal?: RevealRule;
}

export const VERIFY_DOCS: Record<string, VerifyDoc> = {
  'north-loop-tunnel': {
    slug: 'north-loop-tunnel',
    target: '北环路地下通道 · 基础设施',
    at: '2024-12-02 11:40',
    conclusion: '经核对，本条目自上次复核以来无变化。',
    by: '程露',
    footer: '本页由系统生成，不接受编辑。',
    excerpt: northLoopExcerpt,
    // 真正看过监控点位那一句之后才可检索到：本页引文写的正是它（15 个），
    // 而正文现行版是 16，并会漂到 14、13。先读到引文、后读到正文，对照就没了。
    reveal: { afterSeen: ['north-loop-tunnel-infra'] },
  },
};

export const VERIFY_BLOCKS: Record<string, ContentBlock> = {
  'north-loop-tunnel': northLoopExcerpt,
};

export const VERIFY_SLUGS = Object.keys(VERIFY_DOCS);
