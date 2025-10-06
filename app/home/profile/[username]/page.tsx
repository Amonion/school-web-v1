'use client'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import PostCard from '@/components/Home/Posts/PostCard'
import UserPostStore from '@/src/zustand/post/UserPost'

const UserPosts = () => {
  // const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1)
  const lastPostRef = useRef<HTMLDivElement | null>(null)
  const { loading, postResults, reshuffleResults } = UserPostStore()

  useEffect(() => {
    return () => {
      reshuffleResults()
    }
  }, [currentPage])

  useEffect(() => {
    if (!lastPostRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setCurrentPage(currentPage + 1)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(lastPostRef.current)
    return () => observer.disconnect()
  }, [postResults.length])

  return (
    <>
      {postResults.map((post, index) => (
        <PostCard
          key={index}
          post={post}
          lastRef={index === postResults.length - 1 ? lastPostRef : undefined}
        />
      ))}
      {loading && (
        <div className="flex relative items-center h-5 justify-center flex-wrap w-full">
          <i
            className={`bi mt-[-60px]  bi-opencollective loading  text-md text-[var(--custom-color)]`}
          ></i>
        </div>
      )}
      {postResults.length === 0 && (
        <div className="relative flex-1 py-3 flex justify-center">
          <Image
            src="/images/not-found.png"
            loading="lazy"
            sizes="100vw"
            className="w-full h-full object-contain"
            width={0}
            height={0}
            style={{ height: 'auto', width: 200 }}
            alt="Default Avatar"
          />
          <div className="bg-secondary w-full dark:bg-dark-secondary py-3 absoluteCenter">
            <div className="text-xl uppercase text-center py-1 px-3 bg-[var(--secondary)]">
              Sorry, No Posts Found
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default UserPosts
