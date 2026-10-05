'use client';

import type { ContentBlock } from '@/types';
import { useResolved } from '@/lib/resolve/useResolved';

/**
 * 关键文件：它只渲染，不判定。
 *
 * 这个组件里不许出现任何条件判断——门控全部收在 resolve() 里。
 * 它也不承载 `data-bid`：观察目标一律由外层容器承担（见 EntryBody），
 * 空段落的 span 尺寸为零，交叉观察记不到它。
 *
 * `suppressHydrationWarning` 用在叶子文本节点上：服务端渲染规范版，
 * 客户端 hydration 时同步从 localStorage 读出解析结果。
 *
 * 不得改用 `mounted` 状态延迟渲染：那会让玩家亲眼看到文字在眼前换掉，
 * 摧毁"我记错了吗"这个唯一有效的问句。
 *
 * ref 回调只做一件与判定无关的事：把已经解析出来的文字落进 DOM。
 * `suppressHydrationWarning` 的语义是"不报警告"，不是"用客户端的值覆盖"——
 * React 会保留服务端的文字，并把客户端的值记进 fiber；此后再渲染出同一个值时
 * 它认为无需改动，于是那段文字永远停在规范版上（门控静默失效，没有任何报错）。
 * ref 回调在提交阶段、绘制之前执行，所以这里不是"换一次给玩家看"，
 * 而是让第一次绘制就已经是解析后的结果。写法上用 textContent——
 * 单个字符串子节点正是 React 自己的更新方式，不会留下失联的文本节点。
 */
export function VariantSpan({ block, slug }: { block: ContentBlock; slug: string }) {
  const out = useResolved(block, slug);
  return (
    <span
      suppressHydrationWarning
      ref={(el) => {
        if (el && el.textContent !== out.text) el.textContent = out.text;
      }}
    >
      {out.text}
    </span>
  );
}
