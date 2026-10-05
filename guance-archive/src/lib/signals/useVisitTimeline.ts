'use client';

import { useEffect, useLayoutEffect } from 'react';
import { useTrace } from '@/lib/traceStore';

/**
 * 用 layout effect 推进 `dn`：它必须在浏览器绘制之前落地，
 * 否则隔天回访的玩家会先看到昨天那一版、再看文字在眼前换掉。
 * 服务端没有 layout effect，退回 useEffect（构建期不渲染任何变化）。
 */
const useBeforePaint = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * 只记录，不推断。轮次推进一律由 dn 完成（见 resolve/roundFor）。
 * 卸载时留下一条真实的离开记录：日志页显示的是"你何时离开的"，
 * 不是编出来的"会话结束"。
 */
export function useVisitTimeline(slug: string) {
  useBeforePaint(() => {
    const { enterEntry, log } = useTrace.getState();
    enterEntry(slug);
    log('visit', slug);
    return () => {
      useTrace.getState().log('leave', slug);
    };
  }, [slug]);
}

/** 非词条页的真实到访记录（编辑历史页、复核页等），同样计入日志页。 */
export function usePageLog(kind: string, target: string) {
  useEffect(() => {
    useTrace.getState().log(kind, target);
  }, [kind, target]);
}
