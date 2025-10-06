'use client'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { truncateString } from '@/lib/helpers'
import { useSearchParams } from 'next/navigation'
import { NavStore } from '@/src/zustand/notification/Navigation'
import { PostStore } from '@/src/zustand/post/Post'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import EmptySearch from '@/components/Home/Trace/EmptySearch'
import PostCard from '@/components/Home/Posts/PostCard'

export default function SearchedPostList() {
  const { searchedText, query } = NavStore()
  const {
    searchItem,
    addMoreSearchItems,
    clearSearchedPosts,
    getQueryPosts,
    searchedPosts,
    searchedPostResult,
    loading,
    hasMoreSearch,
  } = PostStore()
  const [page_size] = useState(20)
  const { user } = AuthStore()
  const [page, setPage] = useState(1)
  const lastCardRef = useRef<HTMLDivElement | null>(null)
  const url = '/posts/search'
  const searchParams = useSearchParams()

  useEffect(() => {
    const findItems = async () => {
      addMoreSearchItems(getUrl(searchedText, page))
    }
    if (page > 1) {
      findItems()
    }
  }, [page, user])

  useEffect(() => {
    const findResults = async () => {
      searchItem(getUrl(searchedText, 1))
    }
    if (searchedText.length > 0 && user) {
      findResults()
    } else {
      clearSearchedPosts()
    }
  }, [searchedText, query, user])

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      getQueryPosts(getUrl(q, 1))
    } else {
      getQueryPosts(getUrl('', 1))
    }
  }, [])

  useEffect(() => {
    if (!lastCardRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreSearch) {
          setPage(page + 1)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(lastCardRef.current)
    return () => observer.disconnect()
  }, [searchedPosts.length])

  const getUrl = (text: string, pageNum: number): string => {
    const myIds = [user?._id]
    return `${url}/?${query}myIds=${encodeURIComponent(myIds.join(','))}&myId=${
      user?._id
    }&username=${text}&displayName=${text}&postType=main&content=${text}&firstName=${text}&name=${text}&page_size=${page_size}&page=${pageNum}`
  }

  return (
    <div className="pb-[55px] sm:pb-0 min-h-[80vh] relative w-full">
      {loading && (
        <div className="flex absolute top-0 left-0 z-40 items-center h-5 justify-center flex-wrap w-full">
          <i
            className={`bi mt-[10px]  bi-opencollective loading  text-md text-[var(--custom-color)]`}
          ></i>
        </div>
      )}

      {searchedPostResult.length > 0 && searchedText.length > 0 && (
        <div className="absolute z-30 w-full top-0 left-0 bg-[var(--primary)] overflow-auto max-h-[300px] border border-[var(--border)]">
          {searchedPostResult.slice(0, 5).map((post, index) => (
            <div key={index} className="py-3 px-3">
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
          ))}
        </div>
      )}

      {searchedPosts.length === 0 && <EmptySearch />}

      {searchedPosts.map((post, index) => (
        <PostCard
          post={post}
          key={index}
          lastRef={index === searchedPosts.length - 1 ? lastCardRef : undefined}
        />
      ))}
    </div>
  )
}
