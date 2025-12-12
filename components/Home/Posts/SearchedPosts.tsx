import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Post } from '@/src/zustand/post/Post'
import { truncateString } from '@/lib/helpers'
import { PostStore } from '@/src/zustand/Trace/TracePosts'

interface SearchedPostCardProps {
  post: Post
}

const SearchedPostCard: React.FC<SearchedPostCardProps> = ({ post }) => {
  const router = useRouter()
  const params = useSearchParams()
  const { postSearchtext, setSearchedPosts } = PostStore()

  const onClick = () => {
    const newParams = new URLSearchParams(params.toString())
    if (postSearchtext.trim()) {
      newParams.set('q', postSearchtext.trim())
      setSearchedPosts()
    } else {
      newParams.delete('q')
    }
    router.push(`?${newParams.toString()}`, { scroll: false })
  }
  return (
    <>
      <div onClick={onClick} className="py-3 px-3 cursor-pointer">
        <div className="flex items-start">
          <Image
            style={{ height: '30px', width: '30px', objectFit: 'cover' }}
            src={String(post.picture)}
            loading="lazy"
            sizes="100vw"
            className="rounded-full mr-3 mt-1 object-cover"
            width={0}
            height={0}
            alt={`${post.displayName}`}
          />
          <div>
            <div className="account_name">
              {truncateString(post.displayName, 150)}
            </div>
            <div className="post_username ">@{post.username}</div>
          </div>
        </div>
        <div className="mb-auto xs:pt-0 flex items-center flex-wrap">
          <div
            className="text-[15px] line-clamp-2 overflow-ellipsis"
            dangerouslySetInnerHTML={{
              __html: post.content,
            }}
          ></div>
        </div>
      </div>
    </>
  )
}

export default SearchedPostCard
