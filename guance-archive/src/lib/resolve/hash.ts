/**
 * 不用 Math.random，不用日期参与。
 *
 * 只用于两处：生成玩家稳定标识（/trace）与打散列表顺序。
 * 不得用它选择文本（如 hash32(id#round) % count）——那样作者在写数据时
 * 看不见"第 N 天会命中哪一句"，可能让正文与对照物撞出同一个数字。
 * 变体一律按轮次显式点名（{ round, text }[]）。
 */
export function hash32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
