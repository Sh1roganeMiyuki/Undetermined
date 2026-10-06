import type { WikiEntry } from '@/types';

/* ------------------------------------------------------------------ *
 * 章 5 · 冷库：档案层（第一批）。
 *
 * 五件，围绕 2019.12 冷库断电事故（01 EX-07 / EX-08）：
 * - 《城北副食品公司冷库》（地点·门控：读 12·07 概述后）：常态词条；沿革段最后一句
 *   “一名夜班值守人员离岗后未归，相关情况未再见于记录”——没有下文的写法。
 * - 《冷库值班记录（2019.12.21）》（unlisted）：何某手写的最后留痕，
 *   末行停于 22:14——本页至此无字。
 * - 《冷库现场温度记录（摘录）》（unlisted）：EX-08 的载体——
 *   手绘折线图，无绘图人签名，无观测设备在运行（不解释）。
 * - 《冷库事故情况报告（摘录）》（门控：读值班记录后）：行政口径正脸；
 *   “椅子侧翻”与“建议加强值守管理”。
 * - 《关于何某有关情况的说明》（门控：读报告后）：最冷的一件——
 *   手续都对：报案、知情、停薪、“配合有关部门后续工作”。
 *
 * 纪律：不解释“未定稿”，不解释 2.4℃，不解释 40 分钟里发生了什么；
 * 幕五的推进条件是“玩家主动打开冷库档案（系统不得引导）”——
 * 因此本组不做任何跨章引导，做得很安静。
 * ------------------------------------------------------------------ */

export const coldstore: WikiEntry = {
  slug: 'coldstore',
  title: '城北副食品公司冷库',
  category: 'location',
  // 投放：读过《12·07 三人失联事件》的概述之后——又一起“人没了”，
  // 站里翻出了上一份旧案：2019 年的冷库。静悄悄进目录，无任何指路。
  reveal: { afterSeen: ['event-1207-summary'] },
  blocks: [
    {
      id: 'coldstore-summary',
      type: 'paragraph',
      text: '城北副食品公司冷库位于城北区建设路 90 号，1987 年建成投用，主库分冷冻库两间、保鲜库一间，为城北片区规模最大的食品冷链仓储设施之一。',
    },
    {
      id: 'coldstore-history',
      type: 'paragraph',
      text: '2010 年代起设施逐步老化，库容缩减，部分库房对外出租。2019 年 12 月，库区因线路故障停电约四十分钟；同期，一名夜班值守人员离岗后未归，相关情况未再见于记录。',
    },
    {
      id: 'coldstore-now',
      type: 'paragraph',
      text: '2020 年后主库停用，场地改为普通仓储。现为城北仓储园区（原冷库）。园区门牌沿用旧号。',
    },
  ],
  history: [
    { at: '2024-09-20T14:30:00+08:00', by: '内容审核组', note: '录入设施基础信息' },
  ],
};

export const coldstoreDuty: WikiEntry = {
  slug: 'record-coldstore-duty',
  title: '冷库值班记录（2019.12.21）',
  category: 'record',
  unlisted: true,
  // 投放：读过冷库词条的沿革或现状之后。这旧案得先进他的世界，复制件才调阅得到。
  // 缺这道门时，第一天检索“冷库”即可直取本页，而事故报告、情况说明与现场照片
  // 的门全部挂在本页之后（report ← duty-end ← explain/photos ← report-body），
  // 一条链会被一次检索整段带走。
  reveal: { afterSeen: ['coldstore-history', 'coldstore-now'] },
  blocks: [
    {
      id: 'coldstore-duty-head',
      type: 'paragraph',
      text: '本页为 2019 年 12 月 21 日冷库夜间值班记录复制件。原作为值守员手写，抄录如下。',
    },
    { id: 'coldstore-duty-1', type: 'paragraph', text: '19:02　接班。设备正常。' },
    { id: 'coldstore-duty-2', type: 'paragraph', text: '20:00　巡库。三库门锁完好，风机声正常。' },
    { id: 'coldstore-duty-3', type: 'paragraph', text: '21:00　抄表：冷冻一号 -17.9，冷冻二号 -18.2，保鲜 +3.4。' },
    { id: 'coldstore-duty-4', type: 'paragraph', text: '22:14　停电。' },
    {
      id: 'coldstore-duty-end',
      type: 'paragraph',
      text: '（本页至此无字。原件该行之下空白，笔搁在页上。）',
    },
  ],
  history: [
    { at: '2019-12-22T10:00:00+08:00', by: '值班室', note: '复制归档' },
  ],
  related: ['coldstore', 'record-coldstore-report'],
};

