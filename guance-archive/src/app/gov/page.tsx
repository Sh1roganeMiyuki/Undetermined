import type { Metadata } from 'next';
import { GOV_DOCS } from '@/data/gov';
import { ArchiveIndex } from '@/components/ArchiveIndex';
import { stamp } from '@/lib/format';

export const metadata: Metadata = { title: '城北政务 · 公文存档' };

/**
 * 城北政务目录：行政公文按发文时间排列，最新一件在上。
 * 与其它栏目同一投放模式——新解锁的公文在回访时"多出一行"；
 * 被拦截的公文不从列表撤走：看得见名字，点进去是回执。
 */
export default function Page() {
  const items = [...GOV_DOCS]
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .map((d) => ({
      id: d.id,
      title: d.title,
      sub: `${d.kind} · 发文：${stamp(d.at)}`,
      reveal: d.reveal,
    }));

  return (
    <ArchiveIndex
      slug="gov"
      title="城北政务 · 公文存档"
      intro="本页收录城北新区近期公开发布的行政公文，按发文时间排列，最新一件在上。点入查看全文。"
      basePath="/gov"
      items={items}
      empty="暂无公文。"
    />
  );
}