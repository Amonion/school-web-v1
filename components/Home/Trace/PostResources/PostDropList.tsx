'use client'
import Image from 'next/image'
import { truncateString } from '@/lib/helpers'
import { NavStore } from '@/src/zustand/notification/Navigation'
import { PostStore } from '@/src/zustand/post/Post'
import Link from 'next/link'
import { useEffect } from 'react'

export default function PostDropList() {
  const { searchedText, headerHeight } = NavStore()
  const { searchedPostResult, loading } = PostStore()
  useEffect(() => {
    return () => {
      PostStore.setState({ searchedPostResult: [] })
      NavStore.setState({ searchedText: '' })
    }
  }, [])

  return (
    <div style={{ top: headerHeight }} className="absolute z-30 w-full left-0">
      {loading && (
        <div className="flex absolute top-0 left-0 z-40 items-center h-5 justify-center flex-wrap w-full">
          <i
            className={`bi mt-[10px]  bi-opencollective loading  text-md text-[var(--custom-color)]`}
          ></i>
        </div>
      )}

      {searchedPostResult.length > 0 && searchedText.length > 0 && (
        <div className=" bg-[var(--primary)] overflow-auto max-h-[300px] border border-[var(--border)]">
          {searchedPostResult.slice(0, 5).map((post, index) => (
            <div key={index} className="py-3 px-3">
              <Link
                href={`/home/profile/${post.username}`}
                className="flex items-start"
              >
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
              </Link>
              <Link
                href={`/home/posts/${post._id}`}
                className="mb-auto xs:pt-0 flex items-center flex-wrap"
              >
                <div
                  className="text-[15px] line-clamp-2 overflow-ellipsis"
                  dangerouslySetInnerHTML={{
                    __html: post.content,
                  }}
                ></div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
