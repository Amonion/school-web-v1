'use client'
import { useEffect, useRef, useState } from 'react'
import { MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { SocialNotificationStore } from '@/src/zustand/notification/SocialNotification'
import SocialNotificationItem from '@/components/Home/Notification/SocialNotificationItem'

const SocialNotifications: React.FC = () => {
  const {
    setCurrentPage,
    addMoreSocialNotifications,
    hasMore,
    page_size,
    currentPage,
    socialNotifications,
  } = SocialNotificationStore()
  const lastCardRef = useRef<HTMLDivElement | null>(null)
  const [sort] = useState('-createdAt')
  const { setMessage } = MessageStore()
  const { user } = AuthStore()
  const url = '/user-notifications/'

  useEffect(() => {
    if (currentPage > 1 && user) {
      addMoreSocialNotifications(
        `${url}?page_size=${page_size}&page=${currentPage}&ordering=${sort}&receiverUsername=${user?.username}&senderUsername=${user?.username}`,
        setMessage
      )
    }
  }, [currentPage, user])

  useEffect(() => {
    if (!lastCardRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setCurrentPage(currentPage + 1)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(lastCardRef.current)
    return () => observer.disconnect()
  }, [socialNotifications.length])
  return (
    <>
      <div className=" flex-1 sharp">
        {socialNotifications.map((item, index) => (
          <SocialNotificationItem
            key={index}
            item={item}
            lastCardRef={lastCardRef}
            isLast={index === socialNotifications.length - 1}
          />
        ))}
      </div>
    </>
  )
}

export default SocialNotifications
