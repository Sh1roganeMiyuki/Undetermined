'use client';

import Link from 'next/link';
import type { NetRecord } from '@/types';
import { useSeenBlocks } from '@/lib/signals/useSeenBlocks';
import { useHighPrecisionActions } from '@/lib/signals/useHighPrecisionActions';
import { useVisitTimeline } from '@/lib/signals/useVisitTimeline';

/**
 * 网络材料单条页。摘录按原样呈现：
 * "已不可见"的条目保留抄录副本与去向说明——档案不假装没发生过。
 */
export function NetRecordPage({ record }: { record: NetRecord }) {
  useVisitTimeline(`net:${record.id}`);
  useSeenBlocks(record.id);
  useHighPrecisionActions(`net:${record.id}`);

  return (
    <div className="mx-auto max-w-[760px]">
      <div className="text-[13px] text-gray-500">
        <Link href="/net/" className="hover:text-link">
          网络存档
        </Link>
        <span className="px-1 text-gray-300">/</span>
        {record.at}
      </div>

      <h1 className="mt-1 text-[24px] font-semibold leading-9 text-ink">{record.at}</h1>
      <p className="mt-2 border-b border-line pb-4 text-[13px] leading-6 text-gray-500">
        {record.channel}
        {record.deleted ? <span className="ml-2 text-red-400">［已不可见］</span> : null}
      </p>

      <div data-bid={record.id} className="mt-6">
        {record.text ? (
          <p
            className={`text-[15px] leading-7 ${
              record.deleted ? 'text-gray-400' : 'text-gray-800'
            }`}
          >
            {record.text}
          </p>
        ) : null}
        {record.photo ? (
          <figure className="mt-4 flex h-40 items-center justify-center border border-line bg-soft px-4 text-center text-[13px] text-gray-500">
            {record.photo.alt}
          </figure>
        ) : null}
        {record.lines && record.lines.length > 0 ? (
          <ul
            className={`mt-3 border-l-2 border-line pl-4 ${
              record.deleted ? 'text-gray-400' : 'text-gray-700'
            }`}
          >
            {record.lines.map((line) => (
              <li key={line} className="py-0.5 text-[14px] leading-6">
                {line}
              </li>
            ))}
          </ul>
        ) : null}
        {record.note ? <p className="mt-3 text-[13px] leading-6 text-gray-400">{record.note}</p> : null}
      </div>

      <p className="mt-8 border-t border-line pt-4 text-[13px] leading-6 text-gray-500">
        （本材料摘录自公开社交平台，按发现时间抄录。为保护发言者，昵称一律隐去。）
      </p>
    </div>
  );
}