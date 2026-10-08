import type { ReconstructSceneData, WikiEntry } from '@/types';

/* ------------------------------------------------------------------ *
 * 章 2 · 白昼馆：正文内容（第一批）。
 *
 * 巡楼记录与证词各自成立、互不指认：记录里全是"正常。"，
 * 证词里却有灯、有影子、有味道。凑齐靠玩家自己（均 unlisted，仅检索可达；
 * 检索可达不等于第一天可达——四件的投放门都挂在白昼馆词条的在住名录上，见下）。
 * ------------------------------------------------------------------ */

/**
 * 白昼馆线的共用投放门。
 *
 * 锚点选在住名录一带（名录表、尾注、长住登记任一段真正看过即可）：
 * 那是白昼馆词条里唯一会出现"508（未登记称呼）"的地方——读者读到它，
 * 才会去检索"询问记录"。三个 id 并列是多入射角，不是三重门：任一满足即开。
 *
 * 缺这道门时，第一天检索"白昼馆 询问"就能直取三份证词与巡楼记录，
 * 幕三整条线（证词 → 老周口述 → 巡楼 12 月 → 监控摘要 → 程露手记 → 征询）当场摊开。
 */
const DAYLIGHT_LINE_GATE = {
  afterSeen: ['daylight-house-roll', 'daylight-house-roll-note', 'daylight-house-register'],
};

/**
 * 《白昼馆巡楼记录》—— 章 2 · 单元 2（层 1）。
 *
 * 每一行都是"正常。"——包括 11 月 21 日那一夜。
 * 底部口径"只登记异常"是真实台账制度：正因为它只登记异常，
 * 老周在证词里闻到的"雨后的味道"没出现在这里——两处各自成立。
 */
export const daylightPatrol: WikiEntry = {
  slug: 'record-daylight-patrol',
  title: '白昼馆巡楼记录',
  category: 'record',
  unlisted: true,
  reveal: DAYLIGHT_LINE_GATE,
  blocks: [
    {
      id: 'record-daylight-patrol-intro',
      type: 'paragraph',
      text: '本页为白昼馆 2024 年 11 月巡楼记录摘录，由夜班值守岗填写。',
    },
    {
      id: 'record-daylight-patrol-table',
      type: 'table',
      rows: [
        ['日期', '巡楼时间', '记录'],
        ['11.19', '23:10、01:30', '正常。'],
        ['11.20', '23:05、01:45', '正常。'],
        ['11.21', '23:05、01:40', '正常。'],
        ['11.22', '23:15、01:35', '正常。'],
        ['11.23', '23:00、01:50', '正常。'],
      ],
    },
    {
      id: 'record-daylight-patrol-note',
      type: 'paragraph',
      text: '巡楼记录只登记异常。各层门禁、照明与公共区域状态由系统日报另行汇总。',
    },
  ],
  history: [
    { at: '2024-11-30T08:30:00+08:00', by: '值守岗', note: '按期整理' },
  ],
};

/**
 * 《白昼馆巡楼记录（12 月）》—— 11 月同簿的续页。
 *
 * 纪律：
 * - 通篇“正常。”，含 12.04（毛巾人偶当日）——白天的事一个字不写；
 * - 簿内夹页的一幅铅笔小图：不解释画的是什么（“一排均匀的小点”），
 *   也不解释为何在“记。定期看。”之后它才出现；
 * - 夹页位置只给物理事实（12.06 与 12.07 两页之间）。
 */
