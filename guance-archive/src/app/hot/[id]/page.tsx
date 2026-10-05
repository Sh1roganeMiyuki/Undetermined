import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HOT_TOPIC_IDS, getHotTopic } from '@/data/hot';
import { HotTopicPage } from '@/components/HotTopicPage';

/**
 * 热搜话题单页。静态导出穷举全部上榜话题——能否进入由榜单条目的
 * 所在期控制（期未解锁，话题页在站内也不可达）。
 */
export function generateStaticParams() {
  return HOT_TOPIC_IDS.map((id) => ({ id }));
}

export const dynamicParams = false;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const hit = getHotTopic(id);
  return { title: hit ? `城北同城榜 · ${hit.topic.topic}` : '城北同城榜' };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const hit = getHotTopic(id);
  if (!hit) notFound();
  return <HotTopicPage topic={hit.topic} snapshot={hit.snapshot} />;
}