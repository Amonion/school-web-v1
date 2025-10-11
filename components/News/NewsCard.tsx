import Image from 'next/image'
import { News } from '@/src/zustand/news/News'
import { formatRelativeDate } from '@/lib/helpers'
import NewsStat from './NewsStat'

interface NewsCardProps {
  post: News
  lastRef?: React.RefObject<HTMLDivElement>
}

const NewsCard: React.FC<
  NewsCardProps & { lastRef?: React.RefObject<HTMLDivElement> }
> = ({ post, lastRef }) => {
  return (
    <>
      <div ref={lastRef} className="mb-2">
        <div className="w-full lg:h-[200px] text-white h-[250px] relative xs:h-[300px] sm:h-[250px] md:h-[250px] overflow-hidden">
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute right-1 top-2 rounded-[25px] bg-black/50  py-1 px-2 text-[12px] items-center flex">
            {formatRelativeDate(String(post?.publishedAt))}
          </div>
          <div className="line-clamp-2 overflow-ellipsis absolute z-10 bottom-2 left-0 p-2">
            {post.title}
          </div>
        </div>
        <NewsStat post={post} />
      </div>
    </>
  )
}

export default NewsCard
