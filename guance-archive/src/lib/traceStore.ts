'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PersistStorage, StorageValue } from 'zustand/middleware';
import { viewerIdOf } from '@/lib/resolve/identity';
import { GATE_ANCHORS } from '@/lib/resolve/gates';
import { MIN_LONGEST_MS } from '@/lib/resolve/ledger';
import { blockText } from '@/data/entries';

const TRACE_CAP = 300; // 有界：超出丢弃最旧
/**
 * `seen` 的上限。全站共约 1400 个 data-bid 块，上限必须显著高于它。
 * 曾经的 400 会让读得多的人在正常阅读中就被淘汰，而淘汰掉的可能正是
 * 某个投放门的锚点（见 resolve/gates）：已解锁的文书会静默地重新消失。
 * 锚点另受保护，这里的高度是给非锚点留的余量。
 */
export const SEEN_CAP = 2400;
/**
 * 快照上限。快照是化石，淘汰一条等于让一块已定稿的文字重新漂移，
 * 直接破坏 resolve 的第一优先级（定稿优先）。高档观测本就稀缺
 * （`04 §三`：一天两三次封顶），这个上限是安全阀而不是工作区间。
 */
export const SNAP_CAP = 600;
const TAB_TTL_MS = 9000; // 3 个心跳周期（心跳间隔 3000ms）
const DAYS_CAP = 60;
const SEEN_VALUE_CAP_MS = 600_000;

/**
 * 自然日必须取本地日，不是 UTC 日：直接截取 UTC 的 ISO 串当日期，在 UTC+8 下会把本地
 * 00:00–08:00 归入前一天，"隔天再来才推进轮次"会在凌晨静默失效。
 * `sv-SE` 稳定输出 `YYYY-MM-DD`。
 */
export function localDay(d: Date = new Date()): string {
  return d.toLocaleDateString('sv-SE');
}

export interface Snapshot {
  /** blockId */
  key: string;
  /** 当时所见，原样保存 */
  text: string;
  at: number;
}

export interface Visit {
  n: number;
  dn: number;
  lastDay: string;
  lastAt: number;
  firstAt: number;
}

export interface ActionItem {
  at: number;
  kind: string;
  target: string;
}

/**
 * 自我化石：第一次定稿时冻结的一份“停留最久”读数（07 §7.2-6）。
 * “以原样返回”这条世界观规则，第一次落在读者自己身上。
 */
export interface FrozenLongest {
  id: string;
  ms: number;
  text: string;
  at: number;
}

/** 没有行为时的编号。清档后是否“真的存在过”由它判别。 */
const ZERO_ID = viewerIdOf({});

/** 还原台的比对进度：已登记的矛盾与已提交的处置意见。 */
export interface ReconstructProgress {
  /** 已登记的矛盾 id（追加、去重） */
  marks: string[];
  /** 已提交的处置意见（可改选——它是意见，不是不可逆动作） */
  verdict?: string;
}

/** 见证人确认函的签收结果：确认与更正都完成代签，不点是第三条路。 */
export interface ReceiptSealRecord {
  kind: 'confirm' | 'correct';
  at: number;
}

