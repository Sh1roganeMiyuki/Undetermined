import type { Metadata } from 'next';
import { STORIES } from '@/data/stories';
import { StoryList } from '@/components/StoryList';

export const metadata: Metadata = { title: '城北口述' };

export default function Page() {
  return (
    <StoryList
      items={STORIES}
      basePath="/stories"
      title="城北口述"
      intro="「城北新区口述史采集项目」收录居民口述资料，按采集顺序发布。口述内容不代表本站立场。"
      speakerLabel="口述人"
      timeLabel="采集时间"
    />
  );
}