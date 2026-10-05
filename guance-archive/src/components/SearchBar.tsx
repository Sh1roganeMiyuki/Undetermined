'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * 站内搜索入口。两种底色变体：
 * dark 用于顶部深蓝导航条与导览横幅（白字、半透白底），
 * light 用于卡面页面（检索页）——名字指的是“字色亮不亮”，不是页面底色。
 *
 * dark 的 focus 不得给实白底：输入框字色是白的，白底上它会整个消失。
 */
export function SearchBar({
  initial = '',
  variant = 'dark',
}: {
  initial?: string;
  variant?: 'dark' | 'light';
}) {
  const router = useRouter();
  const [q, setQ] = useState(initial);

  const dark = variant === 'dark';

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const t = q.trim();
        router.push(t ? `/search/?q=${encodeURIComponent(t)}` : '/search/');
      }}
    >
      <input
        type="search"
        value={q}
        aria-label="站内搜索"
        placeholder="搜索条目、记录与文书"
        onChange={(e) => setQ(e.target.value)}
        className={`h-9 w-full rounded-md border px-3 text-[14px] outline-none transition-colors ${
          dark
            ? 'border-white/15 bg-white/10 text-white placeholder:text-white/45 focus:border-accent/70 focus:bg-white/20'
            : 'border-line bg-surface text-ink placeholder:text-gray-400 focus:border-link'
        }`}
      />
      <button
        type="submit"
        className={`h-9 shrink-0 rounded-md border px-3 text-[14px] transition-colors ${
          dark
            ? 'border-transparent bg-accent font-medium text-brand-deep hover:bg-[#d3a544]'
            : 'border-line bg-soft text-ink hover:border-link hover:text-link'
        }`}
      >
        搜索
      </button>
    </form>
  );
}
