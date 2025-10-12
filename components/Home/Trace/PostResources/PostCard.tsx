import Image from 'next/image'
import Link from 'next/link'

import { forwardRef } from 'react'
import { truncateString } from '@/lib/helpers'
import { Post } from '@/src/zustand/post/Post'

interface PostListCardProps {
  post: Post
}

const PostListCard = forwardRef<HTMLDivElement, PostListCardProps>(
  ({ post }, ref) => {
    return (
      <>
        <div ref={ref} className="w-full">
          <Link
            href={`/home/post/${post._id}`}
            className="post_card all flex w-full"
          >
            {post.media && post.media[0] && (
              <div className="h-auto pr-[10px] max-h-[70px] w-[70px] sm:max-h-[150px] sm:w-[150px] xs:rounded-[10px] rounded-[5px] block overflow-hidden">
                {post.media[0].type === 'video' ? (
                  <video
                    className="w-full h-full object-cover pointer-events-none"
                    src={post.media[0].source}
                    muted
                    loop
                    preload="metadata"
                  />
                ) : (
                  <Image
                    style={{ height: '100%', objectFit: 'cover' }}
                    src={post.media[0].source}
                    loading="lazy"
                    sizes="100vw"
                    className="w-full h-full object-cover"
                    width={0}
                    height={0}
                    alt={post.username}
                  />
                )}
              </div>
            )}
            <div className="flex flex-1 relative flex-wrap pr-[10px]">
              <div className="flex  flex-wrap w-full ">
                <div className="flex-1 flex items-start flex-col">
                  <div className="mb-auto xs:pt-0 flex items-center flex-wrap">
                    <div className="account_name mr-1">
                      {truncateString(post.displayName, 150)}
                    </div>
                    <div className="post_username ">@{post.username}</div>
                  </div>
                  <div className="mb-auto xs:pt-0 flex items-center flex-wrap">
                    <div
                      className="text-[14px] line-clamp-2"
                      dangerouslySetInnerHTML={{
                        __html: truncateString(post.content, 150),
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </>
    )
  }
)

PostListCard.displayName = 'PostListCard'

export default PostListCard
