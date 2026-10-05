/* 站内时间与时长的书写方式。全部是排版，不参与任何判定。 */

/**
 * 站内文书的时间戳：直接取 ISO 字面量里的日期与时分。
 * 不经 `new Date()`——构建机与玩家不在同一时区时，格式化结果会不一致，
 * 而它渲染在服务端 HTML 里，会变成一处 hydration 差异。
 */
export function stamp(iso: string): string {
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(iso);
  return m ? `${m[1]} ${m[2]}` : iso;
}

/** 玩家真实行为的时刻。只在客户端渲染的路径里使用（日志页）。 */
export function clock(ms: number): string {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(
    d.getMinutes(),
  )}:${p(d.getSeconds())}`;
}

/** 累计可见时长。写成台账里的样子，不写成百分比、不写成等级。 */
export function duration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  if (total < 60) return `${total} 秒`;
  const m = Math.floor(total / 60);
  const s = total % 60;
  return s ? `${m} 分 ${s} 秒` : `${m} 分`;
}
