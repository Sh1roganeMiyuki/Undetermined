import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ENTRY_SLUGS, getEntry } from '@/data/entries';
import { EntryPage } from '@/components/EntryPage';

/**
 * 静态导出：三个动态路由都必须穷举 slug，且关掉运行时兜底。
 * 页面本身是 server component —— 'use client' 的页面导不出 generateStaticParams。
 */
export function generateStaticParams() {
  return ENTRY_SLUGS.map((slug) => ({ slug }));
}

export const dynamicParams = false;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntry(slug);
  return { title: entry ? entry.title : '条目不存在' };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) notFound();
  return <EntryPage entry={entry} />;
}
