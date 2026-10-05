import type { Metadata } from 'next';
import { HotBoard } from '@/components/HotBoard';

export const metadata: Metadata = { title: '城北同城榜' };

export default function Page() {
  return <HotBoard />;
}