export const daylightPatrolDec: WikiEntry = {
  slug: 'record-daylight-patrol-dec',
  title: '白昼馆巡楼记录（12 月）',
  category: 'record',
  unlisted: true,
  // 投放：读过 11 月表尾的“巡楼记录只登记异常”之后——同一本簿子翻到了下一章。
  reveal: { afterSeen: ['record-daylight-patrol-note'] },
  blocks: [
    {
      id: 'record-daylight-patrol-dec-intro',
      type: 'paragraph',
      text: '本页为白昼馆 2024 年 12 月巡楼记录摘录，与 11 月同簿。',
    },
    {
      id: 'record-daylight-patrol-dec-table',
      type: 'table',
      rows: [
        ['日期', '巡楼时间', '记录'],
        ['12.01', '23:10、01:45', '正常。'],
        ['12.02', '23:05、01:40', '正常。'],
        ['12.03', '23:10、01:40', '正常。'],
        ['12.04', '23:05、01:45', '正常。'],
        ['12.05', '23:12、01:50', '正常。'],
        ['12.06', '23:08、01:38', '正常。'],
        ['12.07', '23:05、01:42', '正常。'],
        ['12.08', '23:10、01:45', '正常。'],
        ['12.09', '23:15、01:40', '正常。'],
        ['12.10', '23:05、01:48', '正常。'],
        ['12.11', '23:10、01:42', '正常。'],
        ['12.12', '23:08、01:45', '正常。'],
        ['12.13', '23:05、01:40', '正常。'],
        ['12.14', '23:12、01:45', '正常。'],
        ['12.15', '23:10、01:42', '正常。'],
      ],
    },
    {
      id: 'record-daylight-patrol-dec-tail',
      type: 'paragraph',
      text: '（本页抄录到此。其后记录仍为每夜两行。）',
    },
    {
      id: 'record-daylight-patrol-dec-note',
      type: 'paragraph',
      text: '（另：本子内夹有一幅铅笔小图，夹在 12.06 与 12.07 两页之间。照摹如下。）',
    },
    {
      id: 'record-daylight-patrol-dec-drawing',
      type: 'image',
      alt: '巡楼记录簿内夹页上的铅笔小图（照摹）',
      src: '/img/record-daylight-patrol-dec-drawing.jpg',
      prompt:
        '铅笔手绘草图：走廊俯视简图，四个方形门标记，两个小圆圈代灯，一段矩形地毯，地毯上画着一排间距均匀的小圆点；浅色纸张，笔迹轻而干净，无文字标注 ／ pencil sketch on light paper, corridor plan, four door marks, two circles as lights, a rectangular rug with an evenly spaced row of tiny dots, clean faint strokes, no text or labels',
    },
  ],
  history: [{ at: '2025-01-10T09:00:00+08:00', by: '物业值守岗', note: '按期整理' }],
};

/**
 * 《白昼馆询问记录（一）》—— 罗某（三层住户，退休教师）。
 * 她看到"两三个影子"，灯忽明忽暗——与巡楼记录的"正常。"、与其他证词的数目都不同。
 * 转写体：与 12·07 询问记录同规格。
 */
export const testimonyA: WikiEntry = {
  slug: 'testimony-a',
  title: '白昼馆询问记录（一）',
  category: 'record',
  unlisted: true,
  reveal: DAYLIGHT_LINE_GATE,
  blocks: [
    {
      id: 'testimony-a-head',
      type: 'paragraph',
      text: '以下为 2024 年 11 月 26 日询问记录的文字转写，未做删改。录音原件已归档，不提供播放。',
    },
    { id: 'testimony-a-subject', type: 'paragraph', text: '被询问人：罗某（三层住户）。' },
    { id: 'testimony-a-1', type: 'paragraph', text: '14:02　问：11 月 21 日晚上，您在馆里吗？' },
    { id: 'testimony-a-2', type: 'paragraph', text: '14:03　答：在。我那几天睡得浅，十一点多还没睡。' },
    { id: 'testimony-a-3', type: 'paragraph', text: '14:05　问：那晚您看到什么了吗？' },
    {
      id: 'testimony-a-4',
      type: 'paragraph',
      text: '14:06　答：我在三层的沙发那儿坐着。连廊尽头有人过去。好几个。',
    },
    { id: 'testimony-a-5', type: 'paragraph', text: '14:07　问：大概几个？' },
    { id: 'testimony-a-6', type: 'paragraph', text: '14:08　答：两三个吧。灯那会儿不好，忽明忽暗。' },
    { id: 'testimony-a-7', type: 'paragraph', text: '14:10　问：大概是几点？' },
    {
      id: 'testimony-a-8',
      type: 'paragraph',
      text: '14:11　答：十一点多。走过去没出声的。第二天我特意到走廊里站了站，白天看，那边什么也没有。',
    },
    {
      id: 'testimony-a-9',
      type: 'paragraph',
      text: '（转写到此。本份共 1 页。）',
    },
  ],
  history: [
    { at: '2024-11-26T16:00:00+08:00', by: '记录室', note: '完成转写并归档' },
  ],
};

/**
 * 《白昼馆询问记录（二）》—— 徐某（四层住户）。
 * 他说"直接回房了"——其实在四楼露台待了十分钟（偷抽烟，违反禁烟）。
 * 这个小谎此刻没有任何标记；追问的交互在后续单元接入。
 * 他证词里的"队形挺近"是四份版本中数目最准的一版。
 */
