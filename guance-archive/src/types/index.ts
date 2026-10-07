export type BlockType =
  | 'paragraph'
  | 'heading'
  | 'list'
  | 'quote'
  | 'table'
  | 'image'
  | 'divider'
  | 'scene'
  /** 玩家台账：由真实行为数据在接手后生成（须知增补、见证人函） */
  | 'ledger'
  /** 签收交互区：确认 / 更正两条路径都完成代签，不点是第三条 */
  | 'receipt-seal'
  /** 申请交互区：两份申请先后提交，回执各带一条未申请的第三条处理意见 */
  | 'application'
  /** 动态登记行：模板含 {id}/{day} 占位，接手后由读者本人的编号与日期填充 */
  | 'register'
  /** 最终选择区：处理方案四项（含缺席后出现的未申请项）与签名栏 */
  | 'final-choice'
  /** 征询区：两方向择一登记（幕三核心选择：增列/停列复核） */
  | 'review-ask'
  /** 登顶交互：环山夜爬的分步推进（含山脊岔路） */
  | 'climb';

/**
 * 投放条件：满足前，该内容不进入目录、首页与搜索索引。
 * 页面本身照常静态生成（"未列入目录的文书不参与站内浏览"是站内的固有口径）。
 */
export interface RevealRule {
  /** 至少经过的自然日数：days.length > afterDays 时满足（1 = 第二个自然日起） */
  afterDays?: number;
  /** 需要真正看过（≥ 阅读门槛）的块：列表中任一满足即可 */
  afterSeen?: string[];
  /** 需要全部真正看过的块（与 afterSeen 的“任一”不同） */
  afterSeenAll?: string[];
  /** 需要其中至少 n 个真正看过（“收集”类门控：条目池里凑够 n 份） */
  afterSeenAtLeast?: { ids: string[]; n: number };
  /** 需要某个还原台场景完成推断（帧数据重建已解锁） */
  afterScene?: string;
  /**
   * 需要玩家在《白昼馆复核意见（征询）》中登记过指定方向：
   * 'expand' 增列 | 'reduce' 停列。未登记（null / undefined）一律不满足。
   * 这是“复核名录”两份互斥文书的门——登记的收据不在答复里，在世界里。
   */
  afterReview?: 'expand' | 'reduce';
  /**
   * 需要读者已登记最终选择（任一方案，含缺席项 D）。终局轨专用：
   * 小说只给走完的人。到达时不作任何宣告（02 §6.3）——
   * 它只是像其他新文书一样，安静地出现在栏目列表里。
   * 游玩中的载体（词条/政务/新闻/网络存档/榜单）不得使用本条件，
   * mechanisms 69 看守。
   */
  afterChoice?: boolean;
  /**
   * 或组（多入射角门控）：组内任一子规则满足即可，允许嵌套；
   * 与其它字段之间仍是“与”关系。用于给同一条内容开多条入射路径——
   * 深链路径与叙事路径并行，不取消任何一条。
   */
  anyOf?: RevealRule[];
}

/** 文档修订：满足条件后追加在正文之后（不被替换，用于新旧对照）。 */
export interface DocRevision {
  /** 站内小标题，如"2024 年 12 月 15 日快照" */
  title: string;
  reveal?: RevealRule;
  blocks: ContentBlock[];
}

export interface ContentBlock {
  /** 稳定 id，格式 "<slug>-<序号>"，是 hash 的输入之一 */
  id: string;
  type: BlockType;
  text?: string;
  items?: string[];
  rows?: string[][];
  /** 图片缺位时的替代文本 */
  alt?: string;
  /**
   * 生图提示词（仅数据侧，不渲染）。
   * 图片位在生产端用生图工具补齐前，正文里显示的始终只是 alt——
   * 这与"只有 alt 的图片位"的允许形态天然合流。
   */
  prompt?: string;
  /** scene 块的场景标识（对应数据里的还原台场景） */
  scene?: string;
  /** ledger 块的行文变体：'notice' 统计通知 / 'receipt' 公文核对 */
  ledgerVariant?: 'notice' | 'receipt';
  /**
   * 变体：按轮次显式声明，不做取模。
   * `round` 取值范围 1..ROUND_MAX；`round = 0` 恒为规范版，不得为其声明变体。
   */
  variants?: { round: number; text: string }[];
  /** 该块是否允许随回访推进。false = 永久规范版 */
  driftable?: boolean;
  /** 最早允许漂移的轮次，默认 1 */
  minRound?: number;
  /**
   * 动态登记行专用：清档后仍渲染清档前的旧编号（02 §3.6“编号留存一处”）。
   * 全站只允许一处为 true——留存之所以有重量，正因为它只有一处。
   */
  retainsId?: boolean;
}

