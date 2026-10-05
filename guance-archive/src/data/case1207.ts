import type { ReconstructSceneData, WikiEntry } from '@/types';

/* ------------------------------------------------------------------ *
 * 章 1 · 单元 4：《12·07 全案还原》（物证重构）。
 *
 * 三条记录各自局部成立（跨通道不能互证在内容层的落点）：比对不需要面板，
 * 只需要玩家自己把两处对不上摆在一起。矛盾对在数据里显式声明——
 * 不是算法从时间戳里推出来的。
 *
 * 投放：四份 12·07 记录都真正读过之后，本条才进入目录与检索。
 * ------------------------------------------------------------------ */

export const CASE1207_SCENE: ReconstructSceneData = {
  id: 'case-1207-reconstruct',
  records: [
    {
      id: 'screen',
      short: '屏',
      title: '2 号广告屏运行日志（原始版）',
      rows: [
        { id: 'scr-1', t: '21:30', text: '显示正常。播放轮次：第 4 轮（素材《城北夜景》）。' },
        { id: 'scr-2', t: '21:33', text: '前置感应触发 ×3，切换至迎宾画面。' },
        { id: 'scr-3', t: '21:36', text: '前置感应触发 ×1。' },
        { id: 'scr-4', t: '21:41', text: '前置感应触发 ×3。' },
        { id: 'scr-5', t: '21:44', text: '前置感应触发 ×1。' },
        { id: 'scr-6', t: '21:45', text: '恢复播放（自第 4 轮素材第 37 秒续播）。' },
        { id: 'scr-7', t: '22:00', text: '定时休眠。' },
      ],
    },
    {
      id: 'cam',
      short: '摄像头',
      title: '3 号摄像头帧记录',
      rows: [
        { id: 'cam-1', t: '21:30', text: '本段帧正常写入。' },
        { id: 'cam-2', t: '21:33', text: '无写入记录。' },
        { id: 'cam-3', t: '21:36', text: '无写入记录。' },
        { id: 'cam-4', t: '21:41', text: '无写入记录。' },
        { id: 'cam-5', t: '21:44', text: '无写入记录。' },
        { id: 'cam-6', t: '21:45', text: '恢复写入。' },
        { id: 'cam-7', t: '21:45', text: '——22:10，帧正常。' },
      ],
    },
    {
      id: 'gate',
      short: '闸机',
      title: '北口闸机记录',
      rows: [
        { id: 'gat-1', t: '21:33', text: '入口通行 3 人次。未刷卡。' },
        { id: 'gat-2', t: '21:41', text: '出口通行 3 人次。持维护卡，登记为晚班维护人员。' },
        { id: 'gat-3', t: '21:47', text: '出口通行 1 人次。持值守卡。' },
        { id: 'gat-4', t: '22:02', text: '出口通行 1 人次。持值守卡。' },
      ],
    },
  ],
  conflicts: [
    // 屏知道有人，摄像头拍不到。
    { id: 'c1', rowA: 'scr-2', rowB: 'cam-2' },
    // 闸机放行了三个人，监控没拍到任何一个人。
    { id: 'c2', rowA: 'gat-2', rowB: 'cam-4' },
    // 同一批人：进的时候没有卡，出的时候有卡。
    { id: 'c3', rowA: 'gat-1', rowB: 'gat-2' },
  ],
  finale: {
    title: '帧数据重建 · 21:41:07',
    lines: [
      '本帧未能完成结算。',
      '已写入的部分如下——',
      '北段第三组灯具下方：两个人形轮廓。',
      '同一位置：一段墙体。',
      '两处占用同一坐标。',
      '（本帧内容已按空白处理。）',
    ],
    photo: {
      alt: '墙面修补痕迹与帧内轮廓叠放（比对生成）',
      prompt:
        '一张合成的比对图：上半部分是地下通道水泥墙面的照片，墙上有方形修补痕迹；下半部分是同一面墙的线框图，上面叠加了两个人形的轮廓基线，轮廓与修补区域重合；工程制图风格，无装饰，灰白色调 ／ technical overlay image, concrete wall patch, human silhouettes wireframe, engineering comparison chart, plain, gray',
      caption: '叠放结果：两处轮廓重合。',
    },
  },
};

const case1207: WikiEntry = {
  slug: 'case-1207',
  title: '12·07 全案还原',
  category: 'record',
  // 投放：四份 12·07 记录都真正读过之后，本条进入目录与检索。
  reveal: {
    afterSeenAll: [
      'record-1207-site-body',
      'record-1207-device-note',
      'record-1207-duty-body',
      'record-1207-family-body',
    ],
  },
  blocks: [
    {
      id: 'case-1207-intro',
      type: 'paragraph',
      text: '以下为 12·07 事件的物证比对页。三份记录自事发夜原始导出，未做节选。比对结果计入台账。',
    },
    // 还原台：三条记录的比对、矛盾登记、处置意见与帧重建全在这里。
    { id: 'case-1207-scene', type: 'scene', scene: CASE1207_SCENE.id },
    { id: 'case-1207-h-photo', type: 'heading', text: '附件' },
    {
      id: 'case-1207-photo',
      type: 'image',
      alt: '通道东段墙面（12·08 例行检查拍摄）',
      prompt:
        '中国北方城市地下人行通道内部，深夜施工照明灯，水泥墙面局部有方形修补痕迹，略带水渍，广角照片，闪光灯直打，构图平实，像施工记录照 ／ concrete wall patch, underground passage, night, flash photo, maintenance record, documentary style',
    },
    {
      id: 'case-1207-photo-note',
      type: 'paragraph',
      text: '照片中可见一处方形修补痕迹。检查意见：正常。',
    },
  ],
  history: [
    { at: '2024-12-16T10:20:00+08:00', by: '内容审核组', note: '整理三份原始记录并生成比对页' },
  ],
};

export const CASE1207_ENTRIES: WikiEntry[] = [case1207];