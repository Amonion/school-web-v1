'use client'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import SocialStore from '@/src/zustand/post/Social'
import FollowingCard from '@/components/Home/Profile/FollowingCard'
import { useTheme } from '@/context/ThemeProvider'

export default function PeopleList() {
  const lastUserRef = useRef<HTMLDivElement | null>(null)
  const {
    hasMoreFollowings,
    currentFollowingsPage,
    followings,
    page_size,
    loading,
    setCurrentFollowingsPage,
    getFollowings,
    fetchMoreFollowings,
  } = SocialStore()
  const { user } = AuthStore()
  const { theme } = useTheme()
  const sort = '-createdAt'
  useEffect(() => {
    if (!lastUserRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreFollowings) {
          setCurrentFollowingsPage(currentFollowingsPage + 1)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(lastUserRef.current)
    return () => observer.disconnect()
  }, [followings.length])

  useEffect(() => {
    if (user) {
      fetchFollowers()
    }
  }, [user])

  useEffect(() => {
    if (currentFollowingsPage > 1) {
      fetchMoreFollowings(
        `/posts/followers/?userId=${user?._id}&page_size=${page_size}&page=${currentFollowingsPage}&ordering=${sort}&postType=main`
      )
    }
  }, [currentFollowingsPage])

  const fetchFollowers = () => {
    if (user) {
      setCurrentFollowingsPage(1)
      getFollowings(
        `/posts/following/?followerId=${user._id}&page_size=${page_size}&page=1&ordering=-createdAt`
      )
    }
  }

  return (
    <div className="flex flex-col w-full">
      {loading && (
        <div className="flex items-center h-10 justify-center flex-wrap w-full">
          <i
            className={`bi  bi-opencollective loading  text-md text-[var(--custom-color)]`}
          ></i>
        </div>
      )}

      {followings.length === 0 && (
        <div className="w-full flex-col pt-5 items-center flex justify-center">
          <Image
            style={{ width: '100%', maxWidth: '300px', height: 'auto' }}
            src={`${
              theme === 'light' ? '/images/trace.png' : '/images/tracel.png'
            } `}
            loading="lazy"
            sizes="100vw"
            className="w-full mb-5 max-w-[300]"
            width={0}
            height={0}
            alt="Schooling Trace"
          />
          <div className="text-center text-2xl text-[var(--text-secondary)] uppercase font-semibold">
            You have no followings
          </div>{' '}
        </div>
      )}

      {followings.map((item, index) => {
        const isLast = index === followings.length - 1
        return (
          <FollowingCard
            key={item._id}
            social={item}
            ref={isLast ? lastUserRef : null}
          />
        )
      })}
    </div>
  )
}
