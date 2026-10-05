import { expect, test } from 'vitest';
import type { RevealRule, WikiEntry } from '@/types';
import { CASE1207_SCENE } from '@/data/case1207';
import { APPLICATION_FORM } from '@/data/act4';
import { DAYLIGHT_REVIEW } from '@/data/daylight';
import { CLIMB_PATH } from '@/data/qinglan';
import { CHRONICLES } from '@/data/chronicle';
import { ENTRIES, getEntry, RESERVED_NUMBERS, VERIFY_BLOCKS, VERIFY_DOCS } from '@/data/entries';
import { DUP_SETS } from '@/data/duplicates';
import { GOV_DOCS, GOV_IMPL_CUT_ID, GOV_RECEIPT_LINES, govBlockText } from '@/data/gov';
import { HOT_SNAPSHOTS, HOT_TOPIC_IDS } from '@/data/hot';
import { NET_RECORDS } from '@/data/net';
import { NEWS_ISSUES } from '@/data/news';
import { SCENES } from '@/data/scenes';
import { STORIES } from '@/data/stories';
import { TALKS } from '@/data/talk';
import { dupRecordsFor } from '@/lib/resolve/duplicates';
import { ghostActions } from '@/lib/resolve/ghosts';
import { visibleHistory } from '@/lib/resolve/history';
import { buildLedger } from '@/lib/resolve/ledger';
import { absentLongEnough } from '@/lib/resolve/absence';
import { applicationOrder, receiptState, sealText } from '@/lib/resolve/receipt';
import {
  allMarked,
  findConflict,
  frameUnlocked,
  passVerdictId,
  verdictSelectable,
} from '@/lib/resolve/reconstruct';
import {
  entryRevealed,
  entryUnread,
  hasUnreadRevision,
  meetsRule,
  revisionShown,
} from '@/lib/resolve/reveal';
import { GATE_ANCHORS } from '@/lib/resolve/gates';
import { buildSearchDocs, normText, pickSearchPiece, searchDocs } from '@/lib/searchIndex';
import { migrateTrace, SEEN_CAP, useTrace } from '@/lib/traceStore';

/* ------------------------------------------------------------------ *
 * Phase 2 机制的断言集。
 * 与黄金测试同规格：纯函数与数据关系，不需要浏览器、不需要测试者。
 * 任何一条红了，不进入人工验证。
 * ------------------------------------------------------------------ */

test('10. 重复条目：未选择时两条并存，编号不同、摘要互斥', () => {
  for (const s of DUP_SETS) {
    const out = dupRecordsFor(s.group, {});
    expect(out).toHaveLength(2);
    expect(out![0].id).not.toBe(out![1].id);
    expect(out![0].summary).not.toBe(out![1].summary);
  }
});

test('11. 重复条目：点过一条后只剩那一条；塌缩不可重选、不可撤销', () => {
  for (const s of DUP_SETS) {
    const first = s.records[0].id;
    const out = dupRecordsFor(s.group, { [s.group]: first });
    expect(out).toHaveLength(1);
    expect(out![0].id).toBe(first);

    // 塌缩的写入路径：pickRecord 一旦写入永不覆盖
    useTrace.getState().pickRecord(s.group, first);
    useTrace.getState().pickRecord(s.group, s.records[1].id);
    expect(useTrace.getState().picked[s.group]).toBe(first);
    useTrace.getState().resetAll();
    expect(useTrace.getState().picked[s.group]).toBeUndefined();

    // 清档后两条一起回来
    expect(dupRecordsFor(s.group, useTrace.getState().picked)).toHaveLength(2);
  }
});

test('12. 轮次门控：fromRound 之前看不见该记录，之后一直在', () => {
  for (const e of ENTRIES) {
    for (const r of e.history) {
      const min = r.fromRound ?? 0;
      for (let round = 0; round <= 6; round++) {
        expect(visibleHistory(e.history, round).includes(r)).toBe(round >= min);
      }
    }
  }
});

test('13. 裂缝：12·07 的未来时间戳记录晚于同秒覆盖整 4 分钟，且携带被覆盖的原文', () => {
  const e = getEntry('event-1207')!;
  const future = e.history.find((r) => r.fromRound === 1);
  expect(future).toBeDefined();
  const base = e.history.find((r) => r.at.includes('10:30') && r.overwritten);
  expect(base).toBeDefined();
  expect(new Date(future!.at).getTime() - new Date(base!.at).getTime()).toBe(4 * 60_000);
  expect(future!.overwritten).toBe(true);
  expect(future!.underlyingText).toBeTruthy();
  // 它必须晚于所有常规记录：这是"指向未来"的事实依据
  const normal = e.history.filter((r) => !r.fromRound);
  for (const r of normal) expect(future!.at > r.at).toBe(true);
});

test('14. 对照物：讨论页引用的是 5 分钟，正文写的是 4 分钟', () => {
  const talk = TALKS['event-1207'];
  expect(talk).toBeDefined();
  const quoted = talk.posts.find((p) => (p.quote ?? '').includes('5 分钟'));
  expect(quoted).toBeDefined();
  const body = getEntry('event-1207')!.blocks.find((b) => b.id === 'event-1207-drift-note');
  expect(body?.text ?? '').toContain('4 分钟');
  // 对照物不解释自己：讨论里没有任何一处把两个数字摆在一起
  for (const p of talk.posts) expect(p.text.includes('4 分钟') && p.text.includes('5 分钟')).toBe(false);
});

test('15. 独占值不被索引层文本撞上：影子记录的摘要与编号同样受约束', () => {
  const hit = (text: string, n: string) =>
    new RegExp(`(?<![\\d:.])${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\d:.])`).test(text);
  for (const s of DUP_SETS) {
    for (const r of s.records) {
      for (const n of RESERVED_NUMBERS) expect(hit(`${r.summary}${r.meta}`, n)).toBe(false);
    }
  }
});

test('16. 未列入目录的记录可达但不入推荐：unlisted 条目仍在 ENTRIES 里', () => {
  const unlisted = ENTRIES.filter((e) => e.unlisted);
  expect(unlisted.length).toBeGreaterThanOrEqual(4); // 四份互不印证记录
  for (const e of unlisted) {
    // 静态导出按 ENTRIES 全量枚举 slug：可达
    expect(ENTRIES.some((x) => x.slug === e.slug)).toBe(true);
    // 互相之间不引用：related 不得包含彼此
    for (const other of unlisted) {
      if (other.slug === e.slug) continue;
      expect(e.related ?? []).not.toContain(other.slug);
    }
  }
});

test('17. 幽灵记录：由首个自然日确定性推导，跨天之前不出现', () => {
  // 单日（或空）不出幽灵：第一天看到的就是干净台账
  expect(ghostActions([])).toHaveLength(0);
  expect(ghostActions(['2026-09-14'])).toHaveLength(0);

  const g = ghostActions(['2026-09-14', '2026-09-15', '2026-09-16']);
  expect(g).toHaveLength(1);
  expect(g[0].kind).toBe('verify');

  // 时间落在首个自然日的深夜（本地时区），与后续天数无关
  const at = new Date(g[0].at);
  expect(at.getFullYear()).toBe(2026);
  expect(at.getMonth()).toBe(8); // 9 月
  expect(at.getDate()).toBe(14);
  expect(at.getHours()).toBe(23);
  expect(at.getMinutes()).toBe(47);

  // 确定性：同输入同输出，不随当前时间变化
  expect(ghostActions(['2026-09-14', '2026-09-15'])[0].at).toBe(
    ghostActions(['2026-09-14', '2026-09-15', '2026-09-17'])[0].at,
  );
});

test('18. 投放：afterDays 与 afterSeen 判定，以及修订的连续出现与红点', () => {
  const S = (days: number, seen: Record<string, number> = {}) => ({ days, seen, reconstruct: {} });

  // 未声明规则的恒满足；afterDays 为严格大于
  expect(meetsRule(undefined, S(1))).toBe(true);
  expect(meetsRule({ afterDays: 1 }, S(1))).toBe(false);
  expect(meetsRule({ afterDays: 1 }, S(2))).toBe(true);

  // afterSeen：任一块达到阅读门槛即可；低于门槛（划过）不算
  expect(meetsRule({ afterSeen: ['x'] }, S(1, {}))).toBe(false);
  expect(meetsRule({ afterSeen: ['x'] }, S(1, { x: 1499 }))).toBe(false);
  expect(meetsRule({ afterSeen: ['x'] }, S(1, { x: 1500 }))).toBe(true);
  expect(meetsRule({ afterSeen: ['x', 'y'] }, S(1, { y: 5000 }))).toBe(true);

  // afterSeenAll：全部达到门槛才满足
  expect(meetsRule({ afterSeenAll: ['a', 'b'] }, S(1, { a: 5000 }))).toBe(false);
  expect(meetsRule({ afterSeenAll: ['a', 'b'] }, S(1, { a: 5000, b: 1500 }))).toBe(true);

  // 手记的投放：读过 12·07 关键块前不出，之后出现
  const note = getEntry('note-zhang')!;
  expect(entryRevealed(note, S(9, {}))).toBe(false);
  expect(entryRevealed(note, S(9, { 'event-1207-summary': 3000 }))).toBe(true);

  // 全案还原：四份记录全部读过之前不出（少一份都不行）
  const kase = getEntry('case-1207')!;
  expect(entryRevealed(kase, S(9, {}))).toBe(false);
  expect(entryRevealed(kase, S(9, { 'record-1207-site-body': 3000 }))).toBe(false);
  expect(
    entryRevealed(
      kase,
      S(9, {
        'record-1207-site-body': 3000,
        'record-1207-device-note': 3000,
        'record-1207-duty-body': 3000,
        'record-1207-family-body': 3000,
      }),
    ),
  ).toBe(true);

  // 热榜修订：第二个自然日起展示到第 1 修订；红点在读出前亮、读过后灭
  const hot = getEntry('record-hotlist')!;
  expect(revisionShown(hot, S(1))).toBe(0);
  expect(revisionShown(hot, S(2))).toBe(1);
  expect(hasUnreadRevision(hot, S(2), {})).toBe(true);
  expect(hasUnreadRevision(hot, S(2), { 'record-hotlist': 1 })).toBe(false);

  // afterScene：完成某个还原台的推断（帧数据重建解锁）后才满足
  const sceneState = (verdict: string | undefined, marks: string[]) => ({
    days: 9,
    seen: {},
    reconstruct: { 'case-1207-reconstruct': { marks, verdict } },
  });
  expect(meetsRule({ afterScene: 'case-1207-reconstruct' }, S(9))).toBe(false);
  expect(meetsRule({ afterScene: 'case-1207-reconstruct' }, sceneState('both', []))).toBe(false);
  expect(
    meetsRule({ afterScene: 'case-1207-reconstruct' }, sceneState('both', ['c1', 'c2', 'c3'])),
  ).toBe(true);
  // 手记第二页的门坐在修订声明里（完成后才出现）
  expect(note.revisions?.[0]?.reveal?.afterScene).toBe('case-1207-reconstruct');

  // anyOf：或组。组内任一满足即可；与其余字段仍是“与”
  expect(meetsRule({ anyOf: [{ afterDays: 1 }, { afterSeen: ['x'] }] }, S(2))).toBe(true);
  expect(meetsRule({ anyOf: [{ afterDays: 99 }, { afterSeen: ['x'] }] }, S(2, { x: 3000 }))).toBe(
    true,
  );
  expect(meetsRule({ anyOf: [{ afterDays: 99 }, { afterSeen: ['x'] }] }, S(2))).toBe(false);
  // 与其它字段的“与”：anyOf 满足但 afterDays 不满足 → 不满足
  expect(meetsRule({ afterDays: 99, anyOf: [{ afterDays: 1 }] }, S(2))).toBe(false);
  // 空组不构成门槛
  expect(meetsRule({ anyOf: [] }, S(1))).toBe(true);

  // afterReview：登记过对应方向才满足；未登记（undefined）不满足
  expect(meetsRule({ afterReview: 'reduce' }, S(9))).toBe(false);
  expect(meetsRule({ afterReview: 'reduce' }, { ...S(9), reviewChoice: 'expand' })).toBe(false);
  expect(meetsRule({ afterReview: 'reduce' }, { ...S(9), reviewChoice: 'reduce' })).toBe(true);
});