export interface TraceState {
  // —— 真实信号 ——
  /** blockId -> 累计在视口内的毫秒数 */
  seen: Record<string, number>;
  visits: Record<string, Visit>;
  /** 出现过的自然日 */
  days: string[];
  actions: ActionItem[];
  /** BroadcastChannel 心跳租约 */
  tabs: Record<string, number>;
  /** 唯一的高档记录：存在即"已钉住" */
  snapshots: Record<string, Snapshot>;
  /**
   * 重复条目的塌缩：group -> 被点过的记录编号。
   * 一旦写入永不覆盖——点了哪一条就是哪一条，另一条不再出现；
   * 清档（resetAll）后自然归来，此处不保留"曾清过档"的痕迹。
   */
  picked: Record<string, string>;
  /** 文档修订的已读水位：slug -> 玩家最后一次到访时展示到的修订索引。 */
  readRevisions: Record<string, number>;
  /**
   * 编辑历史的已读水位：slug -> 最后一次打开历史页时的可见登记条数。
   * 首次打开词条页时播种（seedHistory）：基线条目首访不满屏红点；
   * 此后跨轮次多出的登记记录把条数推过水位，红点亮起（见 reveal.entryUnread）。
   */
  readHistory: Record<string, number>;
  /** 还原台的比对状态：场景 id -> 已登记的矛盾与处置意见 */
  reconstruct: Record<string, ReconstructProgress>;
  /** 签收结果：存在即已完成代签（确认与更正同类，只在此处留一份）。一旦写入不可撤销。 */
  receipt: ReceiptSealRecord | null;
  /** 观测配置申请：kind -> 提交时刻。一旦写入不可撤销（提交不可撤回）。 */
  applications: Record<string, number>;
  /** 最终选择：四项之一。一经登记，本站不再提供修改入口。 */
  finalChoice: string | null;
  /** 处理方案的签名：存在即已签署（自今日起承担持续观测）。一旦写入不可撤销。 */
  signature: number | null;
  /** 白昼馆复核征询的登记结果：'expand'（增列）| 'reduce'（停列）。不可覆盖。 */
  reviewChoice: string | null;
  /** 夜爬登顶：存在即已完成一次（不设半途存档）。一旦写入不可撤销。 */
  climbedAt: number | null;
  /**
   * 拦截：存在即该读者已被“关停”处置（全站唯一一次弹层的落盘）。
   * 此后「城北政务」关停线对他撤稿——回执替换正文。一旦写入不可撤销。
   */
  interceptedAt: number | null;
  /**
   * 清档前的编号。只被《档案调阅登记》里 retainsId 的那一行读取（02 §3.6）。
   * 不在 EMPTY 里：清档不清它——留存之所以有重量，正因为它只有一处。
   */
  prevViewerId: string | null;
  /** 自我化石读数。在 EMPTY 里：清档会清它（留存只有一处，不给第二处）。 */
  frozenLongest: FrozenLongest | null;

  markSeen(id: string, ms: number): void;
  enterEntry(slug: string): void;
  log(kind: string, target: string): void;
  recordTab(id: string): void;
  pruneTabs(): void;
  snapshot(id: string, text: string): void;
  pickRecord(group: string, id: string): void;
  markDocRead(slug: string, revision: number): void;
  seedHistory(slug: string, count: number): void;
  markHistoryRead(slug: string, count: number): void;
  markConflict(sceneId: string, conflictId: string): void;
  setVerdict(sceneId: string, verdict: string): void;
  sealReceipt(kind: 'confirm' | 'correct'): void;
  submitApplication(kind: string): void;
  setFinalChoice(key: string): void;
  signLedger(): void;
  setReviewChoice(choice: 'expand' | 'reduce'): void;
  markClimbed(): void;
  setIntercepted(): void;
  resetAll(): void;
}

const EMPTY = {
  seen: {} as Record<string, number>,
  visits: {} as Record<string, Visit>,
  days: [] as string[],
  actions: [] as ActionItem[],
  tabs: {} as Record<string, number>,
  snapshots: {} as Record<string, Snapshot>,
  picked: {} as Record<string, string>,
  readRevisions: {} as Record<string, number>,
  readHistory: {} as Record<string, number>,
  reconstruct: {} as Record<string, ReconstructProgress>,
  receipt: null as ReceiptSealRecord | null,
  applications: {} as Record<string, number>,
  finalChoice: null as string | null,
  signature: null as number | null,
  reviewChoice: null as string | null,
  climbedAt: null as number | null,
  interceptedAt: null as number | null,
  // 自我化石读数在 EMPTY 里：清档会清它。prevViewerId 故意不在——清档不清它。
  frozenLongest: null as FrozenLongest | null,
};
/**
 * 存档读写的防御层。
 * - 只认能解开的 JSON：坏存档一律当作"没有存档"——世界从零开始，
 *   绝不让页面因为一条损坏的记录崩掉，白屏比少了几条痕迹糟得多。
 * - 写失败（无痕模式、配额）同样静默：记录是尽力而为的，不打断阅读。
 * - 服务端没有 localStorage，退回不写入的实现。
 */
