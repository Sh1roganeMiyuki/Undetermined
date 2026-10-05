'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * 是否已经接手完成（hydration 结束）。
 *
 * 服务端渲染与浏览器接手的第一帧一律为 false：静态产物里的 HTML 与首帧必须逐字相同，
 * 否则就是 hydration 不一致。接手之后才允许读本地记录里的那些事实。
 *
 * 用 useSyncExternalStore 而不是在 effect 里 setMounted(true)——
 * 后者要多绕一次状态更新，且属于在 effect 体内同步改状态。
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
