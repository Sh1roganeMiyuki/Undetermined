import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import './globals.css';
import { WikiHeader } from '@/components/WikiHeader';
import { WikiSidebar } from '@/components/WikiSidebar';

export const metadata: Metadata = {
  title: {
    default: '城北新区资料协作平台',
    template: '%s · 城北新区资料协作平台',
  },
  description:
    '城北新区市政资料协作维护平台。条目由市政养护中心与内容审核组共同维护，更新以登记时间为准。',
};

/**
 * 站内只有一个配色（深色），不给切换：一个主题开关就是一个“应用设置”，
 * 它会提醒读者手里这是一个软件而不是一个站。
 */
export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0c141d',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="flex min-h-full flex-col text-[15px] leading-7 text-ink">
        <WikiHeader />
        <div className="mx-auto flex w-full max-w-[1200px] flex-1 gap-6 px-6 py-6">
          <WikiSidebar />
          <main className="min-w-0 flex-1 rounded-lg border border-line bg-surface px-8 py-7 shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
            {children}
            {/* 版记：只在纸面上出现。屏幕上的档案不需要落款，
                打出来的那一份需要——它从此离开本站，自己承担一切。 */}
            <p className="print-only">
              本件打印自城北新区资料协作平台 · 内容以登记时间为准，登记后不再更新 ·
              如对条目有异议，请在对应词条的编辑历史页提交说明
            </p>
          </main>
        </div>
        <footer className="mt-4 bg-brand-deep text-white/60">
          <div className="mx-auto grid w-full max-w-[1200px] gap-8 px-6 py-8 sm:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden
                  className="flex h-7 w-7 items-center justify-center rounded-[5px] bg-seal text-[11px] font-bold leading-none tracking-[0.1em] text-white shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.35)]"
                >
                  城北
                </span>
                <span className="text-[15px] font-semibold text-white">城北新区资料协作平台</span>
              </div>
              <p className="mt-3 max-w-[380px] text-[13px] leading-6">
                本平台用于城北新区市政资料的协作登记。条目由市政养护中心与内容审核组共同维护，
                内容以登记时间为准，登记后不再更新。
              </p>
              <p className="mt-2 text-[13px] leading-6">
                如对本平台条目有异议，请在对应词条的编辑历史页提交说明。本站不设答复时限。
              </p>
            </div>
            <div>
              <h3 className="text-[13px] font-semibold tracking-wider text-white/85">站内栏目</h3>
              <ul className="mt-3 space-y-1.5 text-[13px]">
                <li>
                  <Link href="/" className="hover:text-white">
                    首页
                  </Link>
                </li>
                <li>
                  <Link href="/search/" className="hover:text-white">
                    站内检索
                  </Link>
                </li>
                <li>
                  <Link href="/chronicle/" className="hover:text-white">
                    城北纪事
                  </Link>
                </li>
                <li>
                  <Link href="/stories/" className="hover:text-white">
                    城北口述
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-[13px] font-semibold tracking-wider text-white/85">维护口径</h3>
              <ul className="mt-3 space-y-1.5 text-[13px] leading-6">
                <li>条目内容以登记时间为准。</li>
                <li>编辑记录由系统留存，不可删改。</li>
                <li>
                  查阅行为记入
                  <Link href="/trace/" className="text-white/80 underline decoration-white/30 underline-offset-2 hover:text-white">
                    查阅记录
                  </Link>
                  ，仅在本浏览器内有效。
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10">
            <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center gap-x-4 gap-y-1 px-6 py-3 text-[12px] text-white/40">
              <span>© 2024 城北新区市政养护中心 · 内容审核组</span>
              <span className="ml-auto font-mono tnum">
                城北ICP备2024-01177号-1 · 政府网站标识 1101080077
              </span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
