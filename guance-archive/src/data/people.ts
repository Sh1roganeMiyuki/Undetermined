import type { WikiEntry } from '@/types';

/* ------------------------------------------------------------------ *
 * 人员词条（第一幕初始清单：张工、许衡、唐继）。
 *
 * 全部为平实的行政登记体：工位表、经手记录、职责范围。
 * 人物立场与裂痕属于后续幕次的展开内容，此处只让名字先"出现过"——
 * 玩家第二遍翻回来看时，会觉得这几页本来就什么都有，只是当时没注意。
 * ------------------------------------------------------------------ */

const zhangGong: WikiEntry = {
  slug: 'person-zhang',
  title: '张工',
  category: 'personnel',
  blocks: [
    {
      id: 'person-zhang-summary',
      type: 'paragraph',
      text: '张工，城北新区市政养护中心维修班组成员，负责北环路及站前街片区的设施维修。同事均以“张工”称呼。',
    },
    { id: 'person-zhang-h-duty', type: 'heading', text: '职责范围' },
    {
      id: 'person-zhang-duty',
      type: 'paragraph',
      text: '负责照明灯具、排水泵房、电子广告屏等设备的日常巡检与应急到场。应急到场响应时限为接报后一小时。',
    },
    { id: 'person-zhang-h-records', type: 'heading', text: '经手记录（摘录）' },
    {
      id: 'person-zhang-records',
      type: 'list',
      items: [
        '2024-11-29 03:22 北环路地下通道 2 号广告屏异常，到场处置（详见《11·29 电子屏异常》）',
        '2024-11-30 北环路地下通道照明及排水例行巡检',
        '2024-12-08 北环路地下通道设备例行检查，未发现问题',
      ],
    },
    {
      id: 'person-zhang-note',
      type: 'paragraph',
      text: '维修记录由本人填写，值班室核对后归档。记录归档后不作补记。',
    },
  ],
  history: [
    { at: '2024-09-10T09:30:00+08:00', by: '市政养护中心', note: '录入人员信息' },
    { at: '2024-11-29T08:20:00+08:00', by: '值班室', note: '补充 11 月 29 日处置记录' },
  ],
  related: ['event-1129', 'north-loop-tunnel'],
};

const xuHeng: WikiEntry = {
  slug: 'person-xuheng',
  title: '许衡',
  category: 'personnel',
  blocks: [
    {
      id: 'person-xuheng-summary',
      type: 'paragraph',
      text: '许衡，内容审核组成员，负责条目复核与记录整理。',
    },
    { id: 'person-xuheng-h-records', type: 'heading', text: '经手条目（摘录）' },
    {
      id: 'person-xuheng-records',
      type: 'list',
      items: [
        '《新编辑须知（临时版）》2024-11-02 发布',
        '《11·29 电子屏异常》2024-12-01 现场处置细节',
        '《12·07 三人失联事件》2024-12-08 现场处置细节',
      ],
    },
    {
      id: 'person-xuheng-note',
      type: 'paragraph',
      // 与讨论页里他凌晨 01:02 发帖的气质一致：不解释，只留痕。
      text: '许衡提交的复核记录多在夜间。按工作细则，复核记录不设答复时限。',
    },
  ],
  history: [
    { at: '2024-08-05T14:10:00+08:00', by: '内容审核组', note: '录入人员信息' },
    { at: '2024-11-20T10:00:00+08:00', by: '内容审核组', note: '补充经手条目' },
  ],
  related: ['new-editor-guide', 'event-1129', 'event-1207'],
};

const tangJi: WikiEntry = {
  slug: 'person-tangji',
  title: '唐继',
  category: 'personnel',
  blocks: [
    {
      id: 'person-tangji-summary',
      type: 'paragraph',
      text: '唐继，城北新区综合管理平台技术负责人。',
    },
    {
      id: 'person-tangji-duty',
      type: 'paragraph',
      // 立场以行政语言呈现：不站队、不引用他后来的表态（那是第四幕的内容）。
      text: '负责平台二期建设，牵头推进监控点位加密与记录留存工作。在其建议下，北环路地下通道、白昼馆等区域的监控点位先后完成加密。',
    },
    {
      id: 'person-tangji-note',
      type: 'paragraph',
      text: '平台各期建设方案均经专题会审议通过。相关台账以平台导出记录为准。',
    },
  ],
  history: [
    { at: '2024-07-18T15:40:00+08:00', by: '综合管理平台', note: '录入人员信息' },
    { at: '2024-10-09T11:25:00+08:00', by: '综合管理平台', note: '记录二期建设分工' },
  ],
  // 第四幕（对抗）：复盘纪要“成因未尽明确”那一块之后，现场的人开口了。
  // 他的立场必须在技术上说得通：高精度路线确实有效，代价是僵化——
  // 而他把“代价”和“失去人”做了他自己的比较（2019 冷库，01 EX-07/EX-08 首次入戏）。
  revisions: [
    {
      title: '2024 年 12 月增补 · 讨论发言摘录',
      reveal: { afterSeen: ['record-1214-review-5'] },
      blocks: [
        {
          id: 'person-tangji-rev1-head',
          type: 'paragraph',
          text: '以下摘自 12 月 20 日联合复盘会议分组讨论环节的发言记录，未做删改。',
        },
        {
          id: 'person-tangji-rev1-1',
          type: 'paragraph',
          text: '唐继：2019 年，我在老系统。那次断电不长，四十来分钟。电来了以后，我们从头过名单——少了一个人。有人说，先把电稳住，别的以后再说。我听懂了这句话的意思。从那以后我认死一件事：记录做牢，不能再有谁从名单上掉出去。（现场另有人插话，未记。）',
        },
        {
          id: 'person-tangji-rev1-2',
          type: 'paragraph',
          text: '唐继：今天会上讲的两条——密度消耗负荷，信息源推高占用——我认。方案我按决议改。',
        },
        {
          id: 'person-tangji-rev1-3',
          type: 'paragraph',
          text: '唐继：但有一条我不认：少看一点。少看，就等于又把维持交还给运气。2019 年那次就是运气不好。我不接受第二次。',
        },
        {
          id: 'person-tangji-rev1-4',
          type: 'quote',
          text: '我宁愿在过载中维持稳定，也不愿在黑暗中失去人。',
        },
        {
          id: 'person-tangji-rev1-tail',
          type: 'paragraph',
          text: '（本摘录经本人核对。其余发言不随本件发布。）',
        },
      ],
    },
  ],
  related: ['north-loop-tunnel', 'daylight-house'],
};

export const PERSON_ENTRIES: WikiEntry[] = [zhangGong, xuHeng, tangJi];