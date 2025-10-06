'use client'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { useAuthStore } from '@/src/zustand/authStore'
import SocialStore from '@/src/zustand/users/Social'
import { useTheme } from '@/context/ThemeContext'
import MutedCard from '@/components/Users/Profile/MutedCard'

export default function PeopleList() {
  const lastUserRef = useRef<HTMLDivElement | null>(null)
  const {
    hasMoreMutes,
    currentMutedPage,
    mutedUsers,
    page_size,
    loading,
    setCurrentMutedPage,
    getMutedUsers,
    fetchMoreMutedUsers,
  } = SocialStore()
  const { user } = useAuthStore()
  const { theme } = useTheme()
  const sort = '-createdAt'
  useEffect(() => {
    if (!lastUserRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreMutes) {
          setCurrentMutedPage(currentMutedPage + 1)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(lastUserRef.current)
    return () => observer.disconnect()
  }, [mutedUsers.length])

  useEffect(() => {
    if (user) {
      fetchMutedUsers()
    }
  }, [user])

  useEffect(() => {
    if (currentMutedPage > 1) {
      fetchMoreMutedUsers(
        `/posts/mutes/?userId=${user?._id}&page_size=${page_size}&page=${currentMutedPage}&ordering=${sort}&postType=main`
      )
    }
  }, [currentMutedPage])

  const fetchMutedUsers = () => {
    if (user) {
      setCurrentMutedPage(1)
      getMutedUsers(
        `/posts/mutes/?userId=${user?._id}&page_size=${page_size}&page=1&ordering=-createdAt`
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

      {mutedUsers.length === 0 && (
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
            You have no muted users
          </div>{' '}
        </div>
      )}

      {mutedUsers.map((item, index) => {
        const isLast = index === mutedUsers.length - 1
        return (
          <MutedCard
            key={item._id}
            social={item}
            ref={isLast ? lastUserRef : null}
          />
        )
      })}
    </div>
  )
}
