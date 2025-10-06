'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { formatDateToDDMMYY, formatTimeTo12Hour } from '@/lib/helpers'
import { UserNotificationStore } from '@/src/zustand/notification/UserNotification'
import { MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'
// import TruncatedText from "@/components/Users/Notifications/TruncateText";

const PersonalNotifications: React.FC = () => {
  const {
    setPersonalPage,
    addMorePersonalNotifications,
    hasMorePersonalNotifications,
    page_size,
    personalPage,
    personalNotifications,
  } = UserNotificationStore()

  const lastCardRef = useRef<HTMLDivElement | null>(null)
  const [sort] = useState('-createdAt')
  const { setMessage } = MessageStore()
  const { bioUser } = AuthStore()
  const url = '/notifications/personal'

  useEffect(() => {
    if (personalPage > 0 && bioUser) {
      addMorePersonalNotifications(
        `${url}?page_size=${page_size}&page=${personalPage}&ordering=${sort}&receiverUsername=${bioUser?.bioUserUsername}&senderUsername=${bioUser?.bioUserUsername}`,
        setMessage
      )
    }
  }, [personalPage, bioUser])

  useEffect(() => {
    if (!lastCardRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMorePersonalNotifications) {
          setPersonalPage(personalPage + 1)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(lastCardRef.current)
    return () => observer.disconnect()
  }, [personalNotifications.length])
  return (
    <>
      <div className=" flex-1 sharp">
        {personalNotifications.map((item, index) => (
          <div
            ref={
              index === personalNotifications.length - 1
                ? lastCardRef
                : undefined
            }
            className="flex items-start mb-2"
            key={index}
          >
            <div className="w-[30px] rounded-full overflow-hidden sm:w-[40px] min-w-[30px] sm:min-w-[40px] mr-2 sm:h-[40px] h-[30px]">
              {item.senderUsername === 'Schooling' ? (
                <Image
                  src="/images/active-icon.png"
                  loading="lazy"
                  alt="username"
                  sizes="100vw"
                  height={0}
                  width={0}
                  className="object-contain"
                  style={{ height: '100%', width: '100%' }}
                />
              ) : (
                <Image
                  className="object-contain"
                  src={
                    item.senderUsername === bioUser?.bioUserUsername
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
            <div className="flex text-sm flex-col flex-1 py-2 px-[10px] bg-[var(--white)]">
              <div className="flex mb-2 flex-wrap items-end justify-between">
                <div
                  className={`overflow-ellipsis uppercase line-clamp-1 text-[var(--text-secondary)] mr-2`}
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
                  {item.greetings} {bioUser?.bioUserUsername}
                </div>
              </div>
              <div className="flex items-center">
                <div
                  className="line-clamp-1 text-sm sm:text-base overflow-ellipsis"
                  dangerouslySetInnerHTML={{ __html: item.content }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default PersonalNotifications
