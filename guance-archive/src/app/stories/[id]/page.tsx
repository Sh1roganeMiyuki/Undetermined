import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { STORY_IDS, getStory } from '@/data/stories';
import { StoryPage } from '@/components/StoryPage';

/**
 * 口述单期。静态导出照常穷举全部期次——
 * 能否进入由栏目列表的投放判定控制，页面的生成与投放无关。
 */
export function generateStaticParams() {
  return STORY_IDS.map((id) => ({ id }));
}

export const dynamicParams = false;

const CONFIG = {
  basePath: '/stories',
  label: '城北口述',
  speakerLabel: '口述人',
  timeLabel: '采集时间',
};

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const story = getStory(id);
  return { title: story ? `城北口述 · ${story.title}` : '城北口述' };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const story = getStory(id);
  if (!story) notFound();
  return <StoryPage story={story} config={CONFIG} />;
}