test('19. 投放条件的块引用必须真实存在（防静默死链；含 anyOf 递归）', () => {
  const ids = new Set<string>();
  for (const e of ENTRIES) {
    for (const b of e.blocks) ids.add(b.id);
    for (const rev of e.revisions ?? []) for (const b of rev.blocks) ids.add(b.id);
  }
  for (const t of Object.values(TALKS)) for (const p of t.posts) ids.add(p.id);
  for (const b of Object.values(VERIFY_BLOCKS)) ids.add(b.id);
  for (const s of STORIES) for (const b of s.blocks) ids.add(b.id);
  for (const s of CHRONICLES) for (const b of s.blocks) ids.add(b.id);
  for (const s of HOT_SNAPSHOTS) for (const t of s.topics) ids.add(t.id);
  for (const n of NEWS_ISSUES) for (const b of n.items) ids.add(b.id);
  for (const r of NET_RECORDS) ids.add(r.id);
  for (const d of GOV_DOCS) for (const b of d.blocks) ids.add(b.id);

  const checkRule = (rule: RevealRule | undefined) => {
    if (!rule) return;
    for (const id of rule.afterSeen ?? []) expect(ids.has(id)).toBe(true);
    for (const id of rule.afterSeenAll ?? []) expect(ids.has(id)).toBe(true);
    for (const id of rule.afterSeenAtLeast?.ids ?? []) expect(ids.has(id)).toBe(true);
    for (const sub of rule.anyOf ?? []) checkRule(sub);
  };

  for (const e of ENTRIES) {
    checkRule(e.reveal);
    for (const rev of e.revisions ?? []) checkRule(rev.reveal);
  }
  // 口述的投放引用同样不得悬空（连载互锁靠它们）
  for (const s of STORIES) checkRule(s.reveal);
  // 纪事、榜单、新闻、网络存档的投放引用一并入查
  for (const s of CHRONICLES) checkRule(s.reveal);
  for (const s of HOT_SNAPSHOTS) checkRule(s.reveal);
  for (const n of NEWS_ISSUES) checkRule(n.reveal);
  for (const r of NET_RECORDS) checkRule(r.reveal);
  for (const d of GOV_DOCS) checkRule(d.reveal);
});

test('20. 全站块 id 唯一（含修订块与口述）：data-bid 不得重复', () => {
  const seenIds = new Set<string>();
  const dupes: string[] = [];
  const add = (id: string) => {
    if (seenIds.has(id)) dupes.push(id);
    seenIds.add(id);
  };
  for (const e of ENTRIES as WikiEntry[]) {
    for (const b of e.blocks) add(b.id);
    for (const rev of e.revisions ?? []) for (const b of rev.blocks) add(b.id);
  }
  for (const s of STORIES) for (const b of s.blocks) add(b.id);
  for (const s of CHRONICLES) for (const b of s.blocks) add(b.id);
  for (const s of HOT_SNAPSHOTS) for (const t of s.topics) add(t.id);
  for (const n of NEWS_ISSUES) for (const b of n.items) add(b.id);
  for (const r of NET_RECORDS) add(r.id);
  for (const d of GOV_DOCS) for (const b of d.blocks) add(b.id);
  expect(dupes).toEqual([]);
});

test('21. 还原台：矛盾识别与帧重建的解锁条件', () => {
  const scene = CASE1207_SCENE;

  // 两个方向都能识别；未声明的组合不是矛盾（数字吻合的一对是干扰项）
  expect(findConflict(scene, 'scr-2', 'cam-2')?.id).toBe('c1');
  expect(findConflict(scene, 'cam-2', 'scr-2')?.id).toBe('c1');
  expect(findConflict(scene, 'scr-4', 'gat-2')).toBeNull();

  const all = scene.conflicts.map((c) => c.id);
  expect(allMarked(scene, all)).toBe(true);
  expect(allMarked(scene, all.slice(0, 2))).toBe(false);

  // 解锁：必须选择“两条都成立”且全部登记
  expect(frameUnlocked(scene, all, 'both')).toBe(true);
  expect(frameUnlocked(scene, all, 'fault')).toBe(false);
  expect(frameUnlocked(scene, all, 'blank')).toBe(false);
  expect(frameUnlocked(scene, all.slice(0, 2), 'both')).toBe(false);

  // 隐藏选项的出现门槛
  expect(verdictSelectable(all.slice(0, 2))).toBe(false);
  expect(verdictSelectable(all)).toBe(true);
});

test('22. 还原台数据完整性：场景引用与矛盾行都存在（防静默死链）', () => {
  // 全部场景统一检查：矛盾行存在、处置选项（若声明）id 唯一、隐藏项至多一个
  for (const scene of Object.values(SCENES)) {
    const rowIds = new Set<string>();
    for (const rec of scene.records) for (const row of rec.rows) rowIds.add(row.id);
    expect(rowIds.size).toBeGreaterThan(0);
    for (const c of scene.conflicts) {
      expect(rowIds.has(c.rowA)).toBe(true);
      expect(rowIds.has(c.rowB)).toBe(true);
    }
    const vids = (scene.verdicts ?? []).map((v) => v.id);
    expect(new Set(vids).size).toBe(vids.length);
    expect((scene.verdicts ?? []).filter((v) => v.hidden).length).toBeLessThanOrEqual(1);
  }
  for (const e of ENTRIES) {
    for (const b of e.blocks) {
      if (b.type === 'scene') {
        expect(b.scene).toBeTruthy();
        expect(SCENES[b.scene!]).toBeDefined();
      }
    }
  }
});

test('23. 城北口述：与 wiki 的互锁（读记录解锁口述、读口述解锁下一期）', () => {
  const s1 = STORIES[0];
  const s2 = STORIES[1];
  const base = { days: 9, seen: {}, reconstruct: {} };

  // 第一辑：读过 12·07 任一记录后出现
  expect(meetsRule(s1.reveal, base)).toBe(false);
  expect(meetsRule(s1.reveal, { ...base, seen: { 'record-1207-site-body': 3000 } })).toBe(true);

  // 第二辑：即使 12·07 读了、第一辑没读，也不出现（连载互锁）
  expect(meetsRule(s2.reveal, { ...base, seen: { 'record-1207-site-body': 3000 } })).toBe(false);
  expect(meetsRule(s2.reveal, { ...base, seen: { 'story-01-p5': 3000 } })).toBe(true);

  // 纪事首篇：挂在“完成物证推断”上（afterScene）
  const ch = CHRONICLES[0];
  expect(meetsRule(ch.reveal, base)).toBe(false);
  expect(
    meetsRule(ch.reveal, {
      days: 9,
      seen: {},
      reconstruct: { 'case-1207-reconstruct': { marks: ['c1', 'c2', 'c3'], verdict: 'both' } },
    }),
  ).toBe(true);
  // 多入射角：叙事路径——任意三件 12·07 材料（记录/转写/证词）即可入；
  // 混读两件仍不够。深链路径不受影响。
  expect(
    meetsRule(ch.reveal, { ...base, seen: { 'record-1207-site-body': 3000, 'story-01-p5': 3000 } }),
  ).toBe(false);
  expect(
    meetsRule(ch.reveal, {
      ...base,
      seen: { 'record-1207-site-body': 3000, 'story-01-p5': 3000, 'story-04-p5': 3000 },
    }),
  ).toBe(true);

  // 纪事第二篇：挂在陆先生来信上——读汇编读到深处，"有人写出了十一月的故事"。
  const ch2 = CHRONICLES[1];
  expect(ch2.id).toBe('chronicle-02');
  expect(meetsRule(ch2.reveal, base)).toBe(false);
  expect(meetsRule(ch2.reveal, { ...base, seen: { 'qx2410-letter-3': 3000 } })).toBe(true);

  // 纪事第三篇：挂在《11·29 电子屏异常》经过段上——第二波的博主视角。
  const ch3 = CHRONICLES[2];
  expect(ch3.id).toBe('chronicle-03');
  expect(meetsRule(ch3.reveal, base)).toBe(false);
  expect(meetsRule(ch3.reveal, { ...base, seen: { 'event-1129-summary': 3000 } })).toBe(true);
});

test('24. 外部材料存档：投放链与结构完整性（同一事件多载体互证）', () => {
  // 榜单三期，名次连续；11·06 期 11 条（含徐公巷征集那条地名回声），其余各 10 条
  expect(HOT_SNAPSHOTS.map((s) => s.id)).toEqual(['hot-1031', 'hot-1106', 'hot-1112']);
  const COUNT: Record<string, number> = { 'hot-1031': 10, 'hot-1106': 11, 'hot-1112': 10 };
  for (const s of HOT_SNAPSHOTS) {
    expect(s.topics).toHaveLength(COUNT[s.id]);
    s.topics.forEach((t, i) => expect(t.rank).toBe(i + 1));
  }

  // 11·12 榜单与 11·10 新闻：门都坐在小说黑屏那一块上
  const hot1112 = HOT_SNAPSHOTS.find((s) => s.id === 'hot-1112')!;
  expect(hot1112.reveal?.afterSeen).toEqual(['chronicle-02-blackout']);
  const news1110 = NEWS_ISSUES.find((n) => n.id === 'news-1110')!;
  expect(news1110.reveal?.afterSeen).toEqual(['chronicle-02-blackout']);

  // 11·6 榜单与 11·4 新闻：与小说同批，坐在来信上
  const hot1106 = HOT_SNAPSHOTS.find((s) => s.id === 'hot-1106')!;
  expect(hot1106.reveal?.afterSeen).toEqual(['qx2410-letter-3']);
  const news1104 = NEWS_ISSUES.find((n) => n.id === 'news-1104')!;
  expect(news1104.reveal?.afterSeen).toEqual(['qx2410-letter-3']);

  // 网络存档：两个批次的门（来信 / 黑屏）
  const gates = NET_RECORDS.filter((r) => r.reveal).map((r) => r.id);
  expect(gates).toEqual([
    'net-1105',
    'net-1106',
    'net-1107',
    'net-1107-2',
    'net-1108',
    'net-1109',
    'net-1110',
    'net-1112',
    'net-1113',
    'net-1114',
    'net-1115',
  ]);
  const netBlackout = NET_RECORDS.filter((r) => r.reveal?.afterSeen?.[0] === 'chronicle-02-blackout');
  expect(netBlackout).toHaveLength(7);

  // 黑屏块真实存在且属于连载二（上列所有门引用的就是它）
  const blackout = CHRONICLES.flatMap((s) => s.blocks).find((b) => b.id === 'chronicle-02-blackout');
  expect(blackout).toBeDefined();
  expect(blackout?.text).toContain('所有屏幕');

  // 官方口径与小说的互证锚点：11·10 档内有"不慎摔倒"
  const allNews = NEWS_ISSUES.flatMap((n) => n.items.map((b) => b.text ?? '')).join('\n');
  expect(allNews).toContain('不慎摔倒受伤');
  // 弹幕摘录里正是小说黑屏那一刻的民间回声
  const net1108 = NET_RECORDS.find((r) => r.id === 'net-1108')!;
  expect((net1108.lines ?? []).join('')).toContain('屏幕黑了一下你们也有吗');
});

test('25. 话题页：每条上榜话题均可点入（有描述），重点话题带讨论摘录', () => {
  // 话题页是"点进热搜有内容"的直接依据：描述与数据行一条不缺
  for (const s of HOT_SNAPSHOTS) {
    for (const t of s.topics) {
      expect(t.desc && t.desc.length > 0).toBe(true);
      expect(t.stat).toBeTruthy();
    }
  }

  // 高热话题带讨论摘录（白影相关为重点）
  const withPosts = HOT_SNAPSHOTS.flatMap((s) => s.topics).filter((t) => (t.posts ?? []).length > 0);
  expect(withPosts.length).toBeGreaterThanOrEqual(8);

  // 话题 id 全局唯一，且与路由穷举表一致
  const ids = HOT_SNAPSHOTS.flatMap((s) => s.topics.map((t) => t.id));
  expect(new Set(ids).size).toBe(ids.length);
  expect(HOT_TOPIC_IDS).toEqual(ids);
});

