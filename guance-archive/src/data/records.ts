import type { WikiEntry } from '@/types';

/* ------------------------------------------------------------------ *
 * 12·07 相关记录（四份互不印证 + 一份转写稿）。
 *
 * 四份记录各自局部成立，合起来互相扣不上：这是"跨通道不能互证"在内容层的
 * 直接实现——不需要面板、不需要对照表，矛盾只要求玩家记得。
 *
 * 全部 `unlisted`：不出现在目录与首页推荐，只能经由检索抵达。
 * 它们互相之间不引用、与事件词条之间也不互相引用——凑齐需要玩家自己跳转与回访，
 * 站内不得提示"还差几份"。目录页已经写了口径："未列入目录的文书不参与站内浏览。"
 * ------------------------------------------------------------------ */

const siteRecord: WikiEntry = {
  slug: 'record-1207-site',
  title: '12·07 现场记录',
  category: 'record',
  unlisted: true,
  blocks: [
    {
      id: 'record-1207-site-summary',
      type: 'paragraph',
      text: '记录时间：2024 年 12 月 7 日 21:47—22:20。记录人：城北新区市政养护中心巡视组。',
    },
    {
      id: 'record-1207-site-body',
      type: 'paragraph',
      text: '21:47 到场。通道内无滞留人员。照明、排水、广告屏运行正常。21:52 自北口步行至南口，全程复核一遍，未见遗留物与异常痕迹。',
    },
    {
      id: 'record-1207-site-check',
      type: 'paragraph',
      // 与值班报告"21:40 接北口反馈、21:41 有出站记录"直接冲突：这份说没有记录、没有来电。
      text: '22:05 与值班室通话确认：当班期间未接到与通道相关的来电，北口闸机日志中无 21:00 之后的异常记录。',
    },
    {
      id: 'record-1207-site-quote',
      type: 'quote',
      text: '归档意见：本记录与系统复核结论一致。已完成归档，不再补充。',
    },
  ],
  history: [
    {
      at: '2024-12-08T07:40:00+08:00',
      by: '巡视组',
      note: '录入现场记录',
    },
  ],
};

const deviceRecord: WikiEntry = {
  slug: 'record-1207-device',
  title: '12·07 设备日志',
  category: 'record',
  unlisted: true,
  blocks: [
    {
      id: 'record-1207-device-summary',
      type: 'paragraph',
      text: '导出范围：2024 年 12 月 7 日 20:00—23:00。导出人：城北新区综合管理平台运维。',
    },
    {
      id: 'record-1207-device-table',
      type: 'table',
      rows: [
        ['点位', '运行状态', '备注'],
        ['2 号', '正常', '21:33—21:44 无记录写入'],
        ['3 号', '正常', '—'],
        ['4 号', '正常', '21:33—21:44 无记录写入'],
        ['5 号', '正常', '一帧行人影像，识别置信度不足，无法确认人数'],
      ],
    },
    {
      id: 'record-1207-device-note',
      type: 'paragraph',
      // "无记录写入不等于设备停机"——低等级观测缺失但不得主动冲突的台账写法。
      text: '说明：无记录写入不等于设备停机。该时段各点位的设备状态返回均为正常，已在运维台账中另行登记。',
    },
  ],
  history: [
    {
      at: '2024-12-08T09:05:00+08:00',
      by: '平台运维',
      note: '导出设备日志并登记',
    },
  ],
};

const dutyRecord: WikiEntry = {
  slug: 'record-1207-duty',
  title: '12·07 值班报告',
  category: 'record',
  unlisted: true,
  blocks: [
    {
      id: 'record-1207-duty-summary',
      type: 'paragraph',
      text: '报告编号 QX-1207-02。报告人：当班值班员。',
    },
    {
      id: 'record-1207-duty-body',
      type: 'paragraph',
      // 与现场记录、家属陈述同时冲突：说三人正常出站并已登记为维护人员。
      text: '21:40 接北口保安反馈，称有三人从北口进入通道。21:41 北口闸机记录显示三人出站，登记为晚班维护人员，未见异常。',
    },
    {
      id: 'record-1207-duty-call',
      type: 'paragraph',
      text: '22:30 接来电询问三名人员去向，答复：未接到异常报告，可参照闸机通行记录核对。',
    },
    {
      id: 'record-1207-duty-quote',
      type: 'quote',
      text: '交接事项：出入记录已同步至综合管理平台。本班无其他异常。',
    },
  ],
  history: [
    {
      at: '2024-12-08T06:30:00+08:00',
      by: '值班室',
      note: '打印并归档值班报告',
    },
  ],
};

const familyRecord: WikiEntry = {
  slug: 'record-1207-family',
  title: '12·07 家属陈述',
  category: 'record',
  unlisted: true,
  blocks: [
    {
      id: 'record-1207-family-summary',
      type: 'paragraph',
      text: '陈述人：失联人员家属。记录时间：2024 年 12 月 9 日 14:00。记录人：城西分局接待窗口。',
    },
    {
      id: 'record-1207-family-body',
      type: 'paragraph',
      // 与"失联事件"及值班报告同时冲突：家属坚称三人当晚在城西，且未去过城北。
      text: '家属称：三人当晚在城西聚餐，21:00 前各自返回家中，未去过城北新区，也从未提起过北环路。当晚三人都能正常联系。',
    },
    {
      id: 'record-1207-family-lost',
      type: 'paragraph',
      text: '12 月 8 日中午起，三人电话先后无法接通，微信均无回复。家属已于居住地派出所登记寻人。',
    },
    {
      id: 'record-1207-family-quote',
      type: 'quote',
      text: '家属补充：他们要是真去了北环路，会跟我说的。',
    },
  ],
  history: [
    {
      at: '2024-12-09T14:20:00+08:00',
      by: '接待窗口',
      note: '录入家属陈述',
    },
  ],
};

/* ----------------------------- 转写稿 ----------------------------- */

const transcript1207: WikiEntry = {
  slug: 'record-1207-transcript',
  title: '12·07 询问记录（转写稿）',
  category: 'record',
  unlisted: true,
  blocks: [
    {
      id: 'record-1207-transcript-head',
      type: 'paragraph',
      // 声学通道不迁移：录音没有声音，只以文字出现。
      text: '以下为 2024 年 12 月 10 日询问记录的文字转写，未做删改。录音原件已归档，不提供播放。',
    },
    {
      id: 'record-1207-transcript-1',
      type: 'paragraph',
      text: '00:11:04　问：你那天晚上几点到的北环路？',
    },
    {
      id: 'record-1207-transcript-2',
      type: 'paragraph',
      text: '00:11:09　答：九点四十七。北口。',
    },
    {
      id: 'record-1207-transcript-3',
      type: 'paragraph',
      text: '00:11:12　[此处无人说话 4.2 秒]',
    },
    {
      id: 'record-1207-transcript-4',
      type: 'paragraph',
      text: '00:11:16　问：谁回答的？',
    },
    {
      id: 'record-1207-transcript-5',
      type: 'paragraph',
      text: '00:11:19　答：我当时一个人。',
    },
  ],
  history: [
    {
      at: '2024-12-10T16:00:00+08:00',
      by: '记录室',
      note: '完成转写并归档',
    },
  ],
};

export const RECORD_ENTRIES: WikiEntry[] = [
  siteRecord,
  deviceRecord,
  dutyRecord,
  familyRecord,
  transcript1207,
];