export const testimonyB: WikiEntry = {
  slug: 'testimony-b',
  title: '白昼馆询问记录（二）',
  category: 'record',
  unlisted: true,
  reveal: DAYLIGHT_LINE_GATE,
  blocks: [
    {
      id: 'testimony-b-head',
      type: 'paragraph',
      text: '以下为 2024 年 11 月 26 日询问记录的文字转写（第二份），未做删改。录音原件已归档，不提供播放。',
    },
    { id: 'testimony-b-subject', type: 'paragraph', text: '被询问人：徐某（四层住户）。' },
    { id: 'testimony-b-1', type: 'paragraph', text: '15:20　问：11 月 21 日晚上，您在馆里吗？' },
    {
      id: 'testimony-b-2',
      type: 'paragraph',
      text: '15:21　答：在。那天加班，我十一点半左右回来的。',
    },
    { id: 'testimony-b-3', type: 'paragraph', text: '15:23　问：回来之后呢？' },
    { id: 'testimony-b-4', type: 'paragraph', text: '15:24　答：直接回房了。洗漱，睡觉。' },
    { id: 'testimony-b-5', type: 'paragraph', text: '15:25　问：上楼路上，没看到什么吗？' },
    {
      id: 'testimony-b-6',
      type: 'paragraph',
      text: '15:26　答：连廊尽头……有几拨人走过去。四个吧，排得挺近的。我还想，怎么这么晚还有人搬东西。',
    },
    { id: 'testimony-b-7', type: 'paragraph', text: '15:27　问：后来呢？' },
    { id: 'testimony-b-8', type: 'paragraph', text: '15:28　答：后来就回房了。没别的了。' },
    { id: 'testimony-b-9', type: 'paragraph', text: '（转写到此。本份共 1 页。）' },
  ],
  history: [
    { at: '2024-11-26T17:10:00+08:00', by: '记录室', note: '完成转写并归档' },
  ],
};

/**
 * 《白昼馆询问记录（三）》—— 丁茂（四层长住）。
 * 四份证词里最接近真相的一版：“四个。走到一半，全都回头了。”
 * 回头不再有来源解释——它就是四版矛盾里未解开的那个差异。
 * 他隐去了自己此后做的事（41 小时），只说“正常。”——与巡楼记录的“正常。”同调。
 */
export const testimonyC: WikiEntry = {
  slug: 'testimony-c',
  title: '白昼馆询问记录（三）',
  category: 'record',
  unlisted: true,
  reveal: DAYLIGHT_LINE_GATE,
  blocks: [
    {
      id: 'testimony-c-head',
      type: 'paragraph',
      text: '以下为 2024 年 11 月 26 日询问记录的文字转写（第三份），未做删改。录音原件已归档，不提供播放。',
    },
    { id: 'testimony-c-subject', type: 'paragraph', text: '被询问人：丁茂（四层长住）。' },
    { id: 'testimony-c-1', type: 'paragraph', text: '16:40　问：11 月 21 日晚上，您在馆里吗？' },
    { id: 'testimony-c-2', type: 'paragraph', text: '16:41　答：在。那天我搬了一箱书，睡得晚。' },
    { id: 'testimony-c-3', type: 'paragraph', text: '16:43　问：那么在楼道里，听到什么了吗？' },
    { id: 'testimony-c-4', type: 'paragraph', text: '16:44　答：先是听见脚步声。好几双的，不像一个人。' },
    { id: 'testimony-c-5', type: 'paragraph', text: '16:46　问：您看到什么了？' },
    {
      id: 'testimony-c-6',
      type: 'paragraph',
      text: '16:47　答：我开门看了一眼。连廊里走过去几个人。四个。',
    },
    {
      id: 'testimony-c-7',
      type: 'paragraph',
      text: '16:48　问：能描述一下吗？',
    },
    {
      id: 'testimony-c-8',
      type: 'paragraph',
      text: '16:49　答：前后走的，挨得很近。不像散步的队形。（停了一会儿）走到一半，停了。',
    },
    { id: 'testimony-c-9', type: 'paragraph', text: '16:51　问：然后呢？' },
    {
      id: 'testimony-c-look',
      type: 'paragraph',
      text: '16:52　答：四个。走到一半，全都回头了。',
    },
    { id: 'testimony-c-10', type: 'paragraph', text: '16:53　问：回头看的方向？' },
    {
      id: 'testimony-c-11',
      type: 'paragraph',
      text: '16:54　答：朝我这边。也可能不是。（停）廊里就我一个人。',
    },
    { id: 'testimony-c-12', type: 'paragraph', text: '16:56　问：您确定是四个吗？' },
    {
      id: 'testimony-c-13',
      type: 'paragraph',
      text: '16:57　答：数目我敢肯定。别的，我不敢说。',
    },
    { id: 'testimony-c-14', type: 'paragraph', text: '16:59　问：此后几天，您的生活有异常吗？' },
    { id: 'testimony-c-15', type: 'paragraph', text: '17:00　答：正常。' },
    { id: 'testimony-c-16', type: 'paragraph', text: '17:02　问：还有要补充的吗？' },
    { id: 'testimony-c-17', type: 'paragraph', text: '17:03　答：没有了。' },
    {
      id: 'testimony-c-tail',
      type: 'paragraph',
      text: '（转写到此。本份共 2 页。）',
    },
  ],
  history: [
    { at: '2024-11-26T18:20:00+08:00', by: '记录室', note: '完成转写并归档' },
  ],
};

