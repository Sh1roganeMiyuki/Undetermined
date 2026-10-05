import type { Metadata } from 'next';
import { CHRONICLES } from '@/data/chronicle';
import { StoryList } from '@/components/StoryList';

export const metadata: Metadata = { title: '城北纪事' };

export default function Page() {
  return (
    <StoryList
      items={CHRONICLES}
      basePath="/chronicle"
      title="城北纪事"
      intro="连载稿件经各自渠道送达本站，按收到顺序编发；尚未送达的，不在本页列出。"
      speakerLabel="整理者"
      timeLabel="发布"
      showSpeaker={false}
    />
  );
}