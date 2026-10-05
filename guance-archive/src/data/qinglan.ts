import type { WikiEntry } from '@/types';

/* ------------------------------------------------------------------ *
 * 章 3 · 青岚山：档案层（第一批）。
 *
 * 四件，全部踩在小说已有的事实上（连载四/六/七、口述第三辑）：
 * - 《青岚山体公园》：日常层，完全无异常——开放时间、点位、含糊的一句闭园史；
 *   “冬季延长至 21:30”与连载四互证；“山脊步道 17:30 关闭”是官方版的规矩（民间默契的来源之一）。
 * - 《闭园通告（2018）》：一纸家常通告——“设备调试收尾”四个字是官方口径的唯一缝隙。
 * - 《Argus Sensing 城北项目侧记》：公关文本；页面校订记录（修订）声明改过，
 *   而正文仍写着旧词——声明与正文对不上，不解释（与连载七“报告三副面孔”同构）。
 * - 《人员离职登记（摘录）》：行政层的“轮廓”——“2018.11 离职、合同期满”的时间刺。
 *
 * 命名纪律：公开资料里可以出现公司名；不出现任何内部术语与“百眼”相关戏说。
 * ------------------------------------------------------------------ */

export const qinglanPark: WikiEntry = {
  slug: 'qinglan-park',
  title: '青岚山体公园',
  category: 'location',
  blocks: [
    {
      id: 'qinglan-park-summary',
      type: 'paragraph',
      text: '青岚山体公园位于城北新区北部，依托青岚山而建，是城区内唯一可登高观景的山体公园。山体不高，视野开阔，从山顶平台可俯瞰城北新区全景。',
    },
    { id: 'qinglan-park-h-sites', type: 'heading', text: '主要点位' },
    {
      id: 'qinglan-park-sites',
      type: 'list',
      items: [
        '东门：游客服务点、小卖部、公共卫生间，紧邻公交站点。',
        '西坡石阶：主登山道，石阶沿西坡而上，两侧设照明。',
        '半山亭：中途休憩点，石凳四条。',
        '望城台：山顶观景平台，设有留言板；平台照明按时段管理。',
        '山脊步道：沿山脊环线，坡度平缓，入口在西坡石阶中段。',
      ],
    },
    { id: 'qinglan-park-h-hours', type: 'heading', text: '开放时间' },
    {
      id: 'qinglan-park-hours',
      type: 'list',
      items: [
        '园区大门：每日 6:00—18:00。冬季（11 月至次年 2 月）延长至 21:30。',
        '山脊步道：每日 6:00—17:30。17:30 后关闭。',
      ],
    },
    {
      id: 'qinglan-park-hours-note',
      type: 'paragraph',
      text: '山脊步道关闭时间的设置原因，管理处未作说明；园区其余步道照明完备，夜间通行请以照明路段为准。',
    },
    { id: 'qinglan-park-h-history', type: 'heading', text: '历史沿革' },
    {
      id: 'qinglan-park-history',
      type: 'paragraph',
      text: '2017 年，园区部分区域配合市政感知项目开展点位建设（详见相关单位资料）。2018 年冬，因山体维护闭园两个月。此后园区开放安排未再有变化。',
    },
    {
      id: 'qinglan-park-note',
      type: 'paragraph',
      text: '园区日常管理由青岚山体公园管理处负责。游客如有建议，可提交至游客服务点，或在望城台留言板留言。',
    },
  ],
  history: [
    { at: '2024-06-11T10:20:00+08:00', by: '内容审核组', note: '录入园区基础信息' },
    { at: '2024-11-08T15:40:00+08:00', by: '内容审核组', note: '更新冬季开放时间' },
  ],
  related: ['qinglan-closure-2018', 'argus-side-note'],
};

