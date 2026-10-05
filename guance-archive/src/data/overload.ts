import type { WikiEntry } from '@/types';

/* ------------------------------------------------------------------ *
 * 12·14 专项观测行动 —— "观测过载"事件组。
 *
 * 作者指示（本轮定案）：代入上层的真实视角——没有人知道机制，
 * 规则都是从现象推断出来的；推断会偏离、会遗漏，代价是人命。
 * 这一组文书就是"奇怪规则"的诞生现场：
 *
 * - 行动方案：把围观者"纳入正式观测序列"——他们以为在消除噪音，
 *   实际上在往通道里加观测密度（推断的偏离）；
 * - 值班记录：大功率广播（高信息来源）与观测窗口重叠，全线越线、
 *   白场 4 分 07 秒；
 * - 复盘纪要：根因争论被搁置（广播前九分钟三号位已越线），
 *   但规则必须立——规则是推出来的，不是想出来的；
 * - "白溢"口径：他们连术语都没定准（"负荷"为工作词），
 *   承认认知有限——但口径先行。
 *
 * 投放链（三层递进）：
 *   读 12·07 正文（任一块） → 事件条目 + 值班记录；
 *   读事件条目经过段       → 行动方案 + 配发告知书；
 *   读值班记录"场内为白"段 → 复盘纪要 + "白溢"口径。
 * ------------------------------------------------------------------ */

const event1214: WikiEntry = {
  slug: 'event-1214',
  title: '12·14 专项观测行动',
  category: 'event',
  reveal: { afterSeen: ['event-1207-summary', 'event-1207-review', 'event-1207-quote'] },
  blocks: [
    { id: 'event-1214-h-course', type: 'heading', text: '事件经过' },
    {
      id: 'event-1214-summary',
      type: 'paragraph',
      text: '2024 年 12 月 14 日晚，我区在北环路地下通道及周边区域开展专项观测行动。行动期间，现场观测通道负荷超出预期，出现短暂白场，行动于 22 时后中止。当晚在位人员已全部撤离，行动材料封存。',
    },
    { id: 'event-1214-h-after', type: 'heading', text: '事后处置' },
    {
      id: 'event-1214-disposal',
      type: 'paragraph',
      text: '12 月 15 日起，北环路地下通道 22:00 后暂停通行。本次行动的器材清点与材料整理同步进行，相关材料按内部口径归档，不逐项发布。',
    },
    { id: 'event-1214-h-review', type: 'heading', text: '系统复核' },
    {
      id: 'event-1214-review',
      type: 'paragraph',
      text: '复核结论：本次行动总体受控，未发现人员异常。',
      // 已登记的结论是化石：永不漂移
      driftable: false,
    },
    { id: 'event-1214-h-attach', type: 'heading', text: '附件' },
    {
      id: 'event-1214-attach',
      type: 'list',
      items: [
        '行动方案（摘录，另卷）',
        '行动值班记录（另卷）',
        '联合复盘会议纪要（另卷）',
      ],
    },
  ],
  history: [
    { at: '2024-12-15T10:20:00+08:00', by: '值班室', note: '生成事件条目' },
    {
      at: '2024-12-22T09:40:00+08:00',
      by: '系统',
      note: '复核确认：按内部口径执行',
      overwritten: true,
      // 被覆盖的原文才是当时的事实。
      underlyingText: '现场清核：复现 5 名，其余人员搜寻中。通道通行设施完好在用。',
    },
  ],
  related: ['event-1207', 'record-loop-log'],
};