test('26. 12·14 事件组：三层投放链，规则是推出来的（“白溢”口径）', () => {
  const base = { days: 9, seen: {}, reconstruct: {} };
  const S = (seen: Record<string, number>) => ({ ...base, seen });

  // 第一层：读 12·07 正文（任一块）后，事件条目与值班记录出现
  const ev = getEntry('event-1214')!;
  const duty = getEntry('record-1214-duty')!;
  expect(entryRevealed(ev, base)).toBe(false);
  expect(entryRevealed(ev, S({ 'event-1207-quote': 3000 }))).toBe(true);
  expect(entryRevealed(duty, S({ 'event-1207-quote': 3000 }))).toBe(true);

  // 第二层：读事件条目经过段后，方案与告知书出现
  const plan = getEntry('record-1214-plan')!;
  const notice = getEntry('record-1214-notice')!;
  expect(entryRevealed(plan, base)).toBe(false);
  expect(entryRevealed(plan, S({ 'event-1214-summary': 3000 }))).toBe(true);
  expect(entryRevealed(notice, S({ 'event-1214-summary': 3000 }))).toBe(true);

  // 第三层：读值班记录"场内为白"段后，复盘纪要与"白溢"口径出现
  const review = getEntry('record-1214-review')!;
  const baiyi = getEntry('record-baiyi')!;
  expect(entryRevealed(review, base)).toBe(false);
  expect(entryRevealed(review, S({ 'record-1214-duty-white': 3000 }))).toBe(true);
  expect(entryRevealed(baiyi, S({ 'record-1214-duty-white': 3000 }))).toBe(true);

  // "白溢"口径：工作词、追认编号、不得外传——规则诞生现场的纹理
  const doc = (baiyi.blocks.find((b) => b.id === 'record-baiyi-items')!.items ?? []).join('\n');
  expect(doc).toContain('工作词');
  expect(doc).toContain('BL-01');
  expect(doc).toContain('BL-02');

  // 复盘承认"成因未尽明确"——机制靠事件摸索，不给完美结论
  const rev = review.blocks.map((b) => b.text ?? '').join('\n');
  expect(rev).toContain('成因未尽明确');

  // 事件条目被覆盖的原文为"复现 5 名"（与复盘清点口径一致）
  const rolled = ev.history.find((r) => r.overwritten);
  expect(rolled?.underlyingText ?? '').toContain('复现 5 名');
});

test('27. 白昼馆章末链：证词 → 41 小时 → 手记 → 监控 → 词条修订（红点）', () => {
  const base = { days: 9, seen: {}, reconstruct: {} };
  const S = (seen: Record<string, number>) => ({ ...base, seen });

  const c = getEntry('testimony-c')!;
  const log = getEntry('record-dingmao-41h')!;
  const note = getEntry('note-chenglu')!;
  const cam = getEntry('record-daylight-cam')!;
  const house = getEntry('daylight-house')!;

  // 丁茂证词：散落（unlisted）；日志挂在"全都回头了"那一块上
  expect(c.unlisted).toBe(true);
  expect(entryRevealed(log, base)).toBe(false);
  expect(entryRevealed(log, S({ 'testimony-c-look': 3000 }))).toBe(true);

  // 手记挂在日志的"回头"句上
  expect(entryRevealed(note, base)).toBe(false);
  expect(entryRevealed(note, S({ 'record-dingmao-41h-fear': 3000 }))).toBe(true);

  // 监控摘要与房门记录挂手记断页处
  expect(entryRevealed(cam, base)).toBe(false);
  expect(entryRevealed(cam, S({ 'note-chenglu-break': 3000 }))).toBe(true);

  // 词条修订（章末收束）：悬在手记断页处，未读带红点
  expect(revisionShown(house, base)).toBe(0);
  expect(revisionShown(house, S({ 'note-chenglu-break': 3000 }))).toBe(1);
  expect(hasUnreadRevision(house, S({ 'note-chenglu-break': 3000 }), {})).toBe(true);
  expect(hasUnreadRevision(house, S({ 'note-chenglu-break': 3000 }), { 'daylight-house': 1 })).toBe(
    false,
  );

  // 震撼句在日志末尾（不给后续解释）；手记的三记重锤
  const fear = log.blocks.find((b) => b.id === 'record-dingmao-41h-fear')!;
  expect(fear.text).toContain('学我怎么害怕');
  const words = note.blocks.map((b) => b.text ?? '').join('\n');
  expect(words).toContain('摆得非常好');
  expect(words).toContain('地毯是干的');
});

test('28. 白昼馆还原：≥2 份证词的门控与场景通过项', () => {
  const base = { days: 9, seen: {}, reconstruct: {} };
  const S = (seen: Record<string, number>) => ({ ...base, seen });

  const kase = getEntry('case-daylight')!;
  expect(entryRevealed(kase, base)).toBe(false);
  // 一份不够
  expect(entryRevealed(kase, S({ 'testimony-a-4': 3000 }))).toBe(false);
  // 任意两份即够
  expect(entryRevealed(kase, S({ 'testimony-a-4': 3000, 'testimony-c-look': 3000 }))).toBe(true);
  expect(entryRevealed(kase, S({ 'testimony-b-6': 3000, 'testimony-c-look': 3000 }))).toBe(true);

  // 场景：通过项是隐藏项，且解锁终章需要“全部登记 + 通过项”
  const scene = SCENES['daylight-reconstruct']!;
  expect(passVerdictId(scene)).toBe('all-true');
  const all = scene.conflicts.map((c) => c.id);
  expect(frameUnlocked(scene, all, 'all-true')).toBe(true);
  expect(frameUnlocked(scene, all, 'mistake')).toBe(false);
  expect(frameUnlocked(scene, all.slice(0, 2), 'all-true')).toBe(false);

  // 追问链：露台门禁与“直接回房”是声明好的矛盾；终章补录含“没有影子”
  expect(findConflict(scene, 'd-xu-h', 'd-obj-terr')?.id).toBe('dc3');
  expect(scene.finale.lines.join('')).toContain('没有影子');
});

test('29. 第四幕链：白溢→须知增补（第 8 条+台账+附则）→函；复盘→唐继立场', () => {
  const base = { days: 9, seen: {}, reconstruct: {} };
  const S = (seen: Record<string, number>) => ({ ...base, seen });

  // 须知增补：读过白溢“工作词”条目后，修订并入正文——未读时带红点
  const guide = getEntry('new-editor-guide')!;
  expect(revisionShown(guide, base)).toBe(0);
  expect(revisionShown(guide, S({ 'record-baiyi-items': 3000 }))).toBe(1);
  expect(hasUnreadRevision(guide, S({ 'record-baiyi-items': 3000 }), {})).toBe(true);

  // 增补四块：口径行、“8”、台账（动态）、附则（第三选项的钥匙）
  const rev = guide.revisions![0];
  const revText = rev.blocks.map((b) => b.text ?? '').join('\n');
  expect(revText).toContain('由系统直接写入');
  expect(revText).toContain('你已经读了很多遍了');
  expect(revText).toContain('不得代为签收');
  expect(rev.blocks.some((b) => b.type === 'ledger' && b.ledgerVariant === 'notice')).toBe(true);

  // 唐继立场：复盘“成因未尽明确”之后并入；2019 首次入戏
  const tang = getEntry('person-tangji')!;
  expect(revisionShown(tang, base)).toBe(0);
  expect(revisionShown(tang, S({ 'record-1214-review-5': 3000 }))).toBe(1);
  const tangText = (tang.revisions ?? [])
    .flatMap((r) => r.blocks)
    .map((b) => b.text ?? '')
    .join('\n');
  expect(tangText).toContain('我宁愿在过载中维持稳定');
  expect(tangText).toContain('2019 年');

  // 签收单：读过须知增补的台账块之后送达；“不点”的钥匙与代签文书俱在
  const receipt = getEntry('witness-receipt')!;
  expect(entryRevealed(receipt, base)).toBe(false);
  expect(entryRevealed(receipt, S({ 'new-editor-guide-rev8-ledger': 3000 }))).toBe(true);
  expect(receipt.blocks.some((b) => b.type === 'receipt-seal')).toBe(true);
  expect(receipt.blocks.some((b) => b.type === 'ledger' && b.ledgerVariant === 'receipt')).toBe(
    true,
  );
  const receiptText = receipt.blocks.map((b) => b.text ?? '').join('\n');
  expect(receiptText).toContain('无需回执');
  expect(receiptText).toContain('更正不改变见证关系');
});

test('30. 玩家台账：数字全真（编号/条目/回访/最长段/复制），空档不崩', () => {
  const data = buildLedger({
    seen: {
      'record-1214-duty-white': 252_000, // 停留最久：4 分 12 秒
      'record-baiyi-items': 4000,
    },
    snapshots: {
      a: { text: '还是要有人看着', at: 200 },
      b: { text: '更早的一条', at: 100 },
    },
    visits: {
      'new-editor-guide': { n: 3, firstAt: 100 },
      'record-1214-duty': { n: 1, firstAt: 200 },
      'news:news-1024': { n: 2, firstAt: 300 },
    },
    days: ['2024-10-31', '2024-11-01'],
  });

  expect(data.viewerId).toMatch(/^GA-[0-9A-F]{6}$/);
  expect(data.entriesOpened).toBe(2);
  expect(data.otherOpened).toBe(1);
  expect(data.revisits).toBe(3); // (3+1+2) - 2 个词条 - 1 份栏目
  expect(data.spanDays).toBe(2);
  expect(data.firstDay).toBe('2024-10-31');
  // 最长段：文本与归属都从原文取，时长写成台账样式
  expect(data.longest?.title).toBe('12·14 行动值班记录');
  expect(data.longest?.excerpt).toContain('场内为白');
  expect(data.longest?.dur).toBe('4 分 12 秒');
  // 复制过的段落：取最新一条快照
  expect(data.copied?.excerpt).toBe('还是要有人看着');
  expect(data.copied?.count).toBe(2);
  // 涉及条目按首次到访先后排列
  expect(data.openedTitles[0]).toBe('新编辑须知（临时版）');

  // 空档：不崩，全部兜底
  const empty = buildLedger({ seen: {}, snapshots: {}, visits: {}, days: [] });
  expect(empty.viewerId).toBe('GA-000000');
  expect(empty.entriesOpened).toBe(0);
  expect(empty.longest).toBeNull();
  expect(empty.copied).toBeNull();
});

test('31. 签收三态：确认/更正都代签（一旦写入不可撤销），不点隔日未生效', () => {
  const t0 = new Date('2026-09-16T10:00:00').getTime();
  const t1 = new Date('2026-09-17T10:00:00').getTime();

  expect(receiptState({ sealed: false, firstAt: t0, now: t0 })).toBe('open');
  expect(receiptState({ sealed: false, firstAt: t0, now: t1 })).toBe('expired');
  expect(receiptState({ sealed: true, firstAt: t0, now: t1 })).toBe('sealed');
  expect(receiptState({ sealed: false })).toBe('open');

  // 写入路径：确认与更正同类，先落定者生效；清档后回零
  const state = useTrace.getState();
  state.resetAll();
  state.sealReceipt('correct');
  state.sealReceipt('confirm');
  expect(useTrace.getState().receipt?.kind).toBe('correct');
  state.resetAll();
  expect(useTrace.getState().receipt).toBeNull();

  // 回执行的动态文案：签与不签在登记簿上落成两样的字
  expect(sealText(null)).toBe('（未填）');
  expect(sealText({ kind: 'confirm' })).toBe('已确认（代签）');
  expect(sealText({ kind: 'correct' })).toBe('已更正（代签）');
});

