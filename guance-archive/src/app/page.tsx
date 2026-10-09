import Link from 'next/link';
import { CATEGORY_LABEL, ENTRIES } from '@/data/entries';
import { stamp } from '@/lib/format';
import { visibleHistory } from '@/lib/resolve/history';
import { SiteNotice } from '@/components/SiteNotice';
import type { EditRecord, WikiEntry } from '@/types';

/** 目录顺序固定，不按玩家行为重排 */
const ORDER: WikiEntry['category'][] = ['location', 'event', 'personnel', 'protocol', 'record'];

export default function HomePage() {
  // 首页是静态基准：未列入目录的词条（如几份互相不印证的记录）不参与推荐；
  // 带投放声明的条目同样不出现——它们的"突然多出"走目录与检索，
  // 首页不承担投放渠道（服务端无法知道玩家状态）。
  // 带轮次门控的编辑记录一律按第 0 轮取，否则"最近更新"会指向
  // 一条首次访问时并不存在的登记。
  const listed = ENTRIES.filter((e) => !e.unlisted && !e.reveal);
  const updates = listed
    .map((e) => ({ e, last: visibleHistory(e.history, 0).at(-1) }))
    .filter((x): x is { e: WikiEntry; last: EditRecord } => x.last !== undefined)
    .sort((a, b) => (a.last.at < b.last.at ? 1 : -1));
  const groups = ORDER.map((c) => ({ c, list: listed.filter((e) => e.category === c) })).filter(
    (g) => g.list.length > 0,
  );
  // 概览格只放**不可比的静态事实**（维护主体、分类数、最近登记日）。
  // 曾经这里放"在列条目 N"、分类卡也挂"N 条"——而侧栏是实时的：
  // 回访者会在同一屏里读到横幅 13 与侧栏 16。那个矛盾没有在 04 §八 登记过，
  // 按 §十 的口径就是"不得自行发明"，而读者只会把它读成故障。
  // 可数的量因此从首页全部撤下：条目目录只有一个，就是侧栏那个会长大的。
  // 日期只取到日：横幅统计格窄，带时分会换行。
  const latest = updates[0]?.last;

  return (
    <div className="flex flex-col gap-8 xl:flex-row">
      <div className="min-w-0 flex-1">
        {/* 导览横幅：站点是什么、有多少资料、从哪开始，一屏说清 */}
        <section className="hero-grid overflow-hidden rounded-lg border border-line bg-gradient-to-br from-brand-deep to-hero text-white">
          <div className="relative px-7 py-6">
            {/* 档案章水印：横幅右侧的底纹级存在，不抢文字 */}
            <div
              aria-hidden
              className="pointer-events-none absolute right-7 top-6 hidden h-28 w-28 rotate-[-12deg] select-none items-center justify-center rounded-lg border-2 border-white/15 md:flex"
            >
              <span className="text-[24px] font-bold leading-tight tracking-[0.3em] text-white/15 [writing-mode:vertical-rl]">
                城北档案
              </span>
            </div>
            <div className="flex items-center gap-2 text-[12px] tracking-[0.25em] text-white/55">
              <span aria-hidden className="h-px w-6 bg-accent" />
              市政资料 · 协作登记
            </div>
            <h1 className="mt-2 text-[26px] font-semibold leading-9">城北新区资料协作平台</h1>
            <p className="mt-2 max-w-[620px] text-[14px] leading-6 text-white/75">
              本站收录城北新区市政设施、事件与相关规程的登记资料，由市政养护中心与内容审核组共同维护。
              条目内容以登记时间为准，登记后不再更新。
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <Link
                href="/entry/new-editor-guide/"
                className="rounded-md bg-accent px-4 py-1.5 text-[14px] font-medium text-brand-deep transition-colors hover:bg-[#d3a544]"
              >
                从《新编辑须知》开始
              </Link>
              <Link
                href="/search/"
                className="rounded-md border border-white/30 px-4 py-1.5 text-[14px] text-white transition-colors hover:border-white/60 hover:bg-white/10"
              >
                站内检索
              </Link>
            </div>
          </div>
          <dl className="grid grid-cols-[1fr_1fr_1.3fr] divide-x divide-white/10 border-t border-white/10 bg-black/10">
            <div className="px-5 py-3">
              <dt className="text-[12px] text-white/55">维护单位</dt>
              <dd className="text-[14px] font-medium leading-8">市政养护中心</dd>
            </div>
            <div className="px-5 py-3">
              <dt className="text-[12px] text-white/55">资料分类</dt>
              <dd className="text-[20px] font-semibold leading-8">{groups.length}</dd>
            </div>
            <div className="px-5 py-3">
              <dt className="text-[12px] text-white/55">最近登记</dt>
              <dd className="font-mono text-[14px] font-medium leading-8">
                {latest ? stamp(latest.at).slice(0, 10) : '—'}
              </dd>
            </div>
          </dl>
        </section>

        <div className="mt-6">
          <SiteNotice />
        </div>

        <section className="mt-6">
          <h2 className="flex items-center gap-2 border-b border-line pb-2 text-[17px] font-semibold text-ink">
            <span aria-hidden className="h-4 w-1 rounded-full bg-accent" />
            最近更新
          </h2>
          <ul className="mt-1">
            {updates.map(({ e, last }) => (
              <li
                key={e.slug}
                className="group flex flex-wrap items-baseline gap-x-3 border-b border-line py-3 text-[14px] leading-6 last:border-b-0"
              >
                <span className="shrink-0 rounded bg-soft px-1.5 py-px font-mono text-[12px] text-gray-500">
                  {stamp(last.at)}
                </span>
                <Link
                  href={`/entry/${e.slug}/`}
                  className="font-medium text-link hover:underline"
                >
                  {e.title}
                </Link>
                <span className="text-gray-500">{last.note}</span>
                <span className="text-gray-400">{last.by}</span>
                <Link
                  href={`/history/${e.slug}/`}
                  className="ml-auto shrink-0 rounded border border-line px-2 py-px text-[12px] text-gray-500 transition-colors group-hover:border-link/40 hover:text-link"
                >
                  编辑历史
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="flex items-center gap-2 border-b border-line pb-2 text-[17px] font-semibold text-ink">
            <span aria-hidden className="h-4 w-1 rounded-full bg-accent" />
            按分类浏览
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {groups.map((g) => (
              <div
                key={g.c}
                className="rounded-lg border border-line bg-surface p-4 transition-shadow hover:shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
              >
                <div className="border-b border-line pb-2">
                  <span className="text-[14px] font-semibold text-brand">
                    {CATEGORY_LABEL[g.c]}
                  </span>
                </div>
                <ul className="mt-2">
                  {g.list.map((e) => (
                    <li key={e.slug} className="py-[3px] text-[14px] leading-6">
                      <Link href={`/entry/${e.slug}/`} className="text-link hover:underline">
                        {e.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="w-full xl:w-[280px] xl:shrink-0">
        <section className="panel">
          <h2 className="panel-h">关于本站</h2>
          <div className="px-4 py-3 text-[13px] leading-6 text-gray-600">
            <p>
              本平台用于城北新区市政资料的协作登记。资料一经登记即视为定稿，后续更正以新增登记的方式进行。
            </p>
            <p className="mt-2">本站不设评论功能，不设答复时限。</p>
          </div>
        </section>

        <section className="panel mt-4">
          <h2 className="panel-h">维护说明</h2>
          <ul className="px-4 py-3 text-[13px] leading-6 text-gray-600">
            <li>条目内容以登记时间为准。</li>
            <li className="mt-1">编辑记录由系统留存，不可删改。</li>
            <li className="mt-1">未列入目录的文书可经站内检索调阅。</li>
            <li className="mt-1">
              查阅行为本身会记入
              <Link href="/trace/" className="text-link hover:underline">
                查阅记录
              </Link>
              ，该记录仅在本浏览器内有效。
            </li>
          </ul>
        </section>
      </aside>
    </div>
  );
}
