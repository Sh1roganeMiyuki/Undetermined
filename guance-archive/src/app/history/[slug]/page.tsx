import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ENTRY_SLUGS, getEntry } from '@/data/entries';
import { EditHistory } from '@/components/EditHistory';

export function generateStaticParams() {
  return ENTRY_SLUGS.map((slug) => ({ slug }));
}

export const dynamicParams = false;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntry(slug);
  return { title: entry ? `编辑历史 · ${entry.title}` : '记录不存在' };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) notFound();
  return <EditHistory entry={entry} />;
}