test('32. 许衡补遗：挂附则块；五条补注逐条扣回他的经手事', () => {
  const base = { days: 9, seen: {}, reconstruct: {} };
  const S = (seen: Record<string, number>) => ({ ...base, seen });

  const buyi = getEntry('note-xuheng-buyi')!;
  expect(entryRevealed(buyi, base)).toBe(false);
  expect(entryRevealed(buyi, S({ 'new-editor-guide-rev8-note': 3000 }))).toBe(true);

  const text = buyi.blocks.map((b) => b.text ?? '').join('\n');
  expect(text).toContain('不在站里');
  expect(text).toContain('报告里没有这一栏');
  expect(text).toContain('划痕在');
  expect(text).toContain('像一次正常保存');
  expect(text).toContain('出处我核过');
  // 引子里点名（保证“许衡”可检索到本件）
  expect(text).toContain('许衡');
});

test('33. 申请表：两立场齐备才出现；回执顺序按提交时刻，不可撤回', () => {
  const base = { days: 9, seen: {}, reconstruct: {} };
  const S = (seen: Record<string, number>) => ({ ...base, seen });

  const form = getEntry('application-forms')!;
  expect(entryRevealed(form, base)).toBe(false);
  // 只有唐继立场：不够
  expect(entryRevealed(form, S({ 'person-tangji-rev1-4': 3000 }))).toBe(false);
  // 只有许衡补注：不够
  expect(entryRevealed(form, S({ 'note-xuheng-buyi-5': 3000 }))).toBe(false);
  // 两边都读：表格开放
  expect(
    entryRevealed(form, S({ 'person-tangji-rev1-4': 3000, 'note-xuheng-buyi-5': 3000 })),
  ).toBe(true);

  // 回执编号按提交先后；只提交一份时它就是 -01
  expect(applicationOrder({})).toEqual([]);
  expect(applicationOrder({ reduced: 200 })).toEqual(['reduced']);
  expect(applicationOrder({ reduced: 200, full: 100 })).toEqual(['full', 'reduced']);

  // 提交写入路径：两份可先后提交；重复提交不覆盖；清档后回零
  const state = useTrace.getState();
  state.resetAll();
  state.submitApplication('full');
  state.submitApplication('reduced');
  expect(Object.keys(useTrace.getState().applications)).toHaveLength(2);
  const at = useTrace.getState().applications.full;
  state.submitApplication('full');
  expect(useTrace.getState().applications.full).toBe(at);
  state.resetAll();
  expect(useTrace.getState().applications).toEqual({});

  // 幽灵第三项：它不是被申请出来的，两份回执共有
  expect(APPLICATION_FORM.ghost).toContain('由现行观测自动执行');
  expect(APPLICATION_FORM.entries).toHaveLength(2);
});

test('34. Meta 一击：《档案调阅登记》挂函清册；三行动态行模板在数据侧', () => {
  const base = { days: 9, seen: {}, reconstruct: {} };
  const S = (seen: Record<string, number>) => ({ ...base, seen });

  const reg = getEntry('access-register')!;
  expect(entryRevealed(reg, base)).toBe(false);
  expect(entryRevealed(reg, S({ 'witness-receipt-ledger': 3000 }))).toBe(true);

  // 三行动态行：一行动在“过去”（只填 {id}，日期是文书自己的）；
  // 一行填签收状态（{seal}）；一行是本次（{day}+{id}）
  const lines = reg.blocks.filter((b) => b.type === 'register');
  expect(lines).toHaveLength(3);
  const past = lines.find((b) => b.text?.includes('2024.11.03'))!;
  expect(past.text).toContain('{id}');
  expect(past.text).not.toContain('{day}');
  expect(past.text).toContain('10·24 相关材料汇编');
  const seal = lines.find((b) => b.text?.includes('{seal}'))!;
  expect(seal.text).toContain('函件：见证人确认函');
  expect(seal.text).toContain('回执：{seal}');
  const current = lines.find((b) => b.text?.includes('本登记簿'))!;
  expect(current.text).toContain('{day}');

  // 摘录按原簿顺序：10.28 → 11.03（动态）→ 11.07 → …… → 函件回执行 → 当前行 → 尾注
  const ids = reg.blocks.map((b) => b.id);
  expect(ids.indexOf('access-register-line-1028')).toBeLessThan(
    ids.indexOf('access-register-line-1103'),
  );
  expect(ids.indexOf('access-register-line-1103')).toBeLessThan(
    ids.indexOf('access-register-line-1107'),
  );
  expect(ids.indexOf('access-register-line-1215')).toBeLessThan(
    ids.indexOf('access-register-line-seal'),
  );
  expect(ids.indexOf('access-register-line-seal')).toBeLessThan(
    ids.indexOf('access-register-line-current'),
  );
  expect(ids.indexOf('access-register-line-current')).toBeLessThan(
    ids.indexOf('access-register-tail'),
  );
});

test('35. 连载四：读完连载一后出现；留言板三句定稿、与连载一无缝对接', () => {
  const base = { days: 9, seen: {}, reconstruct: {} };

  const ch4 = CHRONICLES[3];
  expect(ch4.id).toBe('chronicle-04');
  expect(meetsRule(ch4.reveal, base)).toBe(false);
  expect(meetsRule(ch4.reveal, { ...base, seen: { 'chronicle-01-p46': 3000 } })).toBe(true);

  // 留言板三种笔迹合写的一句（章 3 引用时不得改写）：三段依次为
  // “从山上看城北”→“一清二楚”→“心里发毛”
  const byId = (id: string) => ch4.blocks.find((b) => b.id === id)?.text ?? '';
  expect(byId('chronicle-04-p45')).toBe('从山上看城北');
  expect(byId('chronicle-04-p47')).toBe('一清二楚');
  expect(byId('chronicle-04-p51')).toBe('心里发毛');
  const seq = ch4.blocks.map((b) => b.id);
  expect(seq.indexOf('chronicle-04-p45')).toBeLessThan(seq.indexOf('chronicle-04-p47'));
  expect(seq.indexOf('chronicle-04-p47')).toBeLessThan(seq.indexOf('chronicle-04-p51'));

  // 民间幽灵禁忌与结尾接口：前者不解释，后者锁回连载一
  expect(byId('chronicle-04-p41')).toBe('别站正中间。站边上。');
  expect(byId('chronicle-04-p62')).toContain('12 月 7 日，周六');
  // 小雨提前“挪到边上”的行为在留言板之前（读者向回照应）
  expect(byId('chronicle-04-p29')).toContain('往边上挪了两步');
});

test('36. 连载五：读完监控摘要后出现；老周三口述与巡楼“正常。”现场化', () => {
  const base = { days: 9, seen: {}, reconstruct: {} };

  const ch5 = CHRONICLES[4];
  expect(ch5.id).toBe('chronicle-05');
  expect(meetsRule(ch5.reveal, base)).toBe(false);
  expect(meetsRule(ch5.reveal, { ...base, seen: { 'record-daylight-cam-note': 3000 } })).toBe(
    true,
  );

  const byId = (id: string) => ch5.blocks.find((b) => b.id === id)?.text ?? '';
  const all = ch5.blocks.map((b) => b.text ?? '').join('\n');
  // 老周三条口述的现场：拖声（看屏是空廊）、土腥味（当晚没有风）、湿印子（与拖把水混掉）
  expect(all).toContain('一下一下的，很匀');
  expect(all).toContain('那一晚没有风');
  expect(all).toContain('湿的。');
  expect(byId('chronicle-05-p73')).toContain('混在一处');
  // “正常”体系的总结句与结尾回收句
  expect(byId('chronicle-05-p116')).toContain('本子上一个字也没有');
  expect(byId('chronicle-05-p122')).toBe('看完了，才把本子合上。');
  // 12·04 的一句对白（“是干的。”）与毛巾人偶的现场
  expect(all).toContain('“地毯是干的。”');
  expect(all).toContain('“是干的。”');
  expect(all).toContain('手搭在膝盖上');
  // 纪律：不出现“借位者”；不解释四人是谁
  expect(all).not.toContain('借位者');
});

test('37. 连载六：读连载四后出现；山顶的灯与两个民间口径钉板', () => {
  const base = { days: 9, seen: {}, reconstruct: {} };

  const ch6 = CHRONICLES[5];
  expect(ch6.id).toBe('chronicle-06');
  expect(meetsRule(ch6.reveal, base)).toBe(false);
  expect(meetsRule(ch6.reveal, { ...base, seen: { 'chronicle-04-p51': 3000 } })).toBe(true);
  expect(meetsRule(ch6.reveal, { ...base, seen: { 'chronicle-04-p41': 3000 } })).toBe(true);

  const all = ch6.blocks.map((b) => b.text ?? '').join('\n');
  // 民间记忆与口径：那晚的亮 / “试机呢” / 连一颗螺丝都没留下
  expect(all).toContain('那天晚上，山顶特别亮');
  expect(all).toContain('试机呢');
  expect(all).toContain('连一颗螺丝都没留下');
  // 叠加的民间表述与“没有恶人”
  expect(all).toContain('怎么都凑这几天上山来了');
  expect(all).toContain('给您拾摊拾摊');
  // 锁连载四：三个年轻人与留言板；提前回照“别站正中间”
  expect(all).toContain('从山上看城北，一清二楚，心里发毛');
  expect(all).toContain('别站正中间。站边上。');
  // 收尾回收（看夜景的地方，灯不能亮 / 这样最好）
  expect(all).toContain('看夜景的地方，灯不能亮');
  expect(ch6.blocks[ch6.blocks.length - 1].text).toBe('这样最好。');
  // 纪律：不出现 Argus/波状传播/递归结算等内部词
  expect(all).not.toContain('Argus');
  expect(all).not.toContain('递归');
  expect(all).not.toContain('波状');
});

test('38. 连载七与口述第三辑：链式投放；“不写判断”与老板口径钉板', () => {
  const base = { days: 9, seen: {}, reconstruct: {} };

  // 连载七：读连载六“三种笔迹”段后出现
  const ch7 = CHRONICLES[6];
  expect(ch7.id).toBe('chronicle-07');
  expect(meetsRule(ch7.reveal, base)).toBe(false);
  expect(meetsRule(ch7.reveal, { ...base, seen: { 'chronicle-06-p57': 3000 } })).toBe(true);
  const ch7All = ch7.blocks.map((b) => b.text ?? '').join('\n');
  // 全文最重的一笔：观察与判断
  expect(ch7All).toContain('记录只写观察，不写判断');
  expect(ch7All).toContain('天光变化，持续约四分钟');
  // “没有恶人”与报告改写史
  expect(ch7All).toContain('钟工是个好人');
  expect(ch7All).toContain('没有一个字是站得住的');
  // 锁连载四/六与结尾动作
  expect(ch7All).toContain('那条线叫北环路');
  expect(ch7All).toContain('一个字一个字删的');
  // 纪律：同样不出现内部词
  expect(ch7All).not.toContain('Argus');
  expect(ch7All).not.toContain('波状');

  // 口述第三辑：读连载六小卖部老板那句后出现
  const s3 = STORIES[2];
  expect(s3.id).toBe('story-03');
  expect(meetsRule(s3.reveal, base)).toBe(false);
  expect(meetsRule(s3.reveal, { ...base, seen: { 'chronicle-06-p47': 3000 } })).toBe(true);
  const s3All = s3.blocks.map((b) => b.text ?? '').join('\n');
  expect(s3All).toContain('修东西呢');
  expect(s3All).toContain('卖你的水');
  // 老周口述的一致性修复（与连载五对齐：七年、晚十点班）
  const s2 = STORIES[1];
  expect(s2.speaker).toContain('七年');
  expect(s2.blocks[1].text).toContain('晚上十点到早上六点');
});

