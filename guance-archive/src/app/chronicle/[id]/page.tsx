import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CHRONICLE_IDS, getChronicle } from '@/data/chronicle';
import { StoryPage } from '@/components/StoryPage';

/**
 * 纪事单篇。静态导出穷举全部篇目——能否进入由栏目列表的投放判定控制。
 */
export function generateStaticParams() {
  return CHRONICLE_IDS.map((id) => ({ id }));
}

export const dynamicParams = false;

const CONFIG = {
  basePath: '/chronicle',
  label: '城北纪事',
  speakerLabel: '整理者',
  timeLabel: '发布',
  // 阅读模式：标题之后直接是正文，无任何元信息行与尾注。
  minimal: true,
};

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const story = getChronicle(id);
  return { title: story ? `城北纪事 · ${story.title}` : '城北纪事' };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const story = getChronicle(id);
  if (!story) notFound();
  return <StoryPage story={story} config={CONFIG} />;
}