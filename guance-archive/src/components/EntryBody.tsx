'use client';

import Link from 'next/link';
import type { ContentBlock, WikiEntry } from '@/types';
import { getEntry } from '@/data/entries';
import { SCENES } from '@/data/scenes';
import { ReconstructScene } from '@/components/ReconstructScene';
import { ApplicationForm } from '@/components/ApplicationForm';
import { ClimbPath } from '@/components/ClimbPath';
import { FinalChoice } from '@/components/FinalChoice';
import { ReceiptSeal } from '@/components/ReceiptSeal';
import { RegisterEntry } from '@/components/RegisterEntry';
import { ReviewAsk } from '@/components/ReviewAsk';
import { VariantSpan } from '@/components/VariantSpan';
import { ViewerLedger } from '@/components/ViewerLedger';
import { useSeenBlocks } from '@/lib/signals/useSeenBlocks';
import { useHighPrecisionActions } from '@/lib/signals/useHighPrecisionActions';
import { useVisitTimeline } from '@/lib/signals/useVisitTimeline';

/**
 * 正文渲染。只做两件事：把三类真实信号接上，把内容块按类型分发。
 * 这里没有任何判定——该显示哪一版由 resolve() 决定，经 VariantSpan 落地。
 *
 * `data-bid` 每块只出现一次，一律由承载布局的容器承担（paragraph 的 p、quote 的
 * blockquote、其余类型各自的外层元素）。不得改挂到 VariantSpan 的 span 上：
 * 规范版为空的块（如《新编辑须知》规则 7 后的空行）会得到一个零尺寸的观察目标，
 * 交叉观察记不到它，那段就永远拿不到 seen 记录，它的变体也永远没有出场机会。
 * 重复标注则会让同一段的停留时长被计两遍。
 *
 * revKey 是传给 useSeenBlocks 的重扫钥匙：修订区在接手后才渲染，
 * 修订数变化时钥匙变化，观察器重建并扫到修订块——它们自此参与 seen 追踪，
 * 也就可以承担投放条件（见 useSeenBlocks 的注释）。
 */
export function EntryBody({ entry, revKey = 0 }: { entry: WikiEntry; revKey?: number }) {
  useVisitTimeline(entry.slug);
  useSeenBlocks(`${entry.slug}#r${revKey}`);
  useHighPrecisionActions(entry.slug);

  return <BlockList blocks={entry.blocks} slug={entry.slug} refs={entry.refs} />;
}

/**
 * 块列表渲染。词条正文与文档修订区共用。
 * 修订区不重复挂信号 hooks（它们属于页面级），只渲染内容；
 * 修订块的 data-bid 自 revKey 重扫机制起参与 seen 追踪（见 EntryBody），
 * 因此修订块可以作为投放条件——但要注意修订区自身的解锁依赖正文块，
 * 链条只能由正文通向修订，不能反过来。
 */