test('39. 青岚山档案层：四件的投放链与三处互证', () => {
  const base = { days: 9, seen: {}, reconstruct: {} };
  const S = (seen: Record<string, number>) => ({ ...base, seen });

  // 公园词条：上线（撞见入口）；闭园通告与侧记：读公园“沿革”段后一组浮现
  const park = getEntry('qinglan-park')!;
  expect(park.reveal).toBeUndefined();
  const parkText = park.blocks.map((b) => b.text ?? (b.items ?? []).join('')).join('\n');
  // 与连载四互证：冬季延长开放“晚上九点半前可上山”
  expect(parkText).toContain('21:30');
  // 官方版的“别上山脊”
  expect(parkText).toContain('17:30 后关闭');
  // 含糊的一句闭园史（与连载六“闭园两个月”互证）
  expect(parkText).toContain('闭园两个月');

  const closure = getEntry('qinglan-closure-2018')!;
  expect(entryRevealed(closure, base)).toBe(false);
  expect(entryRevealed(closure, S({ 'qinglan-park-history': 3000 }))).toBe(true);
  const closureText = closure.blocks.map((b) => b.text ?? '').join('\n');
  expect(closureText).toContain('设备调试收尾');
  expect(closureText).toContain('11 月 5 日起闭园');

  // 侧记：与通告同门浮现；校订修订练在通告之后；声明改过而正文仍是旧词（不解释）
  const side = getEntry('argus-side-note')!;
  expect(entryRevealed(side, base)).toBe(false);
  expect(entryRevealed(side, S({ 'qinglan-park-history': 3000 }))).toBe(true);
  const sideText = side.blocks.map((b) => b.text ?? '').join('\n');
  expect(sideText).toContain('示范点位');
  expect(sideText).toContain('2018 年 10 月');
  expect(revisionShown(side, base)).toBe(0);
  expect(revisionShown(side, S({ 'qinglan-closure-head': 3000 }))).toBe(1);
  const revText = (side.revisions ?? []).flatMap((r) => r.blocks).map((b) => b.text ?? '').join('\n');
  expect(revText).toContain('试点点位');
  expect(revText).toContain('季节性表述');

  // 离职登记：散落（unlisted）；读连载七“离职”段后可检索
  const leavers = getEntry('argus-leavers')!;
  expect(leavers.unlisted).toBe(true);
  expect(entryRevealed(leavers, base)).toBe(false);
  expect(entryRevealed(leavers, S({ 'chronicle-07-p40': 3000 }))).toBe(true);
  const rows = (leavers.blocks.find((b) => b.id === 'argus-leavers-table')?.rows ?? []).flat();
  expect(rows.join('')).toContain('2018.11');
  expect(rows.join('')).toContain('合同期满');
});

test('40. 冷库章：五件档案链 + 《冬至》三件齐读才开', () => {
  const base = { days: 9, seen: {}, reconstruct: {} };
  const S = (seen: Record<string, number>) => ({ ...base, seen });

  // 词条挂“读 12·07 概述”门；值班/温度两件 unlisted，门挂在词条正文之后
  // （仅检索可达，但不是第一天可达——详见 60）；报告→说明逐级门控
  const cs = getEntry('coldstore')!;
  expect(entryRevealed(cs, base)).toBe(false);
  expect(entryRevealed(cs, S({ 'event-1207-summary': 3000 }))).toBe(true);
  const duty = getEntry('record-coldstore-duty')!;
  expect(duty.unlisted).toBe(true);
  expect(entryRevealed(duty, base)).toBe(false);
  expect(entryRevealed(duty, S({ 'coldstore-history': 3000 }))).toBe(true);
  const temp = getEntry('record-coldstore-temp')!;
  expect(entryRevealed(temp, base)).toBe(false);
  expect(entryRevealed(temp, S({ 'coldstore-history': 3000 }))).toBe(true);
  const report = getEntry('record-coldstore-report')!;
  expect(entryRevealed(report, base)).toBe(false);
  expect(entryRevealed(report, S({ 'coldstore-duty-end': 3000 }))).toBe(true);
  const explain = getEntry('record-coldstore-explain')!;
  expect(entryRevealed(explain, base)).toBe(false);
  expect(entryRevealed(explain, S({ 'coldstore-report-body': 3000 }))).toBe(true);

  // EX-08 落地：2.4℃ 与“无观测设备在运行”
  const tempText = temp.blocks.map((b) => b.text ?? '').join('\n');
  expect(tempText).toContain('2.4℃');
  expect(tempText).toContain('无观测设备在运行');
  expect(tempText).toContain('无绘图人签名');
  // 值班记录：末行停于 22:14
  const dutyText = duty.blocks.map((b) => b.text ?? '').join('\n');
  expect(dutyText).toContain('22:14　停电。');
  expect(dutyText).toContain('本页至此无字');
  // 说明件：停工资与“配合有关部门后续工作”（冷）
  const exText = explain.blocks.map((b) => b.text ?? '').join('\n');
  expect(exText).toContain('工资发放至当月起停止');

  // 《冬至》：三件齐读才开；40 分钟切在椅子那一拍
  const ch8 = CHRONICLES[7];
  expect(ch8.id).toBe('chronicle-08');
  expect(meetsRule(ch8.reveal, base)).toBe(false);
  expect(
    meetsRule(ch8.reveal, S({ 'coldstore-duty-end': 3000, 'coldstore-temp-body': 3000 })),
  ).toBe(false);
  expect(
    meetsRule(
      ch8.reveal,
      S({ 'coldstore-duty-end': 3000, 'coldstore-temp-body': 3000, 'coldstore-report-body': 3000 }),
    ),
  ).toBe(true);
  const ch8All = ch8.blocks.map((b) => b.text ?? '').join('\n');
  expect(ch8All).toContain('他没有扶');
  expect(ch8All).toContain('未领');
  expect(ch8All).toContain('吃饺子了吗');
  // 纪律：不解释机制（不出现“未定稿”等词）
  expect(ch8All).not.toContain('未定稿');
  expect(ch8All).not.toContain('剪枝');
});

test('41. 尾声组：状态摘录/交接单/处理方案三链与缺席检测', () => {
  const base = { days: 9, seen: {}, reconstruct: {} };
  const S = (seen: Record<string, number>) => ({ ...base, seen });

  // 状态摘录：读过冷库说明后可见；全站最硬的一行
  const ps = getEntry('record-person-status')!;
  expect(entryRevealed(ps, base)).toBe(false);
  expect(entryRevealed(ps, S({ 'coldstore-explain-end': 3000 }))).toBe(true);
  expect(ps.blocks.map((b) => b.text ?? '').join('\n')).toContain('状态：未定稿。');

  // 交接单：两线合流（手记断页 + 冷库链）；接收人栏为空
  const ho = getEntry('chenglu-handover')!;
  expect(entryRevealed(ho, base)).toBe(false);
  expect(entryRevealed(ho, S({ 'note-chenglu-break': 3000 }))).toBe(false);
  expect(
    meetsRule(ho.reveal, S({ 'note-chenglu-break': 3000, 'coldstore-explain-end': 3000 })),
  ).toBe(true);
  const hoText = ho.blocks.map((b) => (b.items ?? [b.text ?? '']).join('\n')).join('\n');
  expect(hoText).toContain('接收人：');
  expect(hoText).toContain('建议后续接手人重新申请');
  expect(hoText).toContain('房间物品保持原地');

  // 处理方案：三链齐备才可检索；含 final-choice 块
  const fp = getEntry('final-plan')!;
  expect(entryRevealed(fp, base)).toBe(false);
  expect(
    meetsRule(
      fp.reveal,
      S({
        'chenglu-handover-open': 3000,
        'record-person-status-body': 3000,
        'chronicle-08-p54': 3000,
      }),
    ),
  ).toBe(true);
  expect(fp.blocks.some((b) => b.type === 'final-choice')).toBe(true);

  // 缺席检测：只读 days；<2 不算；差 2 天不算；差 3 天算
  expect(absentLongEnough([])).toBe(false);
  expect(absentLongEnough(['2024-12-01'])).toBe(false);
  expect(absentLongEnough(['2024-12-01', '2024-12-03'])).toBe(false);
  expect(absentLongEnough(['2024-12-01', '2024-12-04'])).toBe(true);
  expect(absentLongEnough(['bad', 'also-bad'])).toBe(false);

  // 写入路径：选择与签名均不可覆盖；清档后归零
  const state = useTrace.getState();
  state.resetAll();
  state.setFinalChoice('C');
  state.setFinalChoice('A');
  expect(useTrace.getState().finalChoice).toBe('C');
  state.signLedger();
  const t = useTrace.getState().signature;
  state.signLedger();
  expect(useTrace.getState().signature).toBe(t);
  state.resetAll();
  expect(useTrace.getState().finalChoice).toBeNull();
  expect(useTrace.getState().signature).toBeNull();
});

test('42. 两件缺口：幕三征询与章 3 登顶交互的链路与写入', () => {
  const base = { days: 9, seen: {}, reconstruct: {} };
  const S = (seen: Record<string, number>) => ({ ...base, seen });

  // 幕三核心选择：读监控摘要尾块后出现；两方向后果文本都在（无正确答案）
  const rv = getEntry('daylight-review')!;
  expect(entryRevealed(rv, base)).toBe(false);
  expect(entryRevealed(rv, S({ 'record-daylight-cam-note': 3000 }))).toBe(true);
  expect(rv.blocks.some((b) => b.type === 'review-ask')).toBe(true);
  const rvText = DAYLIGHT_REVIEW.options.flatMap((o) => o.result).join('\n');
  expect(rvText).toContain('过度安静的楼层');
  expect(rvText).toContain('按谁的节奏走');

  // 登顶交互：读连载四结尾或公园开放时间任一后出现；山脊岔路存在；收尾回收“这样最好”
  const nc = getEntry('night-climb-guide')!;
  expect(entryRevealed(nc, base)).toBe(false);
  expect(entryRevealed(nc, S({ 'chronicle-04-p62': 3000 }))).toBe(true);
  expect(entryRevealed(nc, S({ 'qinglan-park-hours-note': 3000 }))).toBe(true);
  expect(nc.blocks.some((b) => b.type === 'climb')).toBe(true);
  expect(CLIMB_PATH.ridge1.text).toContain('没有人拦你');
  expect(CLIMB_PATH.ridge2.text).toContain('那里只有风');
  expect(CLIMB_PATH.summit.text).toContain('有人在看你');
  expect(CLIMB_PATH.board.text).toContain('今天有人上来吗');
  expect(CLIMB_PATH.down.text).toContain('这样最好');

  // 写入路径：征询与登顶均不可覆盖；清档后归零
  const state = useTrace.getState();
  state.resetAll();
  state.setReviewChoice('reduce');
  state.setReviewChoice('expand');
  expect(useTrace.getState().reviewChoice).toBe('reduce');
  state.markClimbed();
  const t = useTrace.getState().climbedAt;
  state.markClimbed();
  expect(useTrace.getState().climbedAt).toBe(t);
  state.resetAll();
  expect(useTrace.getState().reviewChoice).toBeNull();
  expect(useTrace.getState().climbedAt).toBeNull();
});

test('43. 连载九：读完《冬至》后出现；寻人启事与“排一起”钉板', () => {
  const base = { days: 9, seen: {}, reconstruct: {} };

  const ch9 = CHRONICLES[8];
  expect(ch9.id).toBe('chronicle-09');
  expect(meetsRule(ch9.reveal, base)).toBe(false);
  expect(meetsRule(ch9.reveal, { ...base, seen: { 'chronicle-08-p60': 3000 } })).toBe(true);

  const all = ch9.blocks.map((b) => b.text ?? '').join('\n');
  // 回环：连载四的毛肚与四十分钟；连载一的坏灯；阿付的相机包
  expect(all).toContain('上回排了四十分钟');
  expect(all).toContain('是脆的。');
  expect(all).toContain('台阶最上面那盏灯不亮');
  expect(all).toContain('相机包在桌上');
  // 三家人的第一次同框与启事的三张照片
  expect(all).toContain('小雨妈');
  expect(all).toContain('没有合影');
  expect(all).toContain('排一起');
  // 收束三连的末句
  expect(all).toContain('照常站着');
  // 纪律：不解释版本差异，不出现机制词
  expect(all).not.toContain('未定稿');
  expect(all).not.toContain('剪枝');
  expect(all).not.toContain('主干');
});

