'use client'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { useAuthStore } from '@/src/zustand/authStore'
import SocialStore from '@/src/zustand/users/Social'
import { useTheme } from '@/context/ThemeContext'
import BlockedCard from '@/components/Users/Profile/BlockedCard'

export default function PeopleList() {
  const lastUserRef = useRef<HTMLDivElement | null>(null)
  const {
    hasMoreBlocks,
    currentBlockedPage,
    blockedUsers,
    page_size,
    loading,
    setCurrentBlockedPage,
    getBlockedUsers,
    fetchMoreBlockedUsers,
  } = SocialStore()
  const { user } = useAuthStore()
  const { theme } = useTheme()
  const sort = '-createdAt'

  useEffect(() => {
    if (!lastUserRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreBlocks) {
          setCurrentBlockedPage(currentBlockedPage + 1)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(lastUserRef.current)
    return () => observer.disconnect()
  }, [blockedUsers.length])

  useEffect(() => {
    if (user) {
      fetchblockedUsers()
    }
  }, [user])

  useEffect(() => {
    if (currentBlockedPage > 1) {
      fetchMoreBlockedUsers(
        `/posts/blocks/?userId=${user?._id}&page_size=${page_size}&page=${currentBlockedPage}&ordering=${sort}&postType=main`
      )
    }
  }, [currentBlockedPage])

  const fetchblockedUsers = () => {
    if (user) {
      setCurrentBlockedPage(1)
      getBlockedUsers(
        `/posts/blocks/?userId=${user?._id}&page_size=${page_size}&page=1&ordering=-createdAt`
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

      {blockedUsers.length === 0 && (
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
            You have no blocked users
          </div>{' '}
        </div>
      )}

      {blockedUsers.map((item, index) => {
        const isLast = index === blockedUsers.length - 1
        return (
          <BlockedCard
            key={item._id}
            social={item}
            ref={isLast ? lastUserRef : null}
          />
        )
      })}
    </div>
  )
}
