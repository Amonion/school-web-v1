'use client'
import Image from 'next/image'
import NewsStore from '@/src/zustand/news/News'
import { MessageStore } from '@/src/zustand/notification/Message'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import { formatDate } from '@/lib/helpers'
import NewsStat from '@/components/News/NewsStat'

const Home: React.FC = () => {
  const { getANews, newsForm } = NewsStore()
  const { setMessage } = MessageStore()
  const { id } = useParams()

  useEffect(() => {
    if (!newsForm._id) {
      getANews(`/news/${id}`, setMessage)
    } else {
      NewsStore.setState((prev) => {
        const news = prev.featuredNews.find((item) => item._id === id)
        return {
          newsForm: news,
        }
      })
    }
  }, [id])

  return (
    <>
      <div className="relative mb-2">
        {newsForm.picture && (
          <Image
            style={{ height: 'auto' }}
            src={String(newsForm.picture)}
            loading="lazy"
            sizes="100vw"
            className="w-full h-[300px] object-contain"
            width={0}
            height={0}
            alt={newsForm.title}
          />
        )}
      </div>
      <NewsStat post={newsForm} />

      <div className="mb-2">
        <div className="text-lg text-[var(--text-secondary)] sm:text-xl font-semibold mb-1">
          {newsForm.title}
        </div>
        <div className="sm:text-lg">{newsForm.subtitle}</div>
      </div>
      <div className="mb-5 flex items-center">
        <div className="w-[40px] min-w-[40px] h-[40px] overflow-hidden relative rounded-full">
          <Image
            src={String(newsForm.picture)}
            alt={newsForm.author}
            fill
            className="object-cover"
          />
        </div>
        <div className="mx-3 h-2 w-2 rounded-full bg-[var(--text-primary)]" />
        <div className="text-sm">{newsForm.author}</div>
        <div className="mx-3 h-2 w-2 rounded-full bg-[var(--text-primary)]" />
        <div className="text-sm">Published</div>
        <div className="mx-3 h-2 w-2 rounded-full bg-[var(--text-primary)]" />
        <div className="text-sm">
          {formatDate(String(newsForm.publishedAt))}
        </div>
      </div>
      <div
        className="text-sm sm:text-base leading-[25px]"
        dangerouslySetInnerHTML={{
          __html: newsForm.content,
        }}
      />
    </>
  )
}

export default Home
