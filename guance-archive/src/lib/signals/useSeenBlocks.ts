'use client';

import { useEffect } from 'react';
import { useTrace } from '@/lib/traceStore';

const THRESHOLD = 0.6;
/** 单段最多计 30s：挂着不动的页面不许把世界推进 */
const SEGMENT_CAP_MS = 30_000;

/**
 * 逐元素计时：记住每个元素进入视口的时刻，划出视口时结算这一段时长。
 * 用"观察者创建时刻"当全局起点是错的——每个划过的段落都会拿到同一个巨大值，
 * 低档与中档的分界随之消失。
 *
 * 结算点只有两个：划出视口、页面转入后台。后台不结算。
 *
 * @param key 仅作为重跑依赖：路由切换或修订数变化（"<slug>#r<n>"）后
 *   重新扫描页面上的 [data-bid]。修订区在接手后才渲染，其块的 data-bid 靠
 *   修订数触发的重扫捕获（见 EntryBody 的 revKey）；重扫前先结算正在计时的
 *   段落，再重建观察器从零再计——账不丢，也不重复。
 */
export function useSeenBlocks(key: string) {
  useEffect(() => {
    const { markSeen, pruneTabs } = useTrace.getState();
    const enterAt = new Map<string, number>();

    const close = (id: string) => {
      const from = enterAt.get(id);
      if (from === undefined) return;
      enterAt.delete(id);
      markSeen(id, Math.min(SEGMENT_CAP_MS, Date.now() - from));
    };

    const io = new IntersectionObserver(
      (records) => {
        for (const r of records) {
          const id = (r.target as HTMLElement).dataset.bid;
          if (!id) continue;
          if (r.isIntersecting) {
            if (!enterAt.has(id)) enterAt.set(id, Date.now());
          } else if (document.visibilityState === 'visible') {
            close(id); // 结算点一：划出视口
          }
        }
      },
      { threshold: THRESHOLD },
    );

    document.querySelectorAll<HTMLElement>('[data-bid]').forEach((el) => io.observe(el));

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        pruneTabs(); // 与结算共用同一个可见性监听点：都由"可见性变化"这一真实事件触发
        return;
      }
      for (const id of [...enterAt.keys()]) close(id); // 结算点二：页面转入后台
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      // 卸载（含重扫与路由切换）前，先结算仍在视口内计时的块：
      // 点站内链接跳走（SPA 导航）不触发 visibilitychange，若无此段，
      // "读完直接点走"的停留会整个丢失；重扫路径同理——账不丢、不重复。
      for (const id of [...enterAt.keys()]) close(id);
      io.disconnect();
    };
  }, [key]);
}