export const qinglanClosure: WikiEntry = {
  slug: 'qinglan-closure-2018',
  title: '青岚山体公园闭园通告（2018）',
  category: 'record',
  // 投放：读过公园词条“沿革”段（“2018 年冬，因山体维护闭园两个月”）之后——
  // 那句含糊的闭园史，就是这份通告的门。
  reveal: { afterSeen: ['qinglan-park-history'] },
  blocks: [
    {
      id: 'qinglan-closure-head',
      type: 'paragraph',
      text: '为配合山体维护及设备调试收尾工作，青岚山体公园自 2018 年 11 月 5 日起闭园，暂停对外开放，具体开放时间另行通知。给您带来的不便，敬请谅解。',
    },
    {
      id: 'qinglan-closure-sign',
      type: 'paragraph',
      text: '青岚山体公园管理处　2018 年 11 月 3 日',
    },
    {
      id: 'qinglan-closure-body',
      type: 'paragraph',
      text: '（本通告原张贴于公园东门公告栏，2019 年开园后撤下。本站留存样本。）',
    },
  ],
  history: [
    { at: '2024-06-11T10:35:00+08:00', by: '内容审核组', note: '录入历史通告' },
  ],
  related: ['qinglan-park', 'argus-side-note'],
};

export const argusSideNote: WikiEntry = {
  slug: 'argus-side-note',
  title: 'Argus Sensing 城北项目侧记',
  category: 'record',
  // 投放：与闭园通告同门（读公园“沿革”段）——两份“闭园事件”材料一组浮现；
  // 页面的“校订记录”仍另有其门（读通告后），时序不受影响。
  reveal: { afterSeen: ['qinglan-park-history'] },
  blocks: [
    {
      id: 'argus-side-intro',
      type: 'paragraph',
      text: 'Argus Sensing（阿格斯感知）2017 年落户城北新区东区，主营城市级感知设备研发与应用，旗舰产品为多光谱复合观测阵列，用于城市基础设施状态监测。',
    },
    {
      id: 'argus-side-project',
      type: 'paragraph',
      text: '2018 年 10 月，公司与市相关部门合作，在青岚山体公园开展感知阵列的联合调试。测试期间设备各项指标稳定，均在设计余量内。',
    },
    {
      id: 'argus-side-close',
      type: 'paragraph',
      text: '同年 11 月，项目完成撤场，设备转入封存。青岚山点位作为示范点位，其运行数据为后续城市感知网络建设提供了经验。',
    },
    {
      id: 'argus-side-note',
      type: 'paragraph',
      text: '（本页整理自对外发布资料，供项目参考。）',
    },
  ],
  // 页面校订记录：读过公园闭园通告之后并入——
  // 声明“已调整”，而正文仍是旧词：声明与正文对不上，不解释。
  revisions: [
    {
      title: '页面校订记录（2024 年 12 月）',
      reveal: { afterSeen: ['qinglan-closure-head'] },
      blocks: [
        {
          id: 'argus-side-rev1-text',
          type: 'paragraph',
          text: '本页于 2024 年 12 月进行例行校订：一、“示范点位”表述调整为“试点点位”；二、“10 月”等具体时点表述调整为季节性表述。正文相应内容以下次整体改版为准。',
        },
        {
          id: 'argus-side-rev1-note',
          type: 'paragraph',
          text: '（校订记录由本页维护人登记。）',
        },
      ],
    },
  ],
  history: [
    { at: '2024-06-12T09:15:00+08:00', by: '内容审核组', note: '整理收录对外资料' },
  ],
  related: ['qinglan-park', 'qinglan-closure-2018'],
};