/**
 * 《41 小时日志节选》—— 丁茂（EX-03 的呈现层）。
 * 站内不得解释：只给“时间与数字完全一致”的事实本人叙述。
 * “回头”句（震撼 B-2）藏在末尾，不给任何后续解释。
 * 投放：读过丁茂证词“全都回头了”那一块之后，才可能在检索里出现。
 */
export const dingmaoLog: WikiEntry = {
  slug: 'record-dingmao-41h',
  title: '41 小时日志节选',
  category: 'record',
  unlisted: true,
  reveal: { afterSeen: ['testimony-c-look'] },
  blocks: [
    {
      id: 'record-dingmao-41h-head',
      type: 'paragraph',
      text: '以下为白昼馆 415 住户丁茂的个人记录节选，经本人同意收录。',
    },
    {
      id: 'record-dingmao-41h-p1',
      type: 'paragraph',
      text: '11 月 21 号夜里，看见那件事之后，我做了个决定。',
    },
    {
      id: 'record-dingmao-41h-p2',
      type: 'paragraph',
      text: '这个决定没什么道理。但它是我当时能抓住的最硬的东西：我不动。',
    },
    {
      id: 'record-dingmao-41h-p3',
      type: 'paragraph',
      text: '我不会去分析它是什么，我也不想。我只处理一个问题：它在不在找我。如果它在找，我要让它找不到。找一个会动的东西，最快的办法，就是看哪里在动。',
    },
    {
      id: 'record-dingmao-41h-p4',
      type: 'paragraph',
      text: '所以我不动。',
    },
    {
      id: 'record-dingmao-41h-p5',
      type: 'paragraph',
      text: '我把水、饼干、充电线都挪到床边。能躺着拿到的，都挪到躺着能拿到的地方。我定了时间上厕所：一天一次。',
    },
    {
      id: 'record-dingmao-41h-p6',
      type: 'paragraph',
      text: '我数呼吸。数到后面发现数字不老实，就换别的数。天花板有十一块。窗户外面，一个白天过二十七辆车。走廊里的脚步声，第一天响过四次。',
    },
    {
      id: 'record-dingmao-41h-p7',
      type: 'paragraph',
      text: '第一天白天，有人在门外喊过查水表。我没出声。',
    },
    {
      id: 'record-dingmao-41h-p8',
      type: 'paragraph',
      text: '三十个小时以后，我其实是不害怕的。我挺平静。这是我第一次知道，平静和害怕能待在同一个身体里，像两个进程，各跑各的。',
    },
    {
      id: 'record-dingmao-41h-p9',
      type: 'paragraph',
      text: '第四十一个小时，我特别清醒。我知道我成功了。我不知道我守住了什么，但我知道，那个东西已经不在我这条线上了。',
    },
    {
      id: 'record-dingmao-41h-p10',
      type: 'paragraph',
      text: '我快睡着的时候，想的是白天那件事。',
    },
    {
      id: 'record-dingmao-41h-fear',
      type: 'paragraph',
      text: '四个走过去的东西，其中一个，走到一半，回头看了我一眼。它回头的时候，我觉得，它是在学我怎么害怕。',
    },
    {
      id: 'record-dingmao-41h-p11',
      type: 'paragraph',
      text: '我是 11 月 23 号下午离开床的，四点多。此后，我没有再看见过什么。就这些。',
    },
    {
      id: 'record-dingmao-41h-tail',
      type: 'paragraph',
      text: '（节选到此。本记录为事后追记，时间凭本人回忆。）',
    },
  ],
  history: [
    { at: '2024-12-03T10:40:00+08:00', by: '记录室', note: '收录并节选' },
  ],
};

