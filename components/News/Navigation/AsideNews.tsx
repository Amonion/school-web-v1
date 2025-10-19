import Image from 'next/image'
import { NavStore } from '@/src/zustand/notification/Navigation'
import NewsStore from '@/src/zustand/news/News'
import { formatRelativeDate } from '@/lib/helpers'
import Link from 'next/link'

export default function AsideNews() {
  const { asideNav, toggleAsideVNav } = NavStore()
  const { featuredNews } = NewsStore()

  return (
    <div
      onClick={toggleAsideVNav}
      className={` ${asideNav ? 'right-0' : 'right-[-100%]'} v_nav news`}
    >
      <div
        onClick={(e) => {
          e.stopPropagation()
        }}
        className="v_nav_card news"
      >
        <div
          className={`rounded-[20px] bg-[var(--primary)] mt-3 mb-5 h-[40px] w-full flex items-center px-3`}
        >
          <i className="bi bi-sliders cursor-pointer mr-3"></i>
          <input
            type="search"
            // onChange={(e) => setSearchedText(e.target.value)}
            className={`bg-transparent border-none outline-none flex-1`}
            placeholder={`Search news...`}
          />
          <i className="bi bi-search common-icon cursor-pointer"></i>
        </div>
        <div className="t">
          <div className="text-lg mb-2">Related News</div>

          {featuredNews.map((post, index) => (
            <div key={index} className="mb-4 flex">
              <div className="w-[120px] h-[70px] overflow-hidden">
                {post.picture && (
                  <Image
                    src={String(post.picture)}
                    alt="Media"
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-full h-full object-cover  overflow-clip"
                  />
                )}
              </div>
              <Link
                href={`/news/${post._id}`}
                className="flex-1 flex flex-col pl-2"
              >
                <div className="line-clamp-2 overflow-ellipsis text-[var(--text-secondary)]">
                  {post.title}
                </div>
                <div className="text-[12px] ml-auto mt-auto">
                  {formatRelativeDate(String(post.publishedAt))}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