const persistStorage: PersistStorage<TraceState> = {
  getItem: (name) => {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    try {
      const raw = window.localStorage.getItem(name);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as StorageValue<TraceState> | null;
      return parsed && typeof parsed === 'object' && parsed.state ? parsed : null;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(name, JSON.stringify(value));
    } catch {
      /* 写不进去就算了 */
    }
  },
  removeItem: (name) => {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.removeItem(name);
    } catch {
      /* 同上 */
    }
  },
};

function freshTabs(tabs: Record<string, number>, now: number): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [id, at] of Object.entries(tabs)) {
    if (now - at <= TAB_TTL_MS) out[id] = at;
  }
  return out;
}

/**
 * 存档结构版本。
 *
 * persist 的默认合并是浅合并：只新增字段时旧存档会自动落回初始值，不需 migrate。
 * 但一旦改字段语义或改名，浅合并会把旧值原样塞进新字段，且不报错——
 * 那正是本项目最怕的静默失败。版本号是把“结构变了”显式记下来的唯一地方。
 *
 * v0 → v1：结构未变。此前发布的存档没写 version，persist 记为 0；
 * 升级后首次读取会走一次 migrate，把缺失的键补齐。
 *
 * 注意与存储键的区别：键名里的 `-v1` 是这份存档在浏览器里的身份，
 * 改它等于把全体读者的进度清零，永远不要动；结构版本走下面这个字段。
 */
const TRACE_VERSION = 1;

/**
 * 返回型声明为 TraceState 是为了让 persist 推导出不带 Partial 的存储类型；
 * 实际只需保证**数据字段**齐全——行为函数由 store 创建器提供，
 * persist 随后会做一次浅合并（{...当前值, ...迁移结果}）把它们带回来。
 */
export function migrateTrace(persisted: unknown, from: number): TraceState {
  const p = (persisted ?? {}) as Partial<TraceState>;
  if (from >= TRACE_VERSION) return p as TraceState;
  return { ...EMPTY, ...p } as TraceState;
}