/**
 * 《白昼馆监控摘要与房门记录（11·21）》—— 震撼 B-1 的物证。
 * 两栏各自成立，静静并置：画面里“四人通过”的时候，所有在住人员的门
 * 都刷过卡了。叠放由玩家自己完成，站内不给出任何结论。
 * “画面清晰度”一栏是驻留素材的痕迹，不解释。
 * 投放：读过程露手记的断页处之后。
 */
export const daylightCam: WikiEntry = {
  slug: 'record-daylight-cam',
  title: '白昼馆监控摘要与房门记录（11·21）',
  category: 'record',
  unlisted: true,
  reveal: { afterSeen: ['note-chenglu-break'] },
  blocks: [
    {
      id: 'record-daylight-cam-head',
      type: 'paragraph',
      text: '本页为白昼馆 11 月 21 日晚连廊画面摘要与房门记录，供复核对照。',
    },
    { id: 'record-daylight-cam-h1', type: 'heading', text: '连廊画面摘要（三层）' },
    {
      id: 'record-daylight-cam-table1',
      type: 'table',
      rows: [
        ['时间', '内容', '画面'],
        ['23:31', '四人通过，自东向西', '中清晰'],
        ['23:34', '恢复为空廊', '中清晰'],
        ['00:20—01:00（补记）', '无人', '高清晰'],
      ],
    },
    { id: 'record-daylight-cam-h2', type: 'heading', text: '房门记录（当晚 23:00—24:00 刷卡摘录）' },
    {
      id: 'record-daylight-cam-table2',
      type: 'table',
      rows: [
        ['房号', '刷卡时间', '方向'],
        ['302', '23:12', '回房'],
        ['415', '22:58', '回房'],
        ['420', '23:24', '回房'],
        ['508', '23:02', '回房'],
      ],
    },
    {
      id: 'record-daylight-cam-note',
      type: 'paragraph',
      text: '以上为全部在住人员。当晚无外出记录。',
    },
  ],
  history: [
    { at: '2024-12-05T09:30:00+08:00', by: '平台运维', note: '按复核申请导出' },
  ],
};

/**
 * 《程露手记（白昼馆）》—— 震撼 B-3（章末层 5，小说体）。
 * 毛巾人偶：摆者留白，不指明、不解释。“地毯是干的”与老周口述的湿印子对照。
 * 末句“原稿此处断页”之后，本章收束。
 * 投放：读过 41 小时日志的“回头”句之后。
 */
