import NewsCard from './NewsCard'
import NewsStore from '@/src/zustand/news/News'

export default function MainNewsGrid() {
  const { featuredNews } = NewsStore()

  return (
    <>
      <div className="text-lg px-2 mb-2 sm:px-0">{`Today's`} News</div>

      <div className="grid sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-x-2 gap-y-4 sm:pb-0">
        {featuredNews.map((news, index) => (
          <NewsCard key={index} post={news} />
        ))}
      </div>
    </>
  )
}
