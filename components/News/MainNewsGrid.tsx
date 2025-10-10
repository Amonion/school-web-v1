import { PostStore } from '@/src/zustand/post/Post'

import NewsCard from './NewsCard'
import NewsStore from '@/src/zustand/news/News'

export default function MainNewsGrid() {
  const { loading } = PostStore()

  const { featuredNews } = NewsStore()

  return (
    <div className="pb-[55px] grid sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-2 sm:pb-0">
      {featuredNews.map((news, index) => (
        <NewsCard key={index} post={news} />
      ))}

      {loading && (
        <div className="flex fixed top-[70px] z-50 left-0 items-center h-10 justify-center mt-4 flex-wrap w-full">
          <i
            className={`bi bi-opencollective loading  text-3xl text-[var(--custom-color)]`}
          ></i>
        </div>
      )}
    </div>
  )
}