export const argusLeavers: WikiEntry = {
  slug: 'argus-leavers',
  title: '人员离职登记（摘录）',
  category: 'record',
  unlisted: true,
  // 读连载七“2019 年春天，小方离职了”之后：行政层的“轮廓”件随之可检索。
  reveal: { afterSeen: ['chronicle-07-p40'] },
  blocks: [
    {
      id: 'argus-leavers-intro',
      type: 'paragraph',
      text: '本页为城北项目相关人员的离职登记摘录，人名为化名处理后留存。',
    },
    {
      id: 'argus-leavers-table',
      type: 'table',
      rows: [
        ['姓名', '岗位', '入职', '离职', '原因'],
        ['钟某', '项目负责岗', '2018.06', '—（在职）', '—'],
        ['方某', '工程记录岗', '2018.07', '2019.04', '个人发展'],
        ['梁某', '驻点保障岗', '2018.09', '2018.11', '合同期满'],
        ['胡某', '设备维护岗', '2018.08', '2019.01', '个人原因'],
        ['郑某', '驻点保障岗', '2018.09', '2019.02', '个人原因'],
      ],
    },
    {
      id: 'argus-leavers-note',
      type: 'paragraph',
      text: '（摘录按登记原样照录，未做核对。有的栏，本来就是空的。）',
    },
  ],
  history: [
    { at: '2024-12-30T11:00:00+08:00', by: '内容审核组', note: '整理收录' },
  ],
  related: ['argus-side-note'],
};

/* ------------------------------------------------------------------ *
 * 《青岚山夜爬指南（网友整理）》—— 章 3 登顶交互（环山夜爬·层 4）。
 *
 * 载体是一篇民间攻略（真实感道具）：路线、时长、规矩（“别站正中间”的第三个来源）。
 * “环山夜爬”交互：分步推进，山脊岔口可走（官方 17:30 关闭 + 民间默契都拦不住你——
 * 没有人拦你，这件事比“出了什么事”更冷）；登顶后的“被看”瞬间 = EX-10 的实体。
 * 留言板最下一行的铅笔字与连载四/六的三种笔迹板共存——不解释谁写的。
 * 投放：读过连载四结尾或公园词条开放时间任一之后。
 * ------------------------------------------------------------------ */

const nightClimb: WikiEntry = {
  slug: 'night-climb-guide',
  title: '青岚山夜爬指南（网友整理）',
  category: 'record',
  reveal: { afterSeen: ['chronicle-04-p62', 'qinglan-park-hours-note'] },
  blocks: [
    {
      id: 'night-climb-intro',
      type: 'paragraph',
      text: '（本文为网友整理，非官方发布；夜爬有风险，量力而行。）冬季东门开到 21:30。路线实测：东门—西坡石阶—半山亭—望城台，上行三十五分钟左右，下行二十。带手电，带水，山顶风大。',
    },
    {
      id: 'night-climb-note',
      type: 'paragraph',
      text: '两条路线：主道（石阶直上）和山脊步道（右手边，环线，17:30 后牌子上写着关闭）。主道稳，山脊快。山脊那条我自己不走，也说不好为什么。另外，望城台有个规矩，去了就知道：别站正中间。信不信由你。',
    },
    { id: 'night-climb-path', type: 'climb' },
    {
      id: 'night-climb-tail',
      type: 'paragraph',
      text: '（补充：山顶十点关灯。关灯之后什么都看不见——我觉得挺好的。）',
    },
  ],
  history: [
    { at: '2024-12-24T21:10:00+08:00', by: '内容审核组', note: '收录' },
  ],
  related: ['qinglan-park', 'case-2411'],
};

/**
 * 《望城台留言板（抄录存档）》—— 留言板的档案形态。
 *
 * 纪律：
 * - “三种笔迹，接写”与“与前文非同一日”是档案员的谨慎，不解释他怎么知道；
 * - “别站正中间”入档且标“年份不可考”（与连载六“比公园还老”对齐）；
 * - 不收录夜爬交互里那行铅笔字（今天有人上来吗）——两者永不并置。
 */
