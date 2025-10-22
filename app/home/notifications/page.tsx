'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { formatDateToDDMMYY, formatTimeTo12Hour } from '@/lib/helpers'
import { MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { SocialNotificationStore } from '@/src/zustand/notification/SocialNotification'
// import TruncatedText from "@/components/Users/Notifications/TruncateText";

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
          <div
            ref={
              index === socialNotifications.length - 1 ? lastCardRef : undefined
            }
            className="flex items-start mb-2"
            key={index}
          >
            <div className="w-[40px] rounded-full overflow-hidden min-w-[40px] mr-2 h-[40px]">
              {item.senderUsername === 'Schooling' ? (
                <Image
                  src="/images/active-icon.png"
                  loading="lazy"
                  alt="username"
                  sizes="100vw"
                  height={0}
                  width={0}
                  style={{ height: 'auto', width: '100%' }}
                />
              ) : (
                <Image
                  className="object-cover "
                  src={
                    item.senderUsername === user?.username
                      ? item.receiverPicture
                      : item.senderPicture
                  }
                  loading="lazy"
                  alt="username"
                  sizes="100vw"
                  height={0}
                  width={0}
                  style={{ height: '100%', width: '100%' }}
                />
              )}
            </div>
            <div className="flex flex-col flex-1 py-2 px-[10px] bg-[var(--white)]">
              <div className="flex mb-2 flex-wrap items-end justify-between">
                <div
                  className={` uppercase overflow-ellipsis line-clamp-1 text-[var(--text-secondary)] mr-2`}
                >
                  {item.title}
                </div>
                <div className="text-[12px]">
                  {formatTimeTo12Hour(item.createdAt)} |{' '}
                  {formatDateToDDMMYY(item.createdAt)}
                </div>
              </div>
              <div className="flex">
                <div className="mr-2">
                  {item.greetings} {user?.username}
                </div>
              </div>
              <div className="flex items-center">
                <div
                  className="text-sm sm:text-base"
                  dangerouslySetInnerHTML={{ __html: item.content }}
                ></div>{' '}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default SocialNotifications