const dutyRecord1214: WikiEntry = {
  slug: 'record-1214-duty',
  title: '12·14 行动值班记录',
  category: 'record',
  reveal: { afterSeen: ['event-1207-summary', 'event-1207-review', 'event-1207-quote'] },
  blocks: [
    {
      id: 'record-1214-duty-note',
      type: 'paragraph',
      text: '以下为行动当夜的指挥值班记录，按记录时间排列，原样照录。',
    },
    {
      id: 'record-1214-duty-1',
      type: 'paragraph',
      text: '21:00　行动开始。各圈层按序上线。核心圈观测员 12 名就位，观-5 型 12 台在线；近区圈观-3 型 200 台在线；外围圈点位 16 个在线。',
    },
    {
      id: 'record-1214-duty-2',
      type: 'paragraph',
      text: '21:12　各圈层报数：稳定。',
    },
    {
      id: 'record-1214-duty-3',
      type: 'paragraph',
      text: '21:47　各点位计示平稳。指挥部指示：进入稳定段。',
    },
    {
      id: 'record-1214-duty-4',
      type: 'paragraph',
      text: '22:00　按方案第 4 条，决定于 22:05 进行信息同步（大功率广播，覆盖全部圈层）。',
    },
    {
      id: 'record-1214-duty-5',
      type: 'paragraph',
      text: '22:05　广播试线。正常。',
    },
    {
      id: 'record-1214-duty-6',
      type: 'paragraph',
      text: '22:07　广播开始。内容为行动说明与统一口径。',
    },
    {
      id: 'record-1214-duty-7',
      type: 'paragraph',
      text: '22:07（补记）广播开始后约十几秒，各点位通道计示同时上扬。三号位报告：“预算条在走。”',
    },
    {
      id: 'record-1214-duty-8',
      type: 'paragraph',
      text: '22:08　全线越线。通话中断 11 秒。',
    },
    {
      id: 'record-1214-duty-white',
      type: 'paragraph',
      text: '22:09　通话恢复。核心段报告：场内为白。',
    },
    {
      id: 'record-1214-duty-9',
      type: 'paragraph',
      text: '22:13　白场止。持续 4 分 07 秒。此后各点位计示回落至基线。',
    },
    {
      id: 'record-1214-duty-10',
      type: 'paragraph',
      text: '22:20　清点开始。',
    },
    {
      id: 'record-1214-duty-tail',
      type: 'paragraph',
      text: '（记录至此。清点与搜寻情况另卷。）',
    },
    {
      id: 'record-1214-duty-sign',
      type: 'paragraph',
      text: '记录人：值班室',
    },
  ],
  history: [{ at: '2024-12-15T08:30:00+08:00', by: '值班室', note: '整理归档' }],
};

const plan1214: WikiEntry = {
  slug: 'record-1214-plan',
  title: '12·14 专项观测行动方案（摘录）',
  category: 'record',
  reveal: { afterSeen: ['event-1214-summary'] },
  blocks: [
    {
      id: 'record-1214-plan-intro',
      type: 'paragraph',
      text: '以下为行动方案的摘录，完整版未收录。',
    },
    { id: 'record-1214-plan-h-purpose', type: 'heading', text: '一、目的' },
    {
      id: 'record-1214-plan-purpose',
      type: 'paragraph',
      text: '核清北环路地下通道及周边现象的基础参数，一次性取得稳定数据。',
    },
    { id: 'record-1214-plan-h-deploy', type: 'heading', text: '二、部署（三圈层）' },
    {
      id: 'record-1214-plan-deploy',
      type: 'list',
      items: [
        '核心圈：通道内观测员 12 名，配观-5 型综合观测仪，具备多通道综合观测能力，分四组错峰上线。',
        '近区圈：站前街—北环路口沿街居民与商户，配发观-3 型手持观测仪 200 台，定向发放，签收回执。',
        '外围圈：路侧传感点位 16 个，按既有方案运行。',
      ],
    },
    { id: 'record-1214-plan-h-stability', type: 'heading', text: '三、稳定保障' },
    {
      id: 'record-1214-plan-stability',
      type: 'paragraph',
      text: '为防止自发目击与私自记录干扰数据，本次行动将周边可能目击的人员纳入正式观测序列，统一配发、统一口径。行动期间的社会面解释工作，按配发告知书执行。',
    },
    { id: 'record-1214-plan-h-sync', type: 'heading', text: '四、信息同步' },
    {
      id: 'record-1214-plan-sync',
      type: 'paragraph',
      text: '行动进入稳定段后（预计 22:00 前后），经指挥部批准，进行大功率广播信息同步一次，统一在场人员口径，避免多源叙述。',
    },
    { id: 'record-1214-plan-h-other', type: 'heading', text: '五、其他' },
    {
      id: 'record-1214-plan-other',
      type: 'paragraph',
      text: '本次行动材料一律不对外发布。行动结束前，任何人不得离开观测区域。',
    },
  ],
  history: [{ at: '2024-12-13T16:00:00+08:00', by: '指挥部', note: '印发' }],
};

