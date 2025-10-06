import Image from 'next/image'
import { formatRelativeDate, truncateString } from '@/lib/helpers'
import AdCarousel from './AdCarousel'
import { Post } from '@/src/zustand/post/Post'
import { useTheme } from '@/context/ThemeProvider'
import TruncatedContent from '@/components/Home/Posts/TruncatedContent'
import Polls from '@/components/Home/Posts/Polls'
import PostStat from '@/components/Home/Posts/PostStat'

interface AdCardProps {
  post: Post
  lastRef?: React.RefObject<HTMLDivElement>
}

const AdCard: React.FC<
  AdCardProps & { lastRef?: React.RefObject<HTMLDivElement> }
> = ({ post, lastRef }) => {
  const { theme } = useTheme()

  return (
    <>
      <div ref={lastRef} className="w-full max-w-[500px]">
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          className="flex mb-[6px] cursor-default"
        >
          {
            <div className="w-12 h-12 rounded-full overflow-hidden mr-3 border border-[var(--border)]">
              <Image
                style={{ height: '100%', objectFit: 'cover' }}
                src={`${post.picture || '/avatar.png'}`}
                loading="lazy"
                sizes="100vw"
                className="w-full h-full object-cover"
                width={0}
                height={0}
                alt={`${post.username}`}
              />
            </div>
          }
          <div className="flex-1">
            <div className="flex items-start flex-wrap mb-1">
              <div className="flex items-center">
                {post.displayName && (
                  <div className="account_name mr-2">
                    {truncateString(post.displayName, 150)}
                  </div>
                )}
                {post.isVerified && (
                  <i className="bi bi-shield-check verify_icon"></i>
                )}
              </div>
              {/* <PostOptions post={post} /> */}
            </div>
            <div className="flex justify-between">
              <div className="post_username">@{post.username}</div>

              {post.createdAt && (
                <div className="text-sm">
                  {formatRelativeDate(post.createdAt)}{' '}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-1 rounded-[5px] cursor-pointer mb-1 text-[16px] text-[var(--text-title-color)]">
          {post.content && (
            <TruncatedContent content={post.content} limit={200} post={post} />
          )}
        </div>

        {post.media.length > 0 ? (
          <div className="w-full relative overflow-hidden rounded-[10px] mb-3 aspect-[16/9] flex justify-center bg-[var(--white-gray)] ">
            <AdCarousel items={post.media} />
          </div>
        ) : (
          <div className="w-full relative overflow-hidden rounded-[10px] mb-3 aspect-[16/9] flex justify-center bg-[var(--white-gray)] ">
            <Image
              src={
                theme === 'dark' ? '/images/adDark.png' : '/images/adLight.png'
              }
              alt={`Ad Media`}
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        )}

        <Polls postId={post._id} />

        <PostStat post={post} />
      </div>
    </>
  )
}

export default AdCard
