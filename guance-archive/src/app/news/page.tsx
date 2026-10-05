import type { Metadata } from 'next';
import { NEWS_ISSUES } from '@/data/news';
import { ArchiveIndex } from '@/components/ArchiveIndex';
import { stamp } from '@/lib/format';

export const metadata: Metadata = { title: '城北新闻 · 播出稿存档' };

/**
 * 存档目录（子菜单式）：一行一档，点入单档全文。
 * 最新一档在上——新解锁的档期就这样"出现在最上面"。
 */
export default function Page() {
  const items = [...NEWS_ISSUES]
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .map((n) => ({
      id: n.id,
      title: `${n.label} · ${n.slot}`,
      sub: `存档：${stamp(n.at)}`,
      reveal: n.reveal,
    }));

  return (
    <ArchiveIndex
      slug="news"
      title="城北新闻 · 播出稿存档"
      intro="本页为《城北新闻》晚间档播出稿的存档目录，按播出日期排列，最新一档在上。点入查看单档全文。"
      basePath="/news"
      items={items}
      empty="暂无存档。"
    />
  );
}