export function BlockList({
  blocks,
  slug,
  refs,
}: {
  blocks: ContentBlock[];
  slug: string;
  refs?: WikiEntry['refs'];
}) {
  const refsOf = (id: string) => (refs ?? []).filter((r) => r.blockId === id);

  return (
    <div>
      {blocks.map((b) => (
        <div key={b.id}>
          <Block block={b} slug={slug} />
          {refsOf(b.id).map((r) => {
            const target = getEntry(r.target);
            return target ? (
              <p key={r.target} className="mt-1 text-[14px] leading-6">
                <Link href={`/entry/${target.slug}/`} className="text-link hover:underline">
                  {r.text ?? `参见《${target.title}》`}
                </Link>
              </p>
            ) : (
              <p key={r.target} className="mt-1 text-[14px] leading-6 text-gray-500">
                {r.text ?? '参见相关条目'}
              </p>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Block({ block, slug }: { block: ContentBlock; slug: string }) {
  switch (block.type) {
    case 'heading':
      return (
        <h2
          data-bid={block.id}
          className="mb-3 mt-8 text-[17px] font-semibold leading-7 text-ink first:mt-0"
        >
          {block.text}
        </h2>
      );

    case 'list':
      return (
        <ul data-bid={block.id} className="my-4 list-disc space-y-1 pl-6 text-gray-800">
          {(block.items ?? []).map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>
      );

    case 'quote':
      return (
        <blockquote data-bid={block.id} className="my-4 border-l-2 border-line pl-4 text-gray-700">
          <VariantSpan block={block} slug={slug} />
        </blockquote>
      );

    case 'table':
      // 台账三线表：线越少越像真的台账（样式在 globals.css）。
      // 外套滚动容器：说明.txt 明邀手机同 Wi-Fi 访问，四列表格在 360px 上
      // 不该撑破版心。data-bid 挂在容器上而非 table 上——观察目标是
      // 容器（始终等于栏宽），宽表横向溢出时视口停留门槛不会被卡死。
      return (
        <div data-bid={block.id} className="overflow-x-auto">
          <table className="ledger-table my-4 w-full border-collapse text-[14px]">
            <tbody>
              {(block.rows ?? []).map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2 align-top text-gray-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'image':
      // 图片缺位时只剩替代文本：这是内容层允许的形态，不是错误状态。
      return (
        <figure
          data-bid={block.id}
          className="my-4 flex h-40 items-center justify-center border border-line bg-soft px-4 text-center text-[13px] text-gray-500"
        >
          {block.alt ?? ''}
        </figure>
      );

    case 'divider':
      return <hr data-bid={block.id} className="my-6 border-line" />;

    case 'ledger':
      // 玩家台账：接手后才生成（组件内部 hydrated 门控），服务端不存在这段 DOM。
      return (
        <div data-bid={block.id} className="my-2">
          <ViewerLedger variant={block.ledgerVariant ?? 'notice'} intro={block.text ?? ''} />
        </div>
      );

    case 'receipt-seal':
      // 签收交互区：确认 / 更正 / 不点，三条路都在组件内完成。
      return (
        <div data-bid={block.id} className="my-2">
          <ReceiptSeal slug={slug} />
        </div>
      );

    case 'application':
      // 申请交互区：两份申请与回执（数据单例，块只作挂载点）。
      return (
        <div data-bid={block.id} className="my-2">
          <ApplicationForm />
        </div>
      );

    case 'register':
      // 动态登记行：接手后由 {id}/{day} 占位填充（见 RegisterEntry）。
      // retainsId 由数据声明：清档后仍写旧编号的那一行，全站只允许一处。
      return (
        <div data-bid={block.id}>
          <RegisterEntry template={block.text ?? ''} retains={block.retainsId ?? false} />
        </div>
      );

    case 'final-choice':
      // 最终选择区：四方案与签名栏（幕五收官）。
      return (
        <div data-bid={block.id} className="my-2">
          <FinalChoice />
        </div>
      );

    case 'review-ask':
      // 征询区：两方向择一（幕三核心选择）。
      return (
        <div data-bid={block.id} className="my-2">
          <ReviewAsk />
        </div>
      );

    case 'climb':
      // 登顶交互：环山夜爬。
      return (
        <div data-bid={block.id} className="my-2">
          <ClimbPath />
        </div>
      );

    case 'scene': {
      // 还原台：场景数据按 id 取；取不到时安静地什么都不渲染
      // （与"无锁、无空槽"一致，不存在"场景缺失"的占位）。
      const scene = block.scene ? SCENES[block.scene] : undefined;
      if (!scene) return null;
      return (
        <div data-bid={block.id} className="my-4">
          <ReconstructScene scene={scene} slug={slug} />
        </div>
      );
    }

    default:
      // paragraph。data-bid 由 p 承担，空段落也有宽度与 min-h 撑起的行高，
      // 观察目标因此始终存在。min-h 保证空行也占一行：规范版的空与变体的有字，排版一致。
      return (
        <p data-bid={block.id} className="min-h-7 my-3 text-gray-800">
          <VariantSpan block={block} slug={slug} />
        </p>
      );
  }
}
