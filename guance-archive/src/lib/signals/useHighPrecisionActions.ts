'use client';

import { useEffect, useRef } from 'react';
import { useTrace } from '@/lib/traceStore';

const MIN_CHARS = 6;
/** selectionchange 需选区稳定后才结算，避免拖选途中触发 */
const STABLE_MS = 400;
/** 一次复制会同时触发两个事件 */
const DEBOUNCE_MS = 800;

function elementOf(node: Node | null): Element | null {
  if (!node) return null;
  return node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
}

/**
 * 高档观测的结算条件（全部满足才算）：
 * 选区非折叠且 ≥6 字；整体落在同一个 [data-bid] 内（跨块属泛读）；
 * 焦点不在 input / textarea / contenteditable 内。
 */
function preciseSelection(): { id: string; text: string } | null {
  const sel = document.getSelection();
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null;
  if (sel.toString().trim().length < MIN_CHARS) return null;

  const ae = document.activeElement;
  if (ae instanceof HTMLElement) {
    if (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable) return null;
  }

  const range = sel.getRangeAt(0);
  const startBlock = elementOf(range.startContainer)?.closest('[data-bid]');
  const endBlock = elementOf(range.endContainer)?.closest('[data-bid]');
  if (!startBlock || startBlock !== endBlock) return null;
  if (!startBlock.contains(range.commonAncestorContainer)) return null;

  const id = (startBlock as HTMLElement).dataset.bid;
  // 快照文本一律从 DOM 取，不从数据文件取：玩家看到的可能已经是变体，
  // 从数据取会让化石永远等于规范版，机制自我取消。
  const text = startBlock.textContent ?? '';
  if (!id || !text) return null;
  return { id, text };
}

export function useHighPrecisionActions(slug: string) {
  const last = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // 定稿只有两步，没有第三步。
    const settle = (kind: 'copy' | 'select') => {
      const now = Date.now();
      if (now - last.current < DEBOUNCE_MS) return;
      const hit = preciseSelection();
      if (!hit) return;
      last.current = now;
      const { snapshot, log } = useTrace.getState();
      snapshot(hit.id, hit.text);
      log(kind, `${slug}:${hit.id}`);
    };

    const onCopy = () => settle('copy');
    const onSelectionChange = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => settle('select'), STABLE_MS);
    };

    document.addEventListener('copy', onCopy);
    document.addEventListener('selectionchange', onSelectionChange);
    return () => {
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('selectionchange', onSelectionChange);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [slug]);
}