export const qinglanBoard: WikiEntry = {
  slug: 'record-qinglan-board',
  title: '望城台留言板（抄录存档）',
  category: 'record',
  // 投放：读过连载四留言板段末（“心里发毛”定稿处）后。
  reveal: { afterSeen: ['chronicle-04-p51'] },
  blocks: [
    {
      id: 'qinglan-board-intro',
      type: 'paragraph',
      text: '以下为望城台留言板历年存档抄录，由公园管理处按年度整理。板面拍照留存，抄录按可辨认内容摘录。',
    },
    {
      id: 'qinglan-board-2023',
      type: 'paragraph',
      text: '2023 年度（摘）：毕业了。／我考上了！！／又一年。／山顶风太大了，帽子没了。',
    },
    {
      id: 'qinglan-board-2024',
      type: 'paragraph',
      text: '2024 年度（摘）：老王两口子到此一游。3.16。／服了，你们住山上啊？（接写）／7 月 8 号。她答应了。嘿嘿。／小心台阶，下雨滑。／别站正中间。站边上。（旧字，无日期。年份不可考。）／从山上看城北／一清二楚／心里发毛（三种笔迹，接写；与前文非同一日。无日期。）',
    },
    {
      id: 'qinglan-board-tail',
      type: 'paragraph',
      text: '（此为 2023—2024 年度部分。板面现存字迹仍以现场为准。）',
    },
  ],
  history: [{ at: '2025-01-08T10:00:00+08:00', by: '公园管理处', note: '年度整理' }],
  related: ['qinglan-park', 'night-climb-guide'],
};

/* ----------------------------- 夜爬数据（组件用） ----------------------------- */

export interface ClimbNode {
  text: string;
  /** 下一节点（单按钮推进） */
  next?: string;
  /** 岔口（双选项） */
  choices?: { label: string; to: string }[];
  /** 终点 */
  end?: boolean;
  /** 按钮文案覆盖 */
  cta?: string;
}

export const CLIMB_PATH: Record<string, ClimbNode> = {
  gate: {
    text: '东门的灯亮着。小卖部已经收了，玻璃门上贴着一张纸：扫码自取。你拎着水往里走。',
    next: 'stairs',
  },
  stairs: {
    text: '石阶两边是新装的矮灯，一格一格，量着你往上走。你不快。身后的车声一点一点远下去。',
    next: 'pavilion',
  },
  pavilion: {
    text: '半山亭。你歇了一会儿。山里有风，风里还有城的声音，听不真切——像远处有人在低声说话。',
    next: 'fork',
  },
  fork: {
    text: '前面分岔。直上是主道；右手边是山脊步道的入口，一块牌子立在那里：每日 6:00—17:30。没有写为什么。',
    choices: [
      { label: '走主道', to: 'main' },
      { label: '走山脊步道', to: 'ridge1' },
    ],
  },
  main: {
    text: '你走了主道。石阶一直接着石阶，偶尔有夜爬的人从上面下来，背着包，跟你错身而过。到顶了。',
    next: 'summit',
  },
  ridge1: {
    text: '你走了山脊。风比主道大。没有人拦你——这个点，没有巡山的人，也没有别的人。只有那块牌子，你从它旁边走过去了。',
    cta: '继续走',
    next: 'ridge2',
  },
  ridge2: {
    text: '走到一半，你想起那句话。你站到了边上。风从背后过来，在你背后停了一会儿——像有人在你身后站了很久。你没有回头。等你回头看的时候，那里只有风。',
    cta: '继续走',
    next: 'summit',
  },
  summit: {
    text: '望城台到了。城在你脚下铺开。你跟着看过的那些东西，现在都在下面：万达、站前街，和那条你看不出有什么两样的路。你看了一会儿。风很稳。然后你忽然确定：刚才有一小段——你在看城的那一小段——有人在看你。你想不清是哪一段。回头看：没有人。',
    cta: '走到留言板前',
    next: 'board',
  },
  board: {
    text: '板上那些字都在。最下面，多了一行，铅笔写的，很浅：\n今天有人上来吗。',
    cta: '下山',
    next: 'down',
  },
  down: {
    text: '你下山了。台阶一格一格。到东门，回头看了一眼：山上一片黑。你想起来，十点过了，灯早关了。——这样最好。',
    cta: '结束',
    end: true,
  },
};

export const QINGLAN_ENTRIES: WikiEntry[] = [
  qinglanPark,
  qinglanClosure,
  argusSideNote,
  argusLeavers,
  nightClimb,
  qinglanBoard,
];