const notice1214: WikiEntry = {
  slug: 'record-1214-notice',
  title: '观测仪配发告知书',
  category: 'record',
  reveal: { afterSeen: ['event-1214-summary'] },
  blocks: [
    {
      id: 'record-1214-notice-intro',
      type: 'paragraph',
      text: '为保障本次专项观测行动期间各项数据稳定，现向您配发手持观测仪一台（观-3 型）。请按以下事项使用。',
    },
    {
      id: 'record-1214-notice-items',
      type: 'list',
      items: [
        '一、收到后请保持包装完整。行动开始前，请勿取出。',
        '二、行动期间，请将仪器置于家中临通道一侧的窗边，无需操作。',
        '三、请勿自行开启仪器。请勿与他人交换查看结果。请勿与他人谈论本次配发。',
        '四、如仪器指示灯亮起常白，请勿触碰，离开房间，等待工作人员上门处理。',
        '五、行动结束后，工作人员将统一回收仪器。回收时请交回全部附件，包括本告知书。',
      ],
    },
    {
      id: 'record-1214-notice-tail',
      type: 'paragraph',
      text: '感谢您对本次行动的理解与配合。',
    },
    {
      id: 'record-1214-notice-sign',
      type: 'paragraph',
      text: '联合观测行动指挥部　2024 年 12 月 13 日',
    },
    {
      id: 'record-1214-notice-note',
      type: 'paragraph',
      text: '（本页为留存样本。）',
    },
  ],
  history: [{ at: '2024-12-13T17:00:00+08:00', by: '指挥部', note: '随仪器配发' }],
};

