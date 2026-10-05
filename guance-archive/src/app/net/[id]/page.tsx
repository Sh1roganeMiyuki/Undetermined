import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NET_RECORDS } from '@/data/net';
import { NetRecordPage } from '@/components/NetRecordPage';

/**
 * 网络材料单条页。静态导出穷举全部条目——能否进入由目录的投放判定控制。
 */
export function generateStaticParams() {
  return NET_RECORDS.map((r) => ({ id: r.id }));
}

export const dynamicParams = false;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const record = NET_RECORDS.find((r) => r.id === id);
  return { title: record ? `网络存档 · ${record.at}` : '网络存档' };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const record = NET_RECORDS.find((r) => r.id === id);
  if (!record) notFound();
  return <NetRecordPage record={record} />;
}