test('44. 北环路词条：覆盖型对照物（旧版本写着“已核对”）', () => {
  const nlt = getEntry('north-loop-tunnel')!;
  const covered = nlt.history.find((r) => r.overwritten && r.underlyingText);
  expect(covered).toBeDefined();
  expect(covered!.blockId).toBe('north-loop-tunnel-maint-log');
  expect(covered!.underlyingText).toContain('已核对');
  // 现行版本写的是“不一致”——同一位置，两版口径相反，不解释
  const now = nlt.blocks.find((b) => b.id === 'north-loop-tunnel-maint-log')!;
  expect(now.text).toContain('填报不一致');

  // 台账（“已另行说明”的那份说明）挂在词条痕迹段之后，从目录里长出来
  const log = getEntry('record-loop-log')!;
  const lbase = { days: 1, seen: {}, reconstruct: {} };
  expect(entryRevealed(log, lbase)).toBe(false);
  expect(
    entryRevealed(log, { ...lbase, seen: { 'north-loop-tunnel-maint-log': 3000 } }),
  ).toBe(true);
});

test('45. 口述第四辑：值班报告正文读过后出现；“半天没上来”与“正常”钉板', () => {
  const base = { days: 9, seen: {}, reconstruct: {} };

  const s4 = STORIES[3];
  expect(s4.id).toBe('story-04');
  expect(meetsRule(s4.reveal, base)).toBe(false);
  expect(meetsRule(s4.reveal, { ...base, seen: { 'record-1207-duty-body': 3000 } })).toBe(true);

  const all = s4.blocks.map((b) => b.text ?? '').join('\n');
  // 报告的“有三人进入”与他的“半天没上来”：差的那句话没有解释
  expect(all).toContain('半天没上来');
  expect(all).toContain('我原话是');
  // 与闸机记录的对立（行人不用刷卡）与“正常”体系的又一处
  expect(all).toContain('行人不用刷卡');
  expect(all).toContain('正常');
  // 纪律：不出现机制词
  expect(all).not.toContain('未定稿');
  expect(all).not.toContain('剪枝');
});

test('46. 连载十：读完《十二月八日》后出现；“改天”三现与零超自然', () => {
  const base = { days: 9, seen: {}, reconstruct: {} };

  const ch10 = CHRONICLES[9];
  expect(ch10.id).toBe('chronicle-10');
  expect(meetsRule(ch10.reveal, base)).toBe(false);
  expect(meetsRule(ch10.reveal, { ...base, seen: { 'chronicle-09-p82': 3000 } })).toBe(true);

  const all = ch10.blocks.map((b) => b.text ?? '').join('\n');
  // 三次“改天”的轨迹（面馆→火锅→出租屋），一次比一次近
  expect(all).toContain('改天再说');
  expect(all).toContain('它又不会跑');
  expect(all).toContain('等当面说');
  // 与既有文本的咬合：面馆老板娘、号单与“姐，值”、三脚架、结尾焊接连载一的开头
  expect(all).toContain('老板娘');
  expect(all).toContain('姐，值');
  expect(all).toContain('三脚架');
  expect(all).toContain('锅底端上来之前');
  // 纪律：零超自然、不出现机制词
  expect(all).not.toContain('观测');
  expect(all).not.toContain('未定稿');
  expect(all).not.toContain('剪枝');
});

test('47. 口述第五辑：读过连载二“有人推我”后出现；“薄”与“写清楚”钉板', () => {
  const base = { days: 9, seen: {}, reconstruct: {} };

  const s5 = STORIES[4];
  expect(s5.id).toBe('story-05');
  expect(meetsRule(s5.reveal, base)).toBe(false);
  expect(meetsRule(s5.reveal, { ...base, seen: { 'chronicle-02-p46': 3000 } })).toBe(true);

  const all = s5.blocks.map((b) => b.text ?? '').join('\n');
  // 她的证词边界：没有看见任何东西；“推”的质感只有一个字
  expect(all).toContain('特别薄');
  expect(all).toContain('不是手');
  // 与“不慎摔倒”的对撞：平底鞋
  expect(all).toContain('平底鞋');
  // 收尾：把口述当作又一次登记
  expect(all).toContain('写清楚');
  // 纪律：她全程没有见到“它”
  expect(all).not.toContain('白影');
  expect(all).not.toContain('未定稿');
  expect(all).not.toContain('剪枝');
});

test('48. 口述第六辑：读过连载一火锅桌段后出现；“端稳”与“记下了”钉板', () => {
  const base = { days: 9, seen: {}, reconstruct: {} };

  const s6 = STORIES[5];
  expect(s6.id).toBe('story-06');
  expect(meetsRule(s6.reveal, base)).toBe(false);
  expect(meetsRule(s6.reveal, { ...base, seen: { 'chronicle-01-p6': 3000 } })).toBe(true);

  const all = s6.blocks.map((b) => b.text ?? '').join('\n');
  // 他看见的引信时刻（把手机转过去）与不敢说满的克制
  expect(all).toContain('转过去给他俩看');
  expect(all).toContain('我不想把话说满');
  // 他与系统的接口：一句“记下了”
  expect(all).toContain('记下了');
  // 收尾：把每一样都端稳
  expect(all).toContain('端稳');
  // 纪律：不替任何谜面作证
  expect(all).not.toContain('白影');
  expect(all).not.toContain('未定稿');
  expect(all).not.toContain('剪枝');
});

test('49. 文稿入档登记：读补遗后可见；十行“未署名”与唯一划痕', () => {
  const base = { days: 9, seen: {}, reconstruct: {} };
  const S = (seen: Record<string, number>) => ({ ...base, seen });

  const reg = getEntry('manuscript-ledger')!;
  expect(entryRevealed(reg, base)).toBe(false);
  expect(entryRevealed(reg, S({ 'note-xuheng-buyi-tail': 3000 }))).toBe(true);

  const text = reg.blocks.map((b) => b.text ?? '').join('\n');
  // 十份文稿、全部未署名；编号连续到 WG-10
  expect((text.match(/未署名/g) ?? []).length).toBe(10);
  expect(text).toContain('WG-10');
  // 备注栏：其余九处皆为“未填”，唯一一处被划掉
  expect((text.match(/（未填）/g) ?? []).length).toBe(9);
  expect(text).toContain('被横线划去');
  // 纪律：不解释来源、不出现机制词
  expect(text).not.toContain('未定稿');
  expect(text).not.toContain('剪枝');
});

test('50. B1 交接柜记录：读阅览室“交接柜”段后可见；报废件未转出与未具名文稿', () => {
  const base = { days: 9, seen: {}, reconstruct: {} };
  const S = (seen: Record<string, number>) => ({ ...base, seen });

  const cab = getEntry('record-b1-cabinet')!;
  expect(entryRevealed(cab, base)).toBe(false);
  expect(entryRevealed(cab, S({ 'b1-reading-room-archive': 3000 }))).toBe(true);

  const rows = cab.blocks
    .filter((b) => b.type === 'table')
    .flatMap((b) => b.rows ?? [])
    .flat()
    .join('｜');
  // 未转出的报废件；未具名的文稿首两件
  expect(rows).toContain('导向牌报废件');
  expect(rows).toContain('（空）');
  expect((rows.match(/（未具名）/g) ?? []).length).toBe(2);
  expect(rows).toContain('文稿一份（未署）');
  // 表内仅有的两个个人名
  expect(rows).toContain('程露');
  expect(rows).toContain('许衡');
  // 口径行；纪律
  const text = cab.blocks.map((b) => b.text ?? '').join('\n');
  expect(text).toContain('未转出件');
  expect(text).not.toContain('未定稿');
  expect(text).not.toContain('剪枝');
});

test('51. B1 阅览登记：读“未发生资料遗失事件”后可见；首末两行都是同一个人', () => {
  const base = { days: 9, seen: {}, reconstruct: {} };
  const S = (seen: Record<string, number>) => ({ ...base, seen });

  const reg = getEntry('record-b1-copylog')!;
  expect(entryRevealed(reg, base)).toBe(false);
  expect(entryRevealed(reg, S({ 'b1-reading-room-note': 3000 }))).toBe(true);

  const table = reg.blocks.find((b) => b.type === 'table')!;
  const data = (table.rows ?? []).slice(1); // 去列名行
  // 首行与末行都是同一个人
  expect(data[0][0]).toBe('10.17');
  expect(data[0][3]).toBe('程露');
  expect(data[data.length - 1][0]).toBe('12.07');
  expect(data[data.length - 1][3]).toBe('程露');
  // 她的量词全是整块；普通读者的生活化条目并存
  const signed = data.filter((r) => r[3] === '程露');
  expect(signed).toHaveLength(4);
  expect(signed.map((r) => r[2])).toEqual(['全月', '6 版', '6 版', '全份']);
  const flat = data.flat().join('｜');
  expect(flat).toContain('毛线编织');
  expect(flat).toContain('高等数学');
  // 纪律：没有解释行、无机制词
  const text = reg.blocks.map((b) => b.text ?? '').join('\n');
  expect(text).not.toContain('未定稿');
  expect(text).not.toContain('剪枝');
});

test('52. 白昼馆 12 月巡楼记录：通篇“正常。”；夹页小图与位置', () => {
  const base = { days: 9, seen: {}, reconstruct: {} };
  const S = (seen: Record<string, number>) => ({ ...base, seen });

  const dec = getEntry('record-daylight-patrol-dec')!;
  expect(dec.unlisted).toBe(true);
  expect(entryRevealed(dec, base)).toBe(false);
  expect(entryRevealed(dec, S({ 'record-daylight-patrol-note': 3000 }))).toBe(true);

  const table = dec.blocks.find((b) => b.type === 'table')!;
  const data = (table.rows ?? []).slice(1);
  // 15 行“正常。”，含毛巾人偶当日 12.04——白天的事一个字不写
  expect(data).toHaveLength(15);
  expect(data.every((r) => r[2] === '正常。')).toBe(true);
  expect(data.find((r) => r[0] === '12.04')?.[2]).toBe('正常。');
  // 夹页小图：存在、含“均匀”的形容、位置只给物理事实
  const img = dec.blocks.find((b) => b.type === 'image')!;
  expect(img.alt).toContain('小图');
  expect(img.prompt).toContain('均匀');
  const text = dec.blocks.map((b) => b.text ?? '').join('\n');
  expect(text).toContain('夹在 12.06 与 12.07 两页之间');
  expect(text).not.toContain('未定稿');
  expect(text).not.toContain('剪枝');
});

test('53. 望城台留言板抄录：读留言板定稿后可见；三人句与旧字入档', () => {
  const base = { days: 9, seen: {}, reconstruct: {} };
  const S = (seen: Record<string, number>) => ({ ...base, seen });

  const board = getEntry('record-qinglan-board')!;
  expect(entryRevealed(board, base)).toBe(false);
  expect(entryRevealed(board, S({ 'chronicle-04-p51': 3000 }))).toBe(true);

  const text = board.blocks.map((b) => b.text ?? '').join('\n');
  // 三种笔迹的合写句入档（连原型句一起）
  expect(text).toContain('从山上看城北');
  expect(text).toContain('一清二楚');
  expect(text).toContain('心里发毛');
  expect(text).toContain('三种笔迹');
  expect(text).toContain('与前文非同一日');
  // 比公园还老的旧字入档
  expect(text).toContain('别站正中间');
  expect(text).toContain('年份不可考');
  // 纪律：不含夜爬交互里那行铅笔字；无机制词
  expect(text).not.toContain('今天有人上来吗');
  expect(text).not.toContain('未定稿');
  expect(text).not.toContain('剪枝');
});

test('54. 冷库现场照片：读报告后可见；四张选存与“未列入附件”', () => {
  const base = { days: 9, seen: {}, reconstruct: {} };
  const S = (seen: Record<string, number>) => ({ ...base, seen });

  const p = getEntry('record-coldstore-photos')!;
  expect(p.unlisted).toBe(true);
  expect(entryRevealed(p, base)).toBe(false);
  expect(entryRevealed(p, S({ 'coldstore-report-body': 3000 }))).toBe(true);

  const imgs = p.blocks.filter((b) => b.type === 'image');
  expect(imgs).toHaveLength(4);
  const text = p.blocks.map((b) => b.text ?? '').join('\n');
  expect(text).toContain('未列入事故报告附件');
  expect(text).toContain('选存 4 张');
  expect(text).toContain('22:14');
  expect(text).toContain('按原状拍摄');
  expect(text).not.toContain('未定稿');
});