export const useTrace = create<TraceState>()(
  persist(
    (set, get) => ({
      ...EMPTY,
      prevViewerId: null as string | null,
      frozenLongest: null as FrozenLongest | null,

      markSeen(id, ms) {
        if (!(ms > 0)) return;
        set((s) => {
          const seen: Record<string, number> = { ...s.seen };
          seen[id] = Math.min(SEEN_VALUE_CAP_MS, (seen[id] ?? 0) + ms);
          const keys = Object.keys(seen);
          if (keys.length > SEEN_CAP) {
            const drop = keys
              // 锚点永不淘汰：它是某个投放门的唯一依据，丢了就等于把已解锁的内容锁回去
              .filter((k) => k !== id && !GATE_ANCHORS.has(k))
              .sort((a, b) => seen[a] - seen[b])
              .slice(0, keys.length - SEEN_CAP);
            for (const k of drop) delete seen[k];
          }
          return { seen };
        });
      },

      enterEntry(slug) {
        const now = Date.now();
        const day = localDay();
        set((s) => {
          const prev = s.visits[slug];
          const visits: Record<string, Visit> = { ...s.visits };
          visits[slug] = prev
            ? {
                n: prev.n + 1,
                dn: prev.dn + (day === prev.lastDay ? 0 : 1),
                lastDay: day,
                lastAt: now,
                firstAt: prev.firstAt,
              }
            : { n: 1, dn: 1, lastDay: day, lastAt: now, firstAt: now };
          const days = s.days.includes(day)
            ? s.days
            : [...s.days, day].slice(-DAYS_CAP);
          return { visits, days };
        });
      },

      log(kind, target) {
        const at = Date.now();
        set((s) => ({ actions: [...s.actions, { at, kind, target }].slice(-TRACE_CAP) }));
      },

      recordTab(id) {
        const now = Date.now();
        set((s) => ({ tabs: { ...freshTabs(s.tabs, now), [id]: now } }));
      },

      /**
       * 清理已关闭标签页留下的租约。没有过期项时不产生任何写入——
       * 它会被 3 秒一次的广播节拍反复调用，每次都写一遍等于凭空造出负载。
       */
      pruneTabs() {
        const now = Date.now();
        const { tabs } = get();
        const fresh = freshTabs(tabs, now);
        if (Object.keys(fresh).length === Object.keys(tabs).length) return;
        set({ tabs: fresh });
      },

      /** 一旦写入永不覆盖：存在即已定稿，化石只认第一次。 */
      snapshot(id, text) {
        set((s) => {
          if (s.snapshots[id]) return s;
          const snapshots: Record<string, Snapshot> = {
            ...s.snapshots,
            [id]: { key: id, text, at: Date.now() },
          };
          const keys = Object.keys(snapshots);
          if (keys.length > SNAP_CAP) {
            const drop = keys
              .sort((a, b) => snapshots[a].at - snapshots[b].at)
              .slice(0, keys.length - SNAP_CAP);
            for (const k of drop) delete snapshots[k];
          }
          // 自我化石：你定稿世界的那一刻，世界也定稿了你的一份读数。
          // 此后 /trace 的“停留最久的一段”停在这一帧，其余数字照常走。
          let frozenLongest = s.frozenLongest;
          if (!frozenLongest) {
            let bestId = '';
            let bestMs = 0;
            for (const [k, ms] of Object.entries(s.seen))
              if (ms > bestMs) {
                bestMs = ms;
                bestId = k;
              }
            // 与台账同口径：不足显著时长的停留不构成“最久的一段”
            if (bestId && bestMs >= MIN_LONGEST_MS) {
              frozenLongest = {
                id: bestId,
                ms: bestMs,
                text: snapshots[bestId]?.text ?? blockText(bestId),
                at: Date.now(),
              };
            }
          }
          return { snapshots, frozenLongest };
        });
      },

      /** 同样一旦写入永不覆盖：重复条目只塌缩一次，不可重选、不可撤销。 */
      pickRecord(group, id) {
        set((s) => {
          if (s.picked[group]) return s;
          return { picked: { ...s.picked, [group]: id } };
        });
      },

      /** 已读水位只前进：revision <= 当前水位时不产生任何写入。 */
      markDocRead(slug, revision) {
        set((s) => {
          const cur = s.readRevisions[slug] ?? 0;
          if (revision <= cur) return s;
          return { readRevisions: { ...s.readRevisions, [slug]: revision } };
        });
      },

      /** 历史水位播种：只在键不存在时写入——基线条数不是"新内容"。 */
      seedHistory(slug, count) {
        set((s) =>
          s.readHistory[slug] !== undefined
            ? s
            : { readHistory: { ...s.readHistory, [slug]: count } },
        );
      },

      /** 历史水位推进：打开历史页时把水位推到当前可见条数，只前进。 */
      markHistoryRead(slug, count) {
        set((s) => {
          const cur = s.readHistory[slug];
          if (cur === undefined) return { readHistory: { ...s.readHistory, [slug]: count } };
          if (count <= cur) return s;
          return { readHistory: { ...s.readHistory, [slug]: count } };
        });
      },

      /** 矛盾的登记：追加去重；已登记的不再产生写入。 */
      markConflict(sceneId, conflictId) {
        set((s) => {
          const cur = s.reconstruct[sceneId] ?? { marks: [] };
          if (cur.marks.includes(conflictId)) return s;
          return {
            reconstruct: {
              ...s.reconstruct,
              [sceneId]: { ...cur, marks: [...cur.marks, conflictId] },
            },
          };
        });
      },

      /** 处置意见可改选：它是意见，不是不可逆动作（帧重建的揭示才不可逆）。 */
      setVerdict(sceneId, verdict) {
        set((s) => {
          const cur = s.reconstruct[sceneId] ?? { marks: [] };
          if (cur.verdict === verdict) return s;
          return { reconstruct: { ...s.reconstruct, [sceneId]: { ...cur, verdict } } };
        });
      },

      /** 一旦写入永不覆盖：确认与更正都完成代签，代签只有一次。 */
      sealReceipt(kind) {
        set((s) => {
          if (s.receipt) return s;
          return { receipt: { kind, at: Date.now() } };
        });
      },

      /** 申请不可撤回：同一份申请的重复提交不产生任何写入。 */
      submitApplication(kind) {
        set((s) => {
          if (s.applications[kind]) return s;
          return { applications: { ...s.applications, [kind]: Date.now() } };
        });
      },

      /** 最终选择：一经登记不可覆盖（修改入口不在本站）。 */
      setFinalChoice(key) {
        set((s) => {
          if (s.finalChoice) return s;
          return { finalChoice: key };
        });
      },

      /** 签名：一旦写入不可撤销（想撕下来，只能把整页清掉——清档后全站归零）。 */
      signLedger() {
        set((s) => {
          if (s.signature) return s;
          return { signature: Date.now() };
        });
      },

      /** 征询登记：两方向择一，一经登记不设更改。 */
      setReviewChoice(choice) {
        set((s) => {
          if (s.reviewChoice) return s;
          return { reviewChoice: choice };
        });
      },

      /** 登顶：一次就是一次（不设半途存档，也不可重复刷写）。 */
      markClimbed() {
        set((s) => {
          if (s.climbedAt) return s;
          return { climbedAt: Date.now() };
        });
      },

      /** 拦截：一次就是一次（弹层出现即落盘；此后关停线对他撤稿）。 */
      setIntercepted() {
        set((s) => {
          if (s.interceptedAt) return s;
          return { interceptedAt: Date.now() };
        });
      },

      resetAll() {
        set((s) => {
          // 清档不是清零：编号留存在调阅登记那一行（02 §3.6），且只留那一处。
          // 连清两次不会把第一次的留存冲成 GA-000000。
          const cur = viewerIdOf(s.visits);
          const prevViewerId = cur === ZERO_ID ? s.prevViewerId : cur;
          return { ...EMPTY, prevViewerId };
        });
      },
    }),
    {
      name: 'ga-trace-v1',
      version: TRACE_VERSION,
      storage: persistStorage,
      migrate: migrateTrace,
    },
  ),
);

/**
 * 是否已回来过。站内通知的投放条件（第二次会话开始时投一条列表项）。
 * 放在 store 一侧，组件里不写判定。
 */
export function hasReturnedBefore(): boolean {
  const s = useTrace.getState();
  if (s.days.length >= 2) return true;
  return Object.values(s.visits).some((v) => v.n >= 2);
}

/**
 * 其他同源会话数。日志页写"同一时间存在其他查阅会话：N"时用。
 * 自身租约不参与计数（它 9 秒后就过期，而本标签页显然还开着）。
 */
export function countPeers(
  tabs: Record<string, number>,
  selfId: string,
  now: number = Date.now(),
): number {
  let n = 0;
  for (const [id, at] of Object.entries(tabs)) {
    if (id !== selfId && now - at <= TAB_TTL_MS) n++;
  }
  return n;
}

/**
 * 由真实行为生成的稳定标识，会成为玩家在站内文书里的"名字"。
 * 算法本体在 resolve/identity（与台账生成共用一份定义）。
 */
export function viewerId(): string {
  return viewerIdOf(useTrace.getState().visits);
}
