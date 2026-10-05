import Link from 'next/link';

/**
 * 站内 404：口吻是档案平台对一次无效调阅的例行回执，不是浏览器的错误页。
 * 死链、输错的地址、以及"曾经存在、如今不在目录里"的文书都落在这里——
 * 后一种情况本身也是世界的一部分，所以措辞留了口子（"未列入目录"）。
 */
export default function NotFound() {
  return (
    <div className="mx-auto max-w-[560px] py-8">
      <div className="font-mono text-[12px] tracking-[0.3em] text-gray-400">ERR · 404</div>
      <h1 className="mt-2 flex items-center gap-2 text-[24px] font-semibold leading-9 text-ink">
        <span aria-hidden className="h-5 w-1 rounded-full bg-accent" />
        该文书不存在，或未列入目录
      </h1>
      <p className="mt-4 text-[14px] leading-7 text-gray-600">
        您调阅的地址未对应本站任何文书。未列入目录的文书不参与站内浏览；
        如您认为该文书应当存在，请以题名或关键词检索，或在相关条目的编辑历史页提交说明。
      </p>
      <div className="mt-6 flex flex-wrap gap-2.5">
        <Link
          href="/"
          className="rounded-md bg-brand px-4 py-1.5 text-[14px] text-white transition-colors hover:bg-brand-deep"
        >
          返回首页
        </Link>
        <Link
          href="/search/"
          className="rounded-md border border-line px-4 py-1.5 text-[14px] text-gray-700 transition-colors hover:border-link hover:text-link"
        >
          站内检索
        </Link>
      </div>
      <p className="mt-8 border-t border-line pt-4 text-[12px] leading-5 text-gray-400">
        本页由系统自动生成。调阅未成功的尝试不计入查阅记录。
      </p>
    </div>
  );
}
