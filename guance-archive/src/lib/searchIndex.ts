import { CATEGORY_LABEL, ENTRIES, VERIFY_DOCS, VERIFY_SLUGS } from '@/data/entries';

/**
 * 站内检索的索引与匹配。纯函数，唯一出口——组件里不得再自己拼匹配逻辑。
 *
 * 归一化口径：剥掉间隔标点与空白后再做子串匹配，
 * 使 "1207" / "12·07" / "12-07" / "12 07" 同命中。
 * 这不是对玩家宽容，是分清两种坏：**设计好的异常训练怀疑，坏掉的工具训练不信任**——
 * 后者会让玩家以错误的理由放弃检索这件武器，而检索是本作唯一的主动探索通道。
 * 归一化只发生在匹配层；显示层（标题、摘要）永远取原文。
 */

/** 视为“间隔符”的字符：中点、连字符、下划线、句点、全半角空白。不剥顿号逗号——那会把语义粘在一起。 */
const NORM_RE = /[·・\-–—_.．　\s]/g;

export function normText(s: string): string {
  return s.replace(NORM_RE, '');
}

export interface SearchPiece {
  id: string;
  /** 原文：摘要显示用 */
  text: string;
  /** 归一化：匹配用 */
  norm: string;
}

export interface SearchDoc {
  key: string;
  /** 去重单位。同一个对象只出现一次（条目优先于它的复核文书）。 */
  group: string;
  kind: 'entry' | 'verify';
  href: string;
  title: string;
  titleNorm: string;
  meta: string;
  bodyNorm: string;
  pieces: SearchPiece[];
}

function piecesOf(text?: string, items?: string[]): string {
  return text ?? (items ?? []).join('；');
}

export function buildSearchDocs(): SearchDoc[] {
  const out: SearchDoc[] = [];

  for (const e of ENTRIES) {
    const pieces: SearchPiece[] = e.blocks
      .map((b) => ({ id: b.id, text: piecesOf(b.text, b.items) }))
      .filter((p) => p.text.length > 0)
      .map((p) => ({ ...p, norm: normText(p.text) }));
    out.push({
      key: `entry:${e.slug}`,
      group: e.slug,
      kind: 'entry',
      href: `/entry/${e.slug}/`,
      title: e.title,
      titleNorm: normText(e.title),
      meta: `${CATEGORY_LABEL[e.category]}条目`,
      bodyNorm: pieces.map((p) => p.norm).join('\n'),
      pieces,
    });
  }

  for (const slug of VERIFY_SLUGS) {
    const d = VERIFY_DOCS[slug];
    const excerptText = d.excerpt.text ?? '';
    out.push({
      key: `verify:${slug}`,
      group: slug,
      kind: 'verify',
      href: `/verify/${slug}/`,
      title: `复核记录 · ${d.target}`,
      titleNorm: normText(`复核记录 · ${d.target}`),
      meta: `系统文书 · ${d.at}`,
      bodyNorm: normText([d.target, d.conclusion, d.footer, excerptText].join('\n')),
      pieces: [{ id: d.excerpt.id, text: excerptText, norm: normText(excerptText) }],
    });
  }

  return out;
}

function count(hay: string, needle: string): number {
  if (!needle) return 0;
  let n = 0;
  let i = hay.indexOf(needle);
  while (i >= 0) {
    n++;
    i = hay.indexOf(needle, i + needle.length);
  }
  return n;
}

/** 多词须全部命中；标题命中计双倍。同一 group 只留最高分的一条。 */
export function searchDocs(q: string, docs: SearchDoc[]): SearchDoc[] {
  const tokens = q
    .split(/\s+/)
    .filter(Boolean)
    .map(normText)
    .filter(Boolean);
  if (tokens.length === 0) return [];

  const hits: { doc: SearchDoc; score: number }[] = [];
  for (const doc of docs) {
    let score = 0;
    let ok = true;
    for (const t of tokens) {
      const c = count(doc.titleNorm, t) * 2 + count(doc.bodyNorm, t);
      if (c === 0) {
        ok = false;
        break;
      }
      score += c;
    }
    if (ok) hits.push({ doc, score });
  }

  const byGroup = new Map<string, { doc: SearchDoc; score: number }>();
  for (const h of hits) {
    const prev = byGroup.get(h.doc.group);
    if (
      !prev ||
      h.score > prev.score ||
      (h.score === prev.score && h.doc.kind === 'entry')
    ) {
      byGroup.set(h.doc.group, h);
    }
  }
  return [...byGroup.values()].sort((a, b) => b.score - a.score).map((x) => x.doc);
}

/** 摘要段落：优先含检索词（归一化后）的那一段，其次第一段。返回原文。 */
export function pickSearchPiece(doc: SearchDoc, q: string): SearchPiece | undefined {
  const tokens = q
    .split(/\s+/)
    .filter(Boolean)
    .map(normText)
    .filter(Boolean);
  for (const t of tokens) {
    const hit = doc.pieces.find((p) => p.norm.includes(t));
    if (hit) return hit;
  }
  return doc.pieces[0];
}