export interface EditRecord {
  /** ISO 字符串 */
  at: string;
  by: string;
  note?: string;
  /** 本条为覆盖型编辑 */
  overwritten?: boolean;
  /** 被本条覆盖的底层版本 */
  underlyingText?: string;
  /** 该条记录对应的正文块，摘录经 staleOr 取文 */
  blockId?: string;
  /** 记录中"复核"字样指向的对照物页；每幕最多一处 */
  verifyHref?: string;
  /**
   * 最早允许出现的轮次，默认 0（首次访问即可见）。
   * 用于"时间戳指向未来的编辑记录"这类跨轮次才现身的裂缝：
   * 它必须在数据里声明，不写在组件里。
   */
  fromRound?: number;
}

export interface WikiEntry {
  slug: string;
  title: string;
  category: 'location' | 'event' | 'personnel' | 'protocol' | 'record' | 'special';
  blocks: ContentBlock[];
  history: EditRecord[];
  related?: string[];
  /** 交叉引用锚点，允许故意指向不存在的 id */
  refs?: { blockId: string; target: string; text?: string }[];
  /**
   * 不参与目录与首页推荐，只经由检索抵达（还有直接输入地址）。
   * 用于"凑齐几份互不印证的记录"这类需要玩家自己找的内容：
   * 目录页对这类文书的口径已经写好了——"未列入目录的文书不参与站内浏览"。
   */
  unlisted?: boolean;
  /** 投放条件：未满足时不进入目录/首页/搜索（只控制露出渠道，页面照常生成） */
  reveal?: RevealRule;
  /** 文档修订：满足条件的修订追加在正文之后 */
  revisions?: DocRevision[];
}

/* ----------------------------- 讨论页 ----------------------------- */

export interface TalkPost {
  /** 稳定 id，也是讨论帖的 data-bid（`talk-<slug>-<序号>`） */
  id: string;
  at: string;
  by: string;
  /** 引用块：上面那行被抄录的旧版本，可为空 */
  quote?: string;
  text: string;
}

export interface TalkThread {
  slug: string;
  posts: TalkPost[];
}

/* ----------------------------- 城北口述（剧情节） ----------------------------- */

/**
 * 口述采集的一期。站内栏目《城北口述》——专门承载连续叙事：
 * 每期是一位亲历者的完整讲述，与词条互相解锁（读记录解锁口述，读口述解锁新内容）。
 */
export interface Story {
  /** 路由 id，如 'story-01' */
  id: string;
  /** 期标题，如 '第一辑 · 夜班司机' */
  title: string;
  /** 口述人说明（化名与身份） */
  speaker: string;
  /** 采集时间（ISO） */
  at: string;
  /** 投放条件：未满足时不进入栏目列表（页面本身照常生成） */
  reveal?: RevealRule;
  blocks: ContentBlock[];
}

/* ----------------------------- 同城榜（外部媒体存档） ----------------------------- */

/**
 * 同城榜的一个条目。榜单一期一存档，排名与热度按导出时刻照录，
 * 不随时间重排——榜单的"变化"只体现在不同期的快照之间。
 */
export interface HotTopic {
  /** 稳定 id，格式 'hot-<期号>-<名次>' */
  id: string;
  rank: number;
  topic: string;
  /** 热度值，如 '385.2 万' */
  heat: string;
  /** 榜面标签：沸 / 爆 / 热 / 新 / 荐 */
  tag?: string;
  /** 话题页的话题描述（点入榜面条目后所见） */
  desc?: string;
  /** 话题页的数据行，如 '阅读 156.4 万 · 讨论 0.6 万' */
  stat?: string;
  /** 话题页的相关讨论摘录（按导出时刻抄录） */
  posts?: string[];
}

