const CHANNEL = 'ga-tabs';
const HEARTBEAT_MS = 3000;
const ID_KEY = 'ga-tab-id';

let cached: string | null = null;

/**
 * 多标签一律用 BroadcastChannel 发现。不得用 sessionStorage 去数标签页：
 * 它按标签页隔离，用它统计等于凭空捏造。
 * 这里只把它当身份的存放处——整页导航会重新执行模块，若每次都新生成 id，
 * 自己上一条还没过期的租约就会被当成"别人"，并发数凭空多一。
 *
 * id 用 crypto.getRandomValues 生成，不用 Math.random——
 * 不让任何一处随机数与内容选择沾上关系。
 */
export function tabId(): string {
  if (cached) return cached;
  const store = typeof window === 'undefined' ? undefined : window.sessionStorage;
  const kept = store?.getItem(ID_KEY);
  if (kept) {
    cached = kept;
    return cached;
  }
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  cached = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  store?.setItem(ID_KEY, cached);
  return cached;
}

/**
 * 每 3 秒广播一次自身 id，收到别人的 id 时回调 onPeer。
 * 这是全项目唯一允许的 setInterval：只广播身份，不扣减任何东西、不参与内容选择。
 *
 * onTick 搭在同一个节拍上，用于清理已关闭标签页留下的过期租约：
 * 对方不再广播时不会有任何事件到来，不借这个节拍，
 * 站内那句"同一时间存在其他查阅会话"就会一直停在一个已经不再成立的数字上。
 *
 * @returns 停止函数（调用方在 effect 清理里返回它）
 */
export function startTabSync(onPeer: (id: string) => void, onTick?: () => void): () => void {
  if (typeof BroadcastChannel === 'undefined') return () => {};

  const self = tabId();
  const ch = new BroadcastChannel(CHANNEL);
  ch.onmessage = (e: MessageEvent) => {
    const peer = (e.data as { id?: unknown })?.id;
    if (typeof peer === 'string' && peer !== self) onPeer(peer);
  };
  ch.postMessage({ id: self });
  const timer = setInterval(() => {
    ch.postMessage({ id: self });
    onTick?.();
  }, HEARTBEAT_MS);

  return () => {
    clearInterval(timer);
    ch.close();
  };
}
