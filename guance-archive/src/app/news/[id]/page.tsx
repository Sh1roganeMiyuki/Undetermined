import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NEWS_IDS, getNewsIssue } from '@/data/news';
import { NewsIssuePage } from '@/components/NewsIssuePage';

/**
 * 播出稿单档页。静态导出穷举全部档期——能否进入由目录的投放判定控制。
 */
export function generateStaticParams() {
  return NEWS_IDS.map((id) => ({ id }));
}

export const dynamicParams = false;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const issue = getNewsIssue(id);
  return { title: issue ? `城北新闻 · ${issue.label} ${issue.slot}` : '城北新闻' };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const issue = getNewsIssue(id);
  if (!issue) notFound();
  return <NewsIssuePage issue={issue} />;
}