export const chengluNote: WikiEntry = {
  slug: 'note-chenglu',
  title: '程露手记（白昼馆）',
  category: 'record',
  unlisted: true,
  reveal: { afterSeen: ['record-dingmao-41h-fear'] },
  blocks: [
    {
      id: 'note-chenglu-head',
      type: 'paragraph',
      text: '以下为内容审核组程露的短手记一则，经本人同意收录。',
    },
    { id: 'note-chenglu-p1', type: 'paragraph', text: '12 月 4 日。' },
    { id: 'note-chenglu-p2', type: 'paragraph', text: '复核白昼馆。三层到五层，一间一间过。' },
    { id: 'note-chenglu-p3', type: 'paragraph', text: '302 空置，420 空置。（都退了。）' },
    { id: 'note-chenglu-p4', type: 'paragraph', text: '415 有人。敲门，没应。按流程刷卡进去。' },
    {
      id: 'note-chenglu-p5',
      type: 'paragraph',
      text: '丁茂在窗边的椅子上坐着，看外面。他回头，跟我打了个招呼，手续齐全。没有异常。',
    },
    {
      id: 'note-chenglu-p6',
      type: 'paragraph',
      text: '508。登记上这一栏，房号后面是空的。敲门，没应。刷卡进去。',
    },
    {
      id: 'note-chenglu-p7',
      type: 'paragraph',
      text: '房间很干净，像没人住过。只有床头柜上有一个东西。',
    },
    {
      id: 'note-chenglu-p8',
      type: 'paragraph',
      text: '一个用毛巾、衣架和两本书摆成的东西，坐着的样子。手搭在膝盖上。',
    },
    {
      id: 'note-chenglu-photo',
      type: 'image',
      alt: '床头柜上的毛巾人偶（程露拍摄）',
      src: '/img/note-chenglu-photo.jpg',
      prompt:
        '手机照片：酒店式房间的床头柜，一个用白色毛巾和衣架、两本书垫撑成的人形摆件，坐姿，手搭在膝盖上，形态自然到令人不安，房间光线平静灰白，日常纪实质感 ／ phone photo, hotel nightstand, a human-shaped figure made of folded towels, hangers and two books, sitting posture, unsettlingly lifelike, calm gray light, documentary',
    },
    { id: 'note-chenglu-p9', type: 'paragraph', text: '摆得非常好。' },
    { id: 'note-chenglu-p10', type: 'paragraph', text: '走廊里没有人。' },
    { id: 'note-chenglu-p11', type: 'paragraph', text: '地毯是干的。' },
    {
      id: 'note-chenglu-break',
      type: 'paragraph',
      text: '（本页到此。原稿此处断页。）',
    },
  ],
  history: [
    { at: '2024-12-06T15:00:00+08:00', by: '内容审核组', note: '收录' },
  ],
};

/* ------------------------------------------------------------------ *
 * 《白昼馆复核意见（征询）》—— 幕三的核心选择（02 §3.4）。
 *
 * “增加记录（获取信息）vs 停止记录（可能恢复自然状态，风险未知）。没有正确答案。”
 * 两方向择一，一经登记不设更改；两个后果都写成日常文书的口吻——都可怕，也都不解释。
 * 投放：读过监控摘要末尾（白昼馆链的收官物证）之后。
 * “停列复核”即 02 §3.0 门三所说的“少看”方向。
 * ------------------------------------------------------------------ */

const reviewPoll: WikiEntry = {
  slug: 'daylight-review',
  title: '白昼馆复核意见（征询）',
  category: 'record',
  reveal: { afterSeen: ['record-daylight-cam-note'] },
  blocks: [
    {
      id: 'daylight-review-intro',
      type: 'paragraph',
      text: '本页为白昼馆复核意见征询表。就 11·21 事件后该馆的复核安排，征询处置方向。两方向择一登记；一经登记，不设更改。',
    },
    { id: 'daylight-review-poll', type: 'review-ask' },
    {
      id: 'daylight-review-tail',
      type: 'paragraph',
      text: '（本页登记结果计入待办。不作答复。）',
    },
  ],
  history: [
    { at: '2024-12-07T11:30:00+08:00', by: '内容审核组', note: '发出征询' },
  ],
  related: ['daylight-house', 'record-daylight-cam'],
};

/* ----------------------------- 征询数据（组件用） ----------------------------- */

export interface ReviewOptionData {
  key: 'expand' | 'reduce';
  title: string;
  body: string;
  result: string[];
}

export const DAYLIGHT_REVIEW = {
  prompt: '请择一登记：',
  options: [
    {
      key: 'expand',
      title: '一、增列复核',
      body: '增加复核频次，加密公共区记录。',
      result: [
        '已登记：增列复核。将于下周执行。',
        '此后，该馆公共区记录频次加倍；在住房间的巡检间隔缩短。——提醒：过度安静的楼层，同样属于复核对象。',
      ],
    },
    {
      key: 'reduce',
      title: '二、停列复核',
      body: '暂停对公共区的记录增补，维持常规流程。',
      result: [
        '已登记：停列复核。将于下周执行。',
        '此后，公共区不再增补记录；馆内事务回归常规流程。没有人能保证，那些自己会动的部分，接下来按谁的节奏走。',
      ],
    },
  ] as ReviewOptionData[],
  locked: '本页已登记。不设更改。',
};

/* ------------------------------------------------------------------ *
 * 白昼馆描述现场还原（人证比对 · 费城式）。
 *
 * 四份证词版本卡 + 一张客观记录卡，各自局部成立：
 * - 罗某“两三个”与徐某“四个”对不上——数目；
 * - 罗某“灯忽明忽暗”与巡楼“正常。”对不上——灯光；
 * - 徐某称“直接回房了”与露台门禁对不上——行踪（追问的入口：
 *   登记它，就是戳破那个小谎；他更正时多说的“没有影子”在终章补录里）。
 *
 * 处置选项由本场声明：前两项是“关闭式”（选了就停），隐藏项
 * “四个目击者都没有说谎”才是通过项——解锁终章。
 * 站内不出现“借位者”的官方解释——终章只说版本分别成立。
 * ------------------------------------------------------------------ */
