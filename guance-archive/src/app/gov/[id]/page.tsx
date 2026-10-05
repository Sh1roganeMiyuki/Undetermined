import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GOV_IDS, getGovDoc } from '@/data/gov';
import { GovDocPage } from '@/components/GovDocPage';

/**
 * 公文单篇页。静态导出穷举全部公文——能否进入由目录的投放判定控制；
 * 拦截（撤稿）只作用于正文区，标题与列表位置不动。
 */
export function generateStaticParams() {
  return GOV_IDS.map((id) => ({ id }));
}

export const dynamicParams = false;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const doc = getGovDoc(id);
  return { title: doc ? `城北政务 · ${doc.title}` : '城北政务' };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const doc = getGovDoc(id);
  if (!doc) notFound();
  return <GovDocPage doc={doc} />;
}