export const coldstoreTemp: WikiEntry = {
  slug: 'record-coldstore-temp',
  title: '冷库现场温度记录（摘录）',
  category: 'record',
  unlisted: true,
  // 与值班记录同门：两份都是“调阅复制件”，进世界的时刻一致。
  reveal: { afterSeen: ['coldstore-history', 'coldstore-now'] },
  blocks: [
    {
      id: 'coldstore-temp-head',
      type: 'paragraph',
      text: '本页摘自冷库现场检查记录附件。原件为一页手绘折线图。',
    },
    {
      id: 'coldstore-temp-body',
      type: 'paragraph',
      // 停电时刻以值班记录/事故报告/现场照片/连载八四处一致的 22:14 为准，
      // 温升窗口必须晚于它——EX-08 是“断电后的温升”。
      // 曾写 22:03 至 22:06，早于断电 11 分钟且与本句“断电期间”自相矛盾；
      // 2026-10-06 跨载体审计修正为 22:17 至 22:20（回落约 22:50，仍早于 23 时前后复电）。
      // 升幅 2.4℃ 与 11·29 被覆盖底层记录同数：登记在案的同构签名（07 §6.2），不得改。
      text: '断电期间，库内局部温度于 22:17 至 22:20 由 -17.6℃ 升至 -15.2℃，升幅 2.4℃；此后升幅持续扩大，约三十分钟后回落。检查结论：归入环境波动。',
    },
    {
      id: 'coldstore-temp-note',
      type: 'paragraph',
      text: '（原件无绘图人签名。归档时备注：停电时段，库区无观测设备在运行。）',
    },
  ],
  history: [
    { at: '2019-12-23T15:20:00+08:00', by: '值班室', note: '随检查记录归档' },
  ],
  related: ['coldstore', 'record-coldstore-report'],
};

export const coldstoreReport: WikiEntry = {
  slug: 'record-coldstore-report',
  title: '冷库事故情况报告（摘录）',
  category: 'record',
  reveal: { afterSeen: ['coldstore-duty-end'] },
  blocks: [
    {
      id: 'coldstore-report-head',
      type: 'paragraph',
      text: '2019 年 12 月 21 日 22 时 14 分，库区因高压线路故障停电。值班室及库区应急照明正常启动；备用发电机未接入（设备状态：报废待处置）。23 时前后恢复供电。',
    },
    {
      id: 'coldstore-report-body',
      type: 'paragraph',
      text: '复电后经清点，当班值守何某未在位。现场检查：值班室桌面留有值班记录，末行停于 22:14；椅子侧翻；无其他异常。',
    },
    {
      id: 'coldstore-report-end',
      type: 'paragraph',
      text: '建议：加强值守管理和应急演练。附件：值班记录复制件、现场温度记录、应急设备清单。',
    },
  ],
  history: [
    { at: '2019-12-25T09:40:00+08:00', by: '库区办公室', note: '报公司并归档' },
  ],
  related: ['record-coldstore-duty', 'record-coldstore-temp'],
};

export const coldstoreExplain: WikiEntry = {
  slug: 'record-coldstore-explain',
  title: '关于何某有关情况的说明',
  category: 'record',
  reveal: { afterSeen: ['coldstore-report-body'] },
  blocks: [
    {
      id: 'coldstore-explain-head',
      type: 'paragraph',
      text: '何某（男，51 岁）系我司夜间值守人员。12 月 21 日夜班期间离岗未归。公司已报案并配合查找，现场情况已如实提供。',
    },
    {
      id: 'coldstore-explain-body',
      type: 'paragraph',
      text: '其亲属（妹）已到场了解情况，并代为处理个人物品。工资发放至当月起停止。',
    },
    {
      id: 'coldstore-explain-end',
      type: 'paragraph',
      text: '家属要求继续查找。公司表示将配合有关部门后续工作。有关用工事项按相关规定处理。',
    },
  ],
  history: [
    { at: '2020-01-06T11:00:00+08:00', by: '库区办公室', note: '答复家属并留存' },
  ],
  related: ['coldstore', 'record-coldstore-report'],
};