const review1214: WikiEntry = {
  slug: 'record-1214-review',
  title: '12·20 联合复盘会议纪要',
  category: 'record',
  // 读过值班记录"场内为白"那一段之后：复盘现场才向读者打开。
  reveal: { afterSeen: ['record-1214-duty-white'] },
  blocks: [
    {
      id: 'record-1214-review-head',
      type: 'list',
      items: [
        '时间：2024 年 12 月 20 日 14:00—17:40',
        '地点：（略）',
        '参会：市政养护中心、内容审核组、应急管理组、设备技术组、各点位负责人',
        '记录：值班室',
      ],
    },
    { id: 'record-1214-review-h1', type: 'heading', text: '一、情况回顾' },
    {
      id: 'record-1214-review-1',
      type: 'paragraph',
      text: '会议听取了 12·14 专项观测行动的全过程汇报。行动于 12 月 14 日 21:00 启动，22:07 发生通道负荷超限，伴随白场 4 分 07 秒。22:20 起组织清点。12 月 15 日起，通道 22 时后暂行封闭；本次会议予以追认，长期执行。',
    },
    { id: 'record-1214-review-h2', type: 'heading', text: '二、清点口径' },
    {
      id: 'record-1214-review-2',
      type: 'paragraph',
      text: '当晚在位人员的核定，各处口径不一：签到 12 名；哨位报告 11 名；仪器在线 200 台；实地复现 5 名。会议决定：对外表述按最小口径执行；未复现人员的清核另组进行，不并入本纪要。',
    },
    { id: 'record-1214-review-h3', type: 'heading', text: '三、成因讨论' },
    {
      id: 'record-1214-review-3',
      type: 'paragraph',
      text: '技术组汇报：信息同步（大功率广播）与观测窗口重叠，为本次超限的直接触发因素。',
    },
    {
      id: 'record-1214-review-4',
      type: 'paragraph',
      text: '有意见指出：调看仪器原始数据，广播前约九分钟，三号位计示已经越线，而值班记录未体现。根因不能归于广播一项。',
    },
    {
      id: 'record-1214-review-5',
      type: 'paragraph',
      text: '会议认为：成因未尽明确。现有两条认识——观测密度本身消耗通道负荷；高信息源会短时推高负荷占用——均可作为立规依据。会上另有未达成一致的意见三处，未记入本纪要。',
    },
    { id: 'record-1214-review-h4', type: 'heading', text: '四、决议' },
    {
      id: 'record-1214-review-6',
      type: 'list',
      items: [
        '1. 停止向非处置人员配发观测仪器；已配发的，限期回收。回收清单与发放清单分别登记，不得并表。',
        '2. 信息同步不得与观测行动同时段安排；同一区域，一自然日内信息同步不超过一次。',
        '3. 现场观测纪律：同一目标，同时观测不超过一台仪器；不得相互校正读数，不得复述计示。',
        '4. 北环路地下通道 22:00 后暂停通行，长期执行，另行公告。',
        '5. 同类情形的登记与发布，按《“白溢”类事件登记口径（试行）》执行。',
      ],
    },
    { id: 'record-1214-review-h5', type: 'heading', text: '五、会后' },
    {
      id: 'record-1214-review-7',
      type: 'paragraph',
      text: '会议要求：本次情况向各班组传达，传达不得记录。类似代价，不得再出现。',
    },
    {
      id: 'record-1214-review-tail',
      type: 'paragraph',
      text: '（本纪要按最简口径归档。）',
    },
  ],
  history: [{ at: '2024-12-20T18:10:00+08:00', by: '值班室', note: '定稿归档' }],
};

const baiyiCaliber: WikiEntry = {
  slug: 'record-baiyi',
  title: '“白溢”类事件登记口径（试行）',
  category: 'protocol',
  // 与复盘纪要同批：决议的配套文件。
  reveal: { afterSeen: ['record-1214-duty-white'] },
  blocks: [
    {
      id: 'record-baiyi-intro',
      type: 'paragraph',
      text: '本口径由内容审核组拟制，自 2024 年 12 月 22 日起试行。',
    },
    {
      id: 'record-baiyi-items',
      type: 'list',
      items: [
        '一、本口径用于登记“观测通道负荷在短时间内显著超限、并伴随现象外溢”的事件。',
        '二、称“白溢”者，取外溢时的白场特征；其与此前“白影”记载是否同源，尚不能判定，登记时分开表述。',
        '三、“负荷”为工作词，限于内部文书使用；其定义与计量方式随认知更新，本口径不作固定。',
        '四、登记要件：现场计示记录（或等效记录）；在场观测者陈述；事后清点口径说明。三项缺一者，按“待核”登记。',
        '五、已登记情形：BL-01（11·08 北环路聚集事件，追认）；BL-02（12·14 专项观测行动）。',
        '六、本口径为试行；此前与今后凡有同类情形，一律按本口径登记。因认知更新需要调整的，不溯及既往。',
        '七、本口径内容不得对外转述、引用。',
      ],
    },
    {
      id: 'record-baiyi-tail',
      type: 'paragraph',
      text: '（认知有限，口径先行。）',
    },
  ],
  history: [{ at: '2024-12-22T09:00:00+08:00', by: '内容审核组', note: '拟制并试行' }],
};

export const OVERLOAD_ENTRIES: WikiEntry[] = [
  event1214,
  dutyRecord1214,
  plan1214,
  notice1214,
  review1214,
  baiyiCaliber,
];