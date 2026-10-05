import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEntry } from '@/data/entries';
import { TALK_SLUGS, TALKS } from '@/data/talk';
import { TalkPage } from '@/components/TalkPage';

/**
 * 讨论页是"路由边界"的一种（词条页 ↔ 讨论页 ↔ 编辑历史页之间），
 * 静态导出同样必须穷举 slug，不允许按需渲染。
 */
export function generateStaticParams() {
  return TALK_SLUGS.map((slug) => ({ slug }));
}

export const dynamicParams = false;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntry(slug);
  return { title: entry ? `讨论 · ${entry.title}` : '讨论' };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const thread = TALKS[slug];
  if (!thread) notFound();
  return <TalkPage thread={thread} />;
}