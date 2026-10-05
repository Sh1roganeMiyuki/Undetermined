import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchResults } from '@/components/SearchResults';

export const metadata: Metadata = { title: '检索' };

/** useSearchParams 在静态导出下必须由 Suspense 边界包着，否则构建期直接报错 */
export default function Page() {
  return (
    <Suspense fallback={null}>
      <SearchResults />
    </Suspense>
  );
}