test('55. 口述第七辑：读“我以为她回家了”后出现；两件物与“按两个人的交”', () => {
  const base = { days: 9, seen: {}, reconstruct: {} };
  const S = (seen: Record<string, number>) => ({ ...base, seen });

  const s7 = STORIES[6];
  expect(s7.id).toBe('story-07');
  expect(meetsRule(s7.reveal, base)).toBe(false);
  expect(meetsRule(s7.reveal, S({ 'chronicle-09-p15': 3000 }))).toBe(true);

  const all = s7.blocks.map((b) => b.text ?? '').join('\n');
  expect(all).toContain('我以为她回家了');
  expect(all).toContain('一人一件');
  expect(all).toContain('绿萝还活着');
  expect(all).toContain('按两个人的交');
  expect(all).not.toContain('未定稿');
});

test('56. 12 月材料汇编（第三卷）：读第二卷说明后可见；表终与不再按卷', () => {
  const base = { days: 9, seen: {}, reconstruct: {} };
  const S = (seen: Record<string, number>) => ({ ...base, seen });

  const v3 = getEntry('case-2412')!;
  expect(entryRevealed(v3, base)).toBe(false);
  expect(entryRevealed(v3, S({ 'c2411-outro': 3000 }))).toBe(true);

  const flat = v3.blocks
    .flatMap((b) => (b.type === 'table' ? (b.rows ?? []).flat() : [b.text ?? '']))
    .join('\n');
  // 陆先生的表终止于住院（无大碍，谢关心）
  expect(flat).toContain('无大碍，谢关心');
  expect(flat).toContain('12.07');
  // B1 代办制与年末的圆满
  expect(flat).toContain('由工作人员代办');
  expect(flat).toContain('236 路');
  // 卷尾：不再按卷汇编
  expect(flat).toContain('不再按卷汇编');
  expect(flat).not.toContain('未定稿');
});

test('57. 复核名录：征询登记后才出现对应方向的一份；两页互斥、理由栏未填', () => {
  const base = { days: 9, seen: {}, reconstruct: {} };
  const inDoc = getEntry('record-review-roll-in')!;
  const outDoc = getEntry('record-review-roll-out')!;

  // 未登记：两份都不出（页面照常静态存在，只是不进目录/侧栏/搜索）
  expect(entryRevealed(inDoc, base)).toBe(false);
  expect(entryRevealed(outDoc, base)).toBe(false);

  // 增列：只出增列页；停列：只出停列页
  expect(entryRevealed(inDoc, { ...base, reviewChoice: 'expand' })).toBe(true);
  expect(entryRevealed(outDoc, { ...base, reviewChoice: 'expand' })).toBe(false);
  expect(entryRevealed(inDoc, { ...base, reviewChoice: 'reduce' })).toBe(false);
  expect(entryRevealed(outDoc, { ...base, reviewChoice: 'reduce' })).toBe(true);

  // 两页骨架同款、方向词不同、理由栏均空置——收据只说事实
  const inText = inDoc.blocks.map((b) => b.text ?? '').join('\n');
  const outText = outDoc.blocks.map((b) => b.text ?? '').join('\n');
  expect(inText).toContain('已增列：白昼馆（含 508 室）');
  expect(outText).toContain('已停列：白昼馆（含 508 室）');
  expect(inText).toContain('增列理由：（未填）');
  expect(outText).toContain('停列理由：（未填）');
  expect(inText).toContain('本页不设复核人');
  expect(outText).toContain('本页不设复核人');
  // 纪律：不出现处置因果词
  for (const t of [inText, outText]) {
    expect(t).not.toContain('因为');
    expect(t).not.toContain('所以');
  }
});

test('58. 幕二读法回声：转写稿的两条读法各有其嘴；互不引用、互不判对错', () => {
  const talk = TALKS['event-1207'];
  const a = talk.posts.find((p) => p.id === 'talk-event-1207-4')!;
  const b = talk.posts.find((p) => p.id === 'talk-event-1207-5')!;
  expect(a).toBeDefined();
  expect(b).toBeDefined();

  // 读法 A（值班-02）：那声“答”接的不是上面那个问——超常读法的入口，不给结论
  expect(a.text).toContain('接的不是上面那个问');
  expect(a.text).toContain('没想明白');
  // 读法 B（值班-03）：校时、起点慢——技术侧的回忆，不给证据
  expect(b.text).toContain('校时单不在我手上');
  expect(b.text).not.toContain('上面');
  // 纪律：两侧都不判对错；“并置解释”的痕迹不得出现
  expect(a.text).not.toContain('校');
  for (const p of [a, b]) {
    expect(p.text).not.toContain('造假');
    expect(p.text).not.toContain('真相');
  }
});

test('59. 城北政务（关停线）：三件链式投放；截断块未完；拦截一次写入不可撤销', () => {
  const base = { days: 9, seen: {}, reconstruct: {} };
  const S = (seen: Record<string, number>) => ({ ...base, seen });

  // 三件、发文顺序、链式投放
  expect(GOV_DOCS.map((d) => d.id)).toEqual(['gov-plan-draft', 'gov-hearing', 'gov-impl']);
  const [draft, hearing, impl] = GOV_DOCS;
  expect(meetsRule(draft.reveal, base)).toBe(true);
  // 草案：第一次跨天之后才挂出——初访不可见（days:1 不满足；days:2 满足）
  expect(meetsRule(draft.reveal, { days: 1, seen: {}, reconstruct: {} })).toBe(false);
  expect(meetsRule(draft.reveal, { days: 2, seen: {}, reconstruct: {} })).toBe(true);
  expect(meetsRule(hearing.reveal, base)).toBe(false);
  expect(meetsRule(hearing.reveal, S({ 'gov-plan-draft-impact': 3000 }))).toBe(true);
  expect(meetsRule(impl.reveal, base)).toBe(false);
  expect(meetsRule(impl.reveal, S({ 'gov-hearing-quote-2': 3000 }))).toBe(true);

  // 截断块：以破折号收尾、句子没有说完——弹层的观察目标就是它
  const cut = impl.blocks.find((b) => b.id === GOV_IMPL_CUT_ID)!;
  expect(cut).toBeDefined();
  expect(cut.text?.endsWith('——')).toBe(true);
  expect(cut.text).toContain('我那个本子');

  // 撤稿回执：两行、引用正式方案名、指向“另行申请”
  expect(GOV_RECEIPT_LINES).toHaveLength(2);
  expect(GOV_RECEIPT_LINES[0]).toContain('《城北新区高精度观测设备关停方案》');
  expect(GOV_RECEIPT_LINES[0]).toContain('撤回');
  expect(GOV_RECEIPT_LINES[1]).toContain('另行申请');

  // 拦截落盘：一次写入不可撤销；清档后归零
  const state = useTrace.getState();
  state.resetAll();
  expect(useTrace.getState().interceptedAt).toBeNull();
  state.setIntercepted();
  const t = useTrace.getState().interceptedAt;
  expect(t).not.toBeNull();
  state.setIntercepted();
  expect(useTrace.getState().interceptedAt).toBe(t);
  state.resetAll();
  expect(useTrace.getState().interceptedAt).toBeNull();

  // 台账取文不受撤稿影响（"删了，但你读过"）
  expect(govBlockText(GOV_IMPL_CUT_ID)).toContain('我那个本子');
});

test('红点口径：只报新内容（新文书/未读修订/未读新登记），不报基线与漂移', () => {
  const s = { days: 5, seen: {}, reconstruct: {} };
  const marks = (o?: {
    readRevisions?: Record<string, number>;
    readHistory?: Record<string, number>;
    visits?: Record<string, { dn: number }>;
  }) => ({
    readRevisions: o?.readRevisions ?? {},
    readHistory: o?.readHistory ?? {},
    visits: o?.visits ?? {},
  });
  const mk = (over: Partial<WikiEntry>): WikiEntry => ({
    slug: 't',
    title: 't',
    category: 'record',
    blocks: [],
    history: [{ at: '2024-01-01T00:00', by: 'x' }],
    ...over,
  });

  // 基线条目：无水位、未到访也不亮——首访不满屏红点
  expect(entryUnread(mk({}), s, marks())).toBe(false);

  // 投放声明未满足：根本不进目录，不亮
  expect(entryUnread(mk({ slug: 'g2', reveal: { afterDays: 9 } }), s, marks())).toBe(false);

  // 新文书：投放后出现、尚未打开 → 亮；打开过 → 灭
  const gated = mk({ slug: 'g', reveal: { afterDays: 1 } });
  expect(entryUnread(gated, s, marks())).toBe(true);
  expect(entryUnread(gated, s, marks({ visits: { g: { dn: 1 } } }))).toBe(false);

  // 未读修订：亮；水位推过 → 灭
  const withRev = mk({ slug: 'r', revisions: [{ title: 'v', blocks: [] }] });
  expect(entryUnread(withRev, s, marks())).toBe(true);
  expect(entryUnread(withRev, s, marks({ readRevisions: { r: 1 } }))).toBe(false);

  // 未读新登记记录：跨天（dn=2 → 第 1 轮）后可见 2 条、水位 1 → 亮；水位 2 → 灭；
  // 无水位（从未打开词条页）→ 不亮
  const two = mk({
    slug: 'h',
    history: [
      { at: '2024-01-01T00:00', by: 'x' },
      { at: '2024-01-02T00:00', by: 'x', fromRound: 1 },
    ],
  });
  const day2 = { visits: { h: { dn: 2 } } };
  expect(entryUnread(two, s, marks({ readHistory: { h: 1 }, ...day2 }))).toBe(true);
  expect(entryUnread(two, s, marks({ readHistory: { h: 2 }, ...day2 }))).toBe(false);
  expect(entryUnread(two, s, marks())).toBe(false);
});

/* ------------------------------------------------------------------ *
 * 投放门的整体性看守（60–62）。
 *
 * 前面那些断言是一条一条钉住“某件文书读了某段后出现”；
 * 这三条钉的是门与门之间的关系。两类失败模式都是静默的：
 *   - 锚点不存在（引用了一个写错或已删的 blockId）→ 门永远不开；
 *   - 门互相等对方（循环）→ 一整段链永远不开。
 * 两者都不会让任何一条既有断言变红，而现象是“玩家没看到内容”，
 * 很容易被当成“玩家没读够”而错删内容。所以必须单独看守。
 * ------------------------------------------------------------------ */

/** 一个载体：自己的投放声明 + 自己贡献给 seen 的块 id。 */
interface Carrier {
  key: string;
  label: string;
  reveal?: RevealRule;
  blocks: string[];
}

/**
 * 全部载体的枚举。新增一个栏目的同时必须把它加进来，
 * 否则它的门就落在看守之外（这正是 61 的目的）。
 */
function allCarriers(): Carrier[] {
  const out: Carrier[] = [];
  for (const e of ENTRIES) {
    out.push({
      key: `entry:${e.slug}`,
      label: e.title,
      reveal: e.reveal,
      blocks: [...e.blocks, ...(e.revisions ?? []).flatMap((r) => r.blocks)].map((b) => b.id),
    });
  }
  for (const s of STORIES)
    out.push({
      key: `story:${s.id}`,
      label: s.title,
      reveal: s.reveal,
      blocks: s.blocks.map((b) => b.id),
    });
  for (const c of CHRONICLES)
    out.push({
      key: `chronicle:${c.id}`,
      label: c.title,
      reveal: c.reveal,
      blocks: c.blocks.map((b) => b.id),
    });
  for (const g of GOV_DOCS)
    out.push({
      key: `gov:${g.id}`,
      label: g.title,
      reveal: g.reveal,
      blocks: g.blocks.map((b) => b.id),
    });
  for (const n of NEWS_ISSUES)
    out.push({
      key: `news:${n.id}`,
      label: n.id,
      reveal: n.reveal,
      blocks: n.items.map((b) => b.id),
    });
  // 网络存档与榜单没有 ContentBlock 正文，但页面同样挂 data-bid（自己的 id 与榜面条目 id）
  for (const r of NET_RECORDS)
    out.push({ key: `net:${r.id}`, label: r.id, reveal: r.reveal, blocks: [r.id] });
  for (const h of HOT_SNAPSHOTS)
    out.push({
      key: `hot:${h.id}`,
      label: h.id,
      reveal: h.reveal,
      blocks: [h.id, ...h.topics.map((t) => t.id)],
    });
  return out;
}

