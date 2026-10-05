import type { Metadata } from 'next';
import { NET_RECORDS } from '@/data/net';
import { ArchiveIndex } from '@/components/ArchiveIndex';

export const metadata: Metadata = { title: '网络存档' };

/**
 * 存档目录（子菜单式）：一行一条材料，按发现时间排列，点入单条摘录。
 * "已不可见"的条目保留在目录里，带行尾小标——材料的去向也是材料。
 */
export default function Page() {
  const items = NET_RECORDS.map((r) => ({
    id: r.id,
    title: r.at,
    sub: r.channel,
    flag: r.deleted ? '已不可见' : undefined,
    reveal: r.reveal,
  }));

  return (
    <ArchiveIndex
      slug="net"
      title="网络存档"
      intro="以下材料摘录自公开社交平台，按发现时间排列。点入查看单条摘录；为保护发言者，昵称一律隐去。"
      basePath="/net"
      items={items}
      empty="暂无存档。"
    />
  );
}