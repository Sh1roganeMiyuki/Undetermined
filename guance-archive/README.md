# 观测档案 · 站内工程

「城北新区资料协作平台」的静态站点实现——站内全部文本、界面与阅读行为信号。

## 常用命令

```bash
npm run dev        # 本地开发
npm run build      # 静态构建（output: export）
npm test           # 机器门：黄金测试 + 机制测试 + 字数统计（权威口径）
npm run doc:check  # 文档同步门：docs/06 汇编与 src/data 权威文本的一致性
```

## 目录速览

- `src/data/` —— 站内全部文本（**权威版本**；`docs/06_剧情正文汇编.md` 是供通读的副本）
- `src/lib/resolve/` —— 呈现判定（`resolve.ts` 为单一出口；`roundFor.ts` 轮次推导）
- `src/lib/signals/` —— 真实信号采集（视口停留、精确选中与复制、跨标签页）
- `src/lib/traceStore.ts` —— 持久化台账（有界）
- `src/components/` —— 页面组件
- `scripts/doc-sync.mjs` —— 汇编同步工具（`check` 校验 / `dump <前缀>` 导出片段）
- `scripts/pack-site.mjs` —— 发布打包：`out/` → 单个 `site.pak` 密文容器
- `scripts/serve.mjs` —— 本地伺服（目录或 pak 两种形态）
- `__tests__/` —— 机器门：`golden`（不变量）/ `mechanisms`（机制）/ `round` / `wordcount`（工具）

## 文档

四层文档链：`docs/01_设定文档.md` → `docs/02_项目策划文档.md` → `docs/04_呈现规范.md` → `docs/03_垂直切片开发提示词.md`。

**引用纪律：实现层只引用 L2（`04`），不直连 L0（`01`）。**

## 约定

- 代码命名以技术事实为准，禁止世界观术语直译（`04 §9.1`）。
- 任何"变化"必须能由持久化状态确定性重建（`04 §9.2`）。
- 内容批次产出后：更新 `docs/06` 汇编，并跑 `npm run doc:check` 与 `npm test`。

## 发版（体验包）

体验包位于 `../城北新区资料协作平台-体验包`（便携运行时 + `site.pak` 单容器 + 一键启动脚本）。
**git 是常规交付通道**：发版 = 两道机器门通过后 build、pack、commit、push，体验用户从仓库取更新。
`.zip` 只在对方不用 git、需要离线分发时手动打一次（包内以体验包文件夹为根、不含 `runtime/`）；
仓库根目录现存的 zip 是 2026-10-05 的快照，已停止随发版刷新。

两道机器门（`npm test`、`npm run doc:check`）通过后：

1. `npm run build` 产出 `out/`；
2. `npm run pack -- out ..\城北新区资料协作平台-体验包\site.pak`；
3. commit 并 push。体验用户侧的补丁姿势：覆盖 `serve.mjs` 与 `site.pak` 两个文件即可，
   不换端口、不换浏览器，进度原样保留（见下节）。

**为什么是单容器而不是目录**：`out/` 里每个页面都是明文 HTML、每个 chunk 都是明文 JS，
以目录交付等于把五幕全文摊在读者桌面上，打开文件夹就能 Ctrl+F 读完。投放门控管的是
“内容何时进他的世界”，管不住“文件在不在磁盘上”。pak 是 AES-256-CTR 密文加索引，
`serve.mjs` 启动时解密进内存、按请求切片，磁盘上没有可读明文。密钥随包交付，所以这是
**成本抬升**（翻文件夹读不到；要读得先去看服务端源码并自己解），不是保密。

版本号在 `package.json`：发版先 bump 版本，再走上述流程。

## 存档与补丁更新

读者的全部进度在浏览器 `localStorage['ga-trace-v1']`，绑定 **origin（协议+主机+端口）**。
因此补丁更新的正确姿势是：**只替换包内文件，不换端口、不换浏览器**——静态产物与
localStorage 无关，替换后进度原样保留，不需要重新体验。会“从头再来”的原因只有这几种：
换了浏览器或用了无痕；端口变了（换 origin 等于换世界）；手机用局域网 IP 而电脑用
localhost（两个 origin、两套存档）；清理了浏览数据。

结构演进靠 `traceStore` 里的 `TRACE_VERSION` + `migrate`：只新增字段不需要动它
（persist 浅合并会兜底）；**改字段语义或改名时必须 bump 版本并在 migrate 里写迁移**，
否则旧值会被静默塞进新字段，且不报错。存储键名里的 `-v1` 是存档身份，永远不要改。

`seen` 的淘汰会跳过 `GATE_ANCHORS`（全部投放门引用的 blockId）：锚点一旦被淘汰，
已解锁的文书会静默重新消失。新增投放门时锚点集合自动覆盖，`mechanisms` 测试 63 看守。