export const DAYLIGHT_SCENE: ReconstructSceneData = {
  id: 'daylight-reconstruct',
  records: [
    {
      id: 't-luo',
      short: '罗某',
      title: '罗某 · 三层（11·26 询问）',
      rows: [
        { id: 'd-luo-tm', t: '时间', text: '十一点多。' },
        { id: 'd-luo-n', t: '人数', text: '两三个吧。' },
        { id: 'd-luo-l', t: '灯光', text: '灯那会儿不好，忽明忽暗。' },
        { id: 'd-luo-s', t: '声音', text: '走过去没出声的。' },
      ],
    },
    {
      id: 't-xu',
      short: '徐某',
      title: '徐某 · 四层（11·26 询问）',
      rows: [
        { id: 'd-xu-tm', t: '时间', text: '十一点半左右回来。' },
        { id: 'd-xu-n', t: '人数', text: '四个吧，排得挺近的。' },
        { id: 'd-xu-h', t: '行踪', text: '称“直接回房了”。' },
      ],
    },
    {
      id: 't-ding',
      short: '丁茂',
      title: '丁茂 · 四层（11·26 询问）',
      rows: [
        { id: 'd-ding-n', t: '人数', text: '四个。数目我敢肯定。' },
        { id: 'd-ding-m', t: '队形', text: '前后走，挨得很近。走到一半，停了。' },
        { id: 'd-ding-look', t: '细节', text: '四个。走到一半，全都回头了。' },
      ],
    },
    {
      id: 't-zhou',
      short: '老周',
      title: '老周 · 夜班值守（口述采集）',
      rows: [
        { id: 'd-zhou-s', t: '听觉', text: '拖的声，一下一下的，很匀。' },
        { id: 'd-zhou-sm', t: '气味', text: '雨后的土腥味（当晚没下雨）。' },
        { id: 'd-zhou-i', t: '地毯', text: '一排浅浅的印子，排得特别匀。' },
      ],
    },
    {
      id: 't-obj',
      short: '记录',
      title: '客观记录（门禁与巡楼）',
      rows: [
        { id: 'd-obj-420', t: '420 房门', text: '23:24 刷卡回房。' },
        { id: 'd-obj-terr', t: '四楼露台', text: '23:26—23:36 门禁两次刷卡。' },
        { id: 'd-obj-patrol', t: '巡楼记录', text: '11.21 23:05 正常。' },
      ],
    },
  ],
  conflicts: [
    // 两个人都看见了几个人——数目对不上。
    { id: 'dc1', rowA: 'd-luo-n', rowB: 'd-xu-n' },
    // 罗某说灯不好；巡楼记录写着正常。
    { id: 'dc2', rowA: 'd-luo-l', rowB: 'd-obj-patrol' },
    // 徐某说“直接回房了”；露台门禁说他上了露台。
    { id: 'dc3', rowA: 'd-xu-h', rowB: 'd-obj-terr' },
  ],
  verdicts: [
    { id: 'mistake', label: '有人看错了', note: '已按“看错”登记。本页比对结束。' },
    { id: 'log-error', label: '记录有误', note: '已按“记录有误”登记。' },
    {
      id: 'all-true',
      label: '四个目击者都没有说谎',
      note: '已按“四个目击者都没有说谎”登记。',
      hidden: true,
    },
  ],
  finale: {
    title: '描述现场还原 · 四个版本',
    lines: [
      '三处差异全部登记：数目、灯光、行踪。',
      '这段连廊那一晚的经过，四个版本分别成立。',
      '四个目击者都没有说谎。',
      '（补录：徐某在被指出露台停留后更正——“那我是在露台看的。他们走过去的时候，从上看，地上……没有影子。”）',
    ],
    photo: {
      alt: '连廊四版本叠放示意图（比对生成）',
      src: '/img/daylight-reconstruct.jpg',
      prompt:
        '档案示意图风格：一条长走廊被四个半透明线框视图叠放，行人轮廓以极简线条表示，方向一致，无面部、无装饰，冷灰色调，工程制图感 ／ minimal archival diagram, one corridor shown as four overlapping wireframe views, simple walking outlines, engineering line art, cold gray monochrome, no decoration',
      caption: '叠放结果：四个版本指向同一段连廊、同一个夜晚，行人方向一致。',
    },
  },
};