/** 同城榜的一期快照。 */
export interface HotSnapshot {
  id: string;
  /** 展示日期，如 '10 月 31 日' */
  label: string;
  at: string;
  /** 页脚注（补录说明等） */
  footer?: string;
  reveal?: RevealRule;
  topics: HotTopic[];
}

/* ----------------------------- 城北新闻（播出稿存档） ----------------------------- */

/** 新闻播出稿的一档。条目复用 ContentBlock（只取 paragraph / list）。 */
export interface NewsIssue {
  id: string;
  /** 展示日期，如 '10 月 24 日' */
  label: string;
  /** 档位，如 '晚间档' */
  slot: string;
  at: string;
  /** 存档附记（并稿说明等） */
  note?: string;
  reveal?: RevealRule;
  items: ContentBlock[];
}

/* ----------------------------- 网络存档 ----------------------------- */

/**
 * 网络存档的一条材料。摘录自公开社交平台，按发现时间抄录，
 * 昵称一律隐去——与站内"档案转抄"的口径一致。
 */
export interface NetRecord {
  id: string;
  /** 展示时间，如 '11 月 1 日晚' */
  at: string;
  /** 渠道，如 '群聊“城北吃喝玩乐团购群”' */
  channel: string;
  /** 引子或附记文字 */
  text?: string;
  /** 逐条摘录（聊天记录、弹幕、评论等） */
  lines?: string[];
  /** 图片位（网络流传图的抄录）：与内容层的 image 块同义 */
  photo?: { alt: string; prompt: string };
  /** 该条已不可见（被删除） */
  deleted?: boolean;
  /** 补充说明，如不可见的时间 */
  note?: string;
  reveal?: RevealRule;
}

/* ----------------------------- 城北政务（支线公文） ----------------------------- */

/**
 * 城北政务：区域行政公文（方案、纪要、执行记录）。
 * 定位：支线栏目——不在五幕门控之内，是“世界仍在运转”的真实感层。
 * 关停线（高精度观测设备关停）是它的第一条支线：《实施现场纪要》的截断块
 * 被真正看过时，全站唯一一次拦截弹层出现，此后本栏目内容对读者撤稿。
 */
export interface GovDoc {
  id: string;
  title: string;
  /** 文种：如 "方案（征求意见稿）" "听证纪要" "现场纪要" */
  kind: string;
  at: string;
  /** 投放条件：未满足时不进列表（页面照常生成） */
  reveal?: RevealRule;
  blocks: ContentBlock[];
}

/* ----------------------------- 还原台（物证/人证重构） ----------------------------- */

export interface ReconstructRow {
  id: string;
  /** 时间点标记，如 "21:33" */
  t: string;
  text: string;
}

export interface ReconstructRecord {
  id: string;
  /** 短名，用于台账式引用（如 屏 / 摄像头 / 闸机） */
  short: string;
  title: string;
  rows: ReconstructRow[];
}

/** 已声明的矛盾对：两行记录对不上，玩家可比对登记。 */
export interface ReconstructConflict {
  id: string;
  rowA: string;
  rowB: string;
}

/**
 * 还原台的处置选项（数据声明）。未声明时使用默认三项
 * （设备故障 / 记录未写入 / 两条都成立）——那是 12·07 的首场。
 */
export interface ReconstructVerdict {
  id: string;
  label: string;
  note: string;
  /** 隐藏项：全部矛盾登记后才出现；同时是解锁终章的“通过项”（每场至多一个）。 */
  hidden?: boolean;
}

export interface ReconstructFinale {
  title: string;
  lines: string[];
  photo: { alt: string; prompt: string; caption: string };
}

export interface ReconstructSceneData {
  id: string;
  records: ReconstructRecord[];
  conflicts: ReconstructConflict[];
  finale: ReconstructFinale;
  /** 处置选项声明；缺省 = 12·07 的默认三项。 */
  verdicts?: ReconstructVerdict[];
}
