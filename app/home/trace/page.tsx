'use client'
import { useEffect, useRef } from 'react'
import EmptySearch from '@/components/Home/Trace/EmptySearch'
import { PostStore } from '@/src/zustand/Trace/TracePosts'
import SearchedPostCard from '@/components/Home/Posts/SearchedPosts'
import TracePostCard from '@/components/Home/Trace/PostResources/TracePostCard'

export default function SearchedPostList() {
  const lastCardRef = useRef<HTMLDivElement | null>(null)
  const { postResults, loading, searchedPosts, postSearchtext, searchPost } =
    PostStore()

  useEffect(() => {
    if (postSearchtext.length > 0) {
      searchPost(
        `/posts/search?content=${postSearchtext}&username=${postSearchtext}&displayName=${postSearchtext}`
      )
    } else {
      PostStore.setState({ searchedPosts: [] })
    }
  }, [postSearchtext])

  return (
    <div className="pb-[55px] sm:pb-0 min-h-[80vh] relative w-full">
      {loading && (
        <div className="flex absolute top-0 left-0 z-40 items-center h-5 justify-center flex-wrap w-full">
          <i
            className={`bi mt-[10px]  bi-opencollective loading  text-md text-[var(--custom-color)]`}
          ></i>
        </div>
      )}

      {searchedPosts.length > 0 && postSearchtext.length > 0 && (
        <div className="absolute z-30 w-full top-0 left-0 bg-[var(--primary)] overflow-auto max-h-[300px] border border-[var(--border)]">
          {searchedPosts.map((post, index) => (
            <SearchedPostCard post={post} key={index} />
          ))}
        </div>
      )}

      {postResults.length === 0 && <EmptySearch />}

      {postResults.map((post, index) => (
        <TracePostCard
          post={post}
          key={index}
          lastRef={index === postResults.length - 1 ? lastCardRef : undefined}
        />
      ))}
    </div>
  )
}
