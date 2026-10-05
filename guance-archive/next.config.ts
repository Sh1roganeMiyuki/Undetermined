import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // 关闭 StrictMode：它会在开发环境把每个 effect 走一遍 mount→unmount→mount，
  // 于是一次真实到访被记成两次、还多出一条并不存在的"离开"，
  // 站内通知也会在首访就投放。观测记录必须是真实行为的 1:1 投影，
  // 不能在 hook 里去重——那会把真实的返回访问一起吞掉。
  reactStrictMode: false,
};

export default nextConfig;
