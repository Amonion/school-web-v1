'use client'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation' // ✅ Get dynamic route params
import { MessageStore } from '@/src/zustand/notification/Message'
import { PostStore } from '@/src/zustand/post/Post'
import PostCard from '@/components/Home/Posts/PostCard'
import { AuthStore } from '@/src/zustand/user/AuthStore'

const UserPosts = () => {
  const { username } = useParams()
  // const [loading, setLoading] = useState(false);
  const [page_size] = useState(10)
  const { setMessage } = MessageStore()
  const [currentPage, setCurrentPage] = useState(1)
  const lastPostRef = useRef<HTMLDivElement | null>(null)
  const { user } = AuthStore()
  const { loading, postResults, getPosts, reshuffleResults, addMorePosts } =
    PostStore()

  const findPosts = async () => {
    getPosts(
      `/posts/?username=${username}&myId=${user?._id}&ordering=-createdA&postType=comment&page_size=${page_size}&page=${currentPage}`,
      setMessage
    )
  }

  useEffect(() => {
    if (username && user) {
      findPosts()
    }
  }, [username, user])

  useEffect(() => {
    addMorePosts(
      `/posts/?username=${username}&myId=${user?._id}&ordering=-createdAt&postType=comment&page_size=${page_size}&page=${currentPage}`,
      setMessage
    )
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
              Sorry, No Repies Found
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default UserPosts