/**
 * 《白昼馆描述现场还原》—— 章 2 · 单元 4（人证重构入口）。
 * 投放：三份询问记录里读过任意两份后，本条进入目录与检索。
 */
const caseDaylight: WikiEntry = {
  slug: 'case-daylight',
  title: '白昼馆描述现场还原',
  category: 'record',
  reveal: {
    afterSeenAtLeast: {
      ids: ['testimony-a-4', 'testimony-b-6', 'testimony-c-look'],
      n: 2,
    },
  },
  blocks: [
    {
      id: 'case-daylight-intro',
      type: 'paragraph',
      text: '以下为 11·21 白昼馆事件的描述现场还原页。比对材料自三份询问记录、值守口述与门禁记录汇总，未做节选。比对结果计入台账。',
    },
    { id: 'case-daylight-scene', type: 'scene', scene: DAYLIGHT_SCENE.id },
  ],
  history: [
    { at: '2024-12-08T10:00:00+08:00', by: '内容审核组', note: '汇总比对材料并生成还原页' },
  ],
};

/* ------------------------------------------------------------------ *
 * 复核名录（幕三核心选择的收据）。
 *
 * 征询页说"将于下周执行"、且"不作答复"——执行的结果不写回征询页，
 * 而是作为一份行政文书在世界里被改动：两条互斥的名录页，各自持一个
 * 方向的 afterReview 门。玩家只会见到自己方向的那一页；见到的方式是
 * 回访时侧边栏"多出一行"（与连载栏目同一投放模式）。
 *
 * 两页共用同一副骨架：同样的抬头、同样的理由栏空置、同样的页脚。
 * 唯一不同的方向词——收据不说后果，只留事实；连接由玩家完成。
 * 纪律：不出现处置因果；508 只作为房号出现。
 * ------------------------------------------------------------------ */

const reviewRollIn: WikiEntry = {
  slug: 'record-review-roll-in',
  title: '12 月复核名录（增列）',
  category: 'record',
  reveal: { afterReview: 'expand' },
  blocks: [
    {
      id: 'record-review-roll-in-head',
      type: 'paragraph',
      text: '12 月复核名录 · 变更部分。本页为摘要；历史版本不保留。',
    },
    { id: 'record-review-roll-in-body', type: 'paragraph', text: '已增列：白昼馆（含 508 室）。' },
    { id: 'record-review-roll-in-reason', type: 'paragraph', text: '增列理由：（未填）。' },
    { id: 'record-review-roll-in-tail', type: 'paragraph', text: '登记人：（未填）。本页不设复核人。' },
  ],
  history: [
    { at: '2024-12-14T09:30:00+08:00', by: '内容审核组', note: '按复核程序更新名录' },
  ],
  related: ['daylight-review'],
};

const reviewRollOut: WikiEntry = {
  slug: 'record-review-roll-out',
  title: '12 月复核名录（停列）',
  category: 'record',
  reveal: { afterReview: 'reduce' },
  blocks: [
    {
      id: 'record-review-roll-out-head',
      type: 'paragraph',
      text: '12 月复核名录 · 变更部分。本页为摘要；历史版本不保留。',
    },
    { id: 'record-review-roll-out-body', type: 'paragraph', text: '已停列：白昼馆（含 508 室）。' },
    { id: 'record-review-roll-out-reason', type: 'paragraph', text: '停列理由：（未填）。' },
    { id: 'record-review-roll-out-tail', type: 'paragraph', text: '登记人：（未填）。本页不设复核人。' },
  ],
  history: [
    { at: '2024-12-14T09:30:00+08:00', by: '内容审核组', note: '按复核程序更新名录' },
  ],
  related: ['daylight-review'],
};

export const DAYLIGHT_ENTRIES: WikiEntry[] = [
  daylightPatrol,
  daylightPatrolDec,
  testimonyA,
  testimonyB,
  testimonyC,
  dingmaoLog,
  daylightCam,
  chengluNote,
  caseDaylight,
  reviewPoll,
  reviewRollIn,
  reviewRollOut,
];