export const coldstorePhotos: WikiEntry = {
  slug: 'record-coldstore-photos',
  title: '冷库现场照片（存档）',
  category: 'record',
  unlisted: true,
  // 投放：读过事故报告正文后——报告里“椅子侧翻”四个字的那张椅子，第一次被看见。
  reveal: { afterSeen: ['coldstore-report-body'] },
  blocks: [
    {
      id: 'coldstore-photos-intro',
      type: 'paragraph',
      text: '以下为 2019 年 12 月 22 日现场检查时拍摄的照片，选存四张。此组照片未列入事故报告附件。',
    },
    {
      id: 'coldstore-photos-1',
      type: 'image',
      alt: '值班室桌面，摊开的值班记录本',
      prompt:
        '数码相机照片：老旧冷库值班室的木质桌面，一本摊开的横线记录本，最后一行的字迹停在半途，旁边搁着一支圆珠笔，顶灯冷白，闪光灯直打，构图平实，2019 年纪实感 ／ digital camera photo, old cold-storage duty room desk, open lined notebook with writing stopped mid-line, ballpoint pen set aside, cold white overhead light, direct flash, plain documentary style',
    },
    {
      id: 'coldstore-photos-1-note',
      type: 'paragraph',
      text: '图一：值班室桌面。记录本摊开，末行停于 22:14。（12.22 09:10。）',
    },
    {
      id: 'coldstore-photos-2',
      type: 'image',
      alt: '倒在桌边的军绿色帆布折叠椅',
      prompt:
        '数码相机照片：值班室地上一把倒下的折叠椅，军绿色帆布面，铁架，桌面边缘入画，地面水泥质感，闪光灯直打，按原状拍摄，冷静的现场记录感 ／ digital camera photo, an overturned folding chair on a duty room floor, army-green canvas seat, metal frame, desk edge in frame, concrete floor, direct flash, untouched scene, calm forensic documentary style',
    },
    {
      id: 'coldstore-photos-2-note',
      type: 'paragraph',
      text: '图二：桌边侧翻的座椅。检查人员未将其扶正，按原状拍摄。（09:12。）',
    },
    {
      id: 'coldstore-photos-3',
      type: 'image',
      alt: '墙上机械温度计（指针位置见图像）',
      prompt:
        '数码相机照片：冷库值班室墙面上挂式机械温度计，圆形刻度盘，黑色指针，玻璃面反光，旁边是一小块斑驳的墙皮，闪光灯直打，近距离平视拍摄 ／ digital camera photo, wall-mounted mechanical thermometer in a cold-storage duty room, round dial with black needle, glass reflection, worn wall behind, direct flash, close-up documentary style',
    },
    {
      id: 'coldstore-photos-3-note',
      type: 'paragraph',
      text: '图三：墙上机械温度计。指针位置见图像。（09:15。）',
    },
    {
      id: 'coldstore-photos-4',
      type: 'image',
      alt: '院区北墙与库门（从值班室门口拍摄）',
      prompt:
        '数码相机照片：冬季清晨的小型冷库院区，厂房北墙，三扇库门关闭，地面覆雪，光线均匀偏灰，构图平实，无人物，纪实摄影 ／ digital camera photo, small cold-storage yard in winter morning, plant north wall, three closed warehouse doors, snow-covered ground, flat gray light, no people, documentary style',
    },
    {
      id: 'coldstore-photos-4-note',
      type: 'paragraph',
      text: '图四：院区北墙与库门。（09:20。）',
    },
    {
      id: 'coldstore-photos-tail',
      type: 'paragraph',
      text: '（本次现场拍摄共 36 张，选存 4 张。）',
    },
  ],
  history: [{ at: '2019-12-23T16:00:00+08:00', by: '检查组', note: '选存入卷' }],
  related: ['record-coldstore-report', 'coldstore'],
};

export const COLDSTORE_ENTRIES: WikiEntry[] = [
  coldstore,
  coldstoreDuty,
  coldstoreTemp,
  coldstoreReport,
  coldstoreExplain,
  coldstorePhotos,
];