/** 把一个投放声明里引用的全部 blockId 收下来（含 anyOf 嵌套）。 */
function gateIds(rule: RevealRule | undefined, acc: Set<string>): void {
  if (!rule) return;
  for (const id of rule.afterSeen ?? []) acc.add(id);
  for (const id of rule.afterSeenAll ?? []) acc.add(id);
  for (const id of rule.afterSeenAtLeast?.ids ?? []) acc.add(id);
  for (const r of rule.anyOf ?? []) gateIds(r, acc);
}

/** 全部还原台均已登记完矛盾并选了“通过项”的进度。 */
function scenesDone(): Record<string, { marks: string[]; verdict?: string }> {
  const out: Record<string, { marks: string[]; verdict?: string }> = {};
  for (const [id, scene] of Object.entries(SCENES)) {
    out[id] = { marks: scene.conflicts.map((c) => c.id), verdict: passVerdictId(scene) };
  }
  return out;
}

test('60. 检索门控：后期文书与对照物第一天不可检索；12·07 五件仍开放', () => {
  const day1 = { days: 1, seen: {}, reconstruct: {} };
  const S = (seen: Record<string, number>) => ({ ...day1, seen });

  // 幕五冷库两件：门挂在冷库词条的沿革/现状上（词条自己又挂在 12·07 概述上）
  for (const slug of ['record-coldstore-duty', 'record-coldstore-temp']) {
    const e = getEntry(slug)!;
    expect(e.unlisted).toBe(true);
    expect(e.reveal).toBeDefined();
    expect(entryRevealed(e, day1)).toBe(false);
    expect(entryRevealed(e, S({ 'coldstore-history': 3000 }))).toBe(true);
  }

  // 幕三白昼馆四件：门挂在白昼馆在住名录一带（任一段即可）
  for (const slug of [
    'testimony-a',
    'testimony-b',
    'testimony-c',
    'record-daylight-patrol',
  ]) {
    const e = getEntry(slug)!;
    expect(e.unlisted).toBe(true);
    expect(entryRevealed(e, day1)).toBe(false);
    expect(entryRevealed(e, S({ 'daylight-house-roll': 3000 }))).toBe(true);
    expect(entryRevealed(e, S({ 'daylight-house-roll-note': 3000 }))).toBe(true);
  }

  // 对照物：读过被它引文否定的那一句之前，不得可检索（`04 §八` 不可主动调用）
  const v = VERIFY_DOCS['north-loop-tunnel'];
  expect(v.reveal).toBeDefined();
  expect(meetsRule(v.reveal, day1)).toBe(false);
  expect(meetsRule(v.reveal, S({ 'north-loop-tunnel-infra': 3000 }))).toBe(true);

  // 反向保证：12·07 四份记录与转写稿必须保持第一天可检索——
  // 那是幕二“四份互不印证、凑齐靠玩家自己”的设计前提，不得跟着上面一起锁上。
  for (const slug of [
    'record-1207-site',
    'record-1207-device',
    'record-1207-duty',
    'record-1207-family',
    'record-1207-transcript',
  ]) {
    const e = getEntry(slug)!;
    expect(e.unlisted).toBe(true);
    expect(entryRevealed(e, day1)).toBe(true);
  }
});

test('61. 投放门引用的 blockId 必须真实存在（错字即静默软锁）', () => {
  const carriers = allCarriers();
  const known = new Set<string>();
  for (const c of carriers) for (const id of c.blocks) known.add(id);
  for (const b of Object.values(VERIFY_BLOCKS)) known.add(b.id);
  for (const t of Object.values(TALKS)) for (const p of t.posts) known.add(p.id);

  const referenced = new Set<string>();
  for (const c of carriers) gateIds(c.reveal, referenced);
  for (const e of ENTRIES) for (const rev of e.revisions ?? []) gateIds(rev.reveal, referenced);
  // 还原台场景门引的是场景 id，不是 blockId，单独校
  const missing = [...referenced].filter((id) => !known.has(id));
  expect(missing).toEqual([]);

  for (const [slug, doc] of Object.entries(VERIFY_DOCS)) {
    const ids = new Set<string>();
    gateIds(doc.reveal, ids);
    expect([...ids].filter((id) => !known.has(id))).toEqual([]);
    expect(slug).toBeTruthy();
  }
  for (const [id, scene] of Object.entries(SCENES)) {
    expect(scene.conflicts.length).toBeGreaterThan(0);
    expect(passVerdictId(scene)).toBeTruthy();
    expect(id).toBeTruthy();
  }
});

test('62. 解锁链无软锁：从初始集合迭代到不动点，全站载体均可达', () => {
  const carriers = allCarriers();

  /**
   * 一个分支的不动点：已开载体的全部块视为真正看过，重算投放，直到不再变长。
   * days 取 DAYS_CAP（轮次早已封顶，不影响投放判定）。
   */
  const reach = (reviewChoice: 'expand' | 'reduce'): Set<string> => {
    const open = new Set<string>();
    for (;;) {
      const seen: Record<string, number> = {};
      for (const c of carriers)
        if (open.has(c.key)) for (const id of c.blocks) seen[id] = 3000;
      const st = { days: 60, seen, reconstruct: scenesDone(), reviewChoice };
      let grew = false;
      for (const c of carriers) {
        if (open.has(c.key)) continue;
        if (meetsRule(c.reveal, st)) {
          open.add(c.key);
          grew = true;
        }
      }
      if (!grew) return open;
    }
  };

  // 复核名录两页互斥（afterReview），各自只在一个分支里可达；
  // 因此判据是两个分支的并集，不是单一分支。
  const union = new Set([...reach('expand'), ...reach('reduce')]);
  const stuck = carriers.filter((c) => !union.has(c.key)).map((c) => `${c.key}（${c.label}）`);
  expect(stuck).toEqual([]);
});

test('63. 存档容器：锚点永不被淘汰，migrate 补齐旧存档缺键', () => {
  // 锚点集合必须覆盖全部被引用的 id——新增载体忘了登记会在这里露出来
  const referenced = new Set<string>();
  for (const c of allCarriers()) gateIds(c.reveal, referenced);
  for (const e of ENTRIES) for (const rev of e.revisions ?? []) gateIds(rev.reveal, referenced);
  for (const d of Object.values(VERIFY_DOCS)) gateIds(d.reveal, referenced);
  expect([...referenced].filter((id) => !GATE_ANCHORS.has(id))).toEqual([]);
  expect(GATE_ANCHORS.size).toBeGreaterThan(0);

  // 淘汰：锚点故意给**更短**的停留时长，填塞项给更长的。
  // 若保护失效，按“时长升序淘汰”会先抹锚点——那时下面那条断言就红了。
  const st = useTrace.getState();
  st.resetAll();
  const anchors = [...GATE_ANCHORS];
  for (const id of anchors) useTrace.getState().markSeen(id, 2000);
  const fillers = SEEN_CAP + 50;
  for (let i = 0; i < fillers; i++) useTrace.getState().markSeen(`filler-${i}`, 5000);

  const seen = useTrace.getState().seen;
  for (const id of anchors) expect(seen[id]).toBe(2000);
  // 上限确实生效过（否则上面只是在验证一个从未触发的分支）
  const left = Object.keys(seen).filter((k) => k.startsWith('filler-')).length;
  expect(left).toBeLessThan(fillers);
  expect(left).toBeGreaterThan(0);
  useTrace.getState().resetAll();

  // migrate：v0 存档保留已有值、补齐缺键；同版本存档原样返回
  const v0 = { seen: { 'coldstore-history': 3000 }, days: ['2024-12-07'] };
  const up = migrateTrace(v0, 0) as unknown as Record<string, unknown>;
  expect(up.seen).toEqual({ 'coldstore-history': 3000 });
  expect(up.days).toEqual(['2024-12-07']);
  expect(up.snapshots).toEqual({});
  expect(up.picked).toEqual({});
  expect(up.reconstruct).toEqual({});
  expect(up.receipt).toBeNull();
  expect(up.finalChoice).toBeNull();
  expect(up.interceptedAt).toBeNull();

  const same = { seen: { a: 1 }, picked: { g: 'r1' } };
  expect(migrateTrace(same, 1)).toBe(same);
  expect(migrateTrace(undefined, 0)).toMatchObject({ seen: {}, days: [], actions: [] });
});

test('64. 检索归一化：1207 / 12·07 / 12-07 同命中；摘要仍取原文', () => {
  const docs = buildSearchDocs();
  const groups = (q: string) => searchDocs(q, docs).map((d) => d.group);

  // 间隔标点不得改变命中集合：否则玩家会以为站点坏了，
  // 而“坏掉的工具”与“设计好的异常”是两件事（见 searchIndex 头注释）
  const plain = groups('1207');
  expect(plain).toContain('event-1207');
  expect(groups('12·07')).toEqual(plain);
  expect(groups('12-07')).toEqual(plain);
  expect(groups('12 07')).toContain('event-1207');

  // 归一化只发生在匹配层：摘要与标题永远是原文，间隔标点一个不少
  const doc = docs.find((d) => d.group === 'event-1207')!;
  const piece = pickSearchPiece(doc, '1207');
  expect(piece).toBeDefined();
  expect(normText(piece!.text)).toContain('1207');
  expect(piece!.text).toMatch(/[·-]/);
  expect(doc.title).toContain('12·07');

  // 空查询与纯标点查询不命中任何内容
  expect(searchDocs('', docs)).toEqual([]);
  expect(searchDocs('· - — 　', docs)).toEqual([]);
});

test('65. 徐公巷：用典不被世界觉察——地名多于一个载体，解释零条', () => {
  // 地名回声：热搜与群聊各自提到徐公巷，互不引用，谁也不觉得它好笑
  const hot = HOT_SNAPSHOTS.find((s) => s.id === 'hot-1106')!;
  const topic = hot.topics.find((x) => x.topic.includes('徐公巷'))!;
  expect(topic.posts?.some((p) => p.includes('灯'))).toBe(true);
  const net = NET_RECORDS.find((r) => r.id === 'net-1107-2')!;
  expect(net.lines?.some((l) => l.includes('徐公巷'))).toBe(true);

  // 梗只活一次：全篇仅一处引典故原文
  const joke = (net.lines ?? []).filter((l) => l.includes('齐国之美丽者也'));
  expect(joke).toHaveLength(1);
  // 世界不笑：梗的下一行是“？”，再下一行回到鸡蛋
  const i = net.lines!.findIndex((l) => l.includes('齐国之美丽者也'));
  expect(net.lines![i + 1]).toBe('？');
  expect(net.lines![i + 2]).toContain('鸡蛋');
  // 缓解拍不是第一天就送：它与 11·06 榜同批，门未开时不在
  expect(meetsRule(net.reveal, { days: 1, seen: {}, reconstruct: {} })).toBe(false);

  // 解释为零：出处与解说词不得出现在任何载体里——
  // 用典与玩梗的分界线就是世界有没有觉察自己
  const corpus = [
    HOT_SNAPSHOTS,
    NET_RECORDS,
    GOV_DOCS,
    NEWS_ISSUES,
    ENTRIES,
    STORIES,
    CHRONICLES,
  ]
    .map((x) => JSON.stringify(x))
    .join('');
  for (const w of ['邹忌', '战国策', '讽齐王', '窥镜']) expect(corpus).not.toContain(w);
});