import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { VERIFY_DOCS, VERIFY_SLUGS } from '@/data/entries';
import { VerifyDoc } from '@/components/VerifyDoc';

/**
 * 对照物页没有入口：目录、首页、相关词条都不列它。
 * 唯一的两条来路是编辑历史里那条"复核"记录，以及一次针对性的检索。
 * 页面照样静态导出——它得在玩家想到之前就已经在那里。
 */
export function generateStaticParams() {
  return VERIFY_SLUGS.map((slug) => ({ slug }));
}

export const dynamicParams = false;

export const metadata: Metadata = { title: '复核记录' };

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const doc = VERIFY_DOCS[slug];
  if (!doc) notFound();
  return <VerifyDoc doc={doc} />;
}
