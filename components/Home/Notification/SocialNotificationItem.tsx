'use client'
import { formatDateToDDMMYY, formatTimeTo12Hour } from '@/lib/helpers'
import { SocialNotification } from '@/src/zustand/notification/SocialNotification'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import Image from 'next/image'
import { MutableRefObject } from 'react'

interface NotificationItemProps {
  item: SocialNotification
  isLast?: boolean
  lastCardRef?: MutableRefObject<HTMLDivElement | null>
}

export default function SocialNotificationItem({
  item,
  isLast = false,
  lastCardRef,
}: NotificationItemProps) {
  const { user } = AuthStore()

  return (
    <div
      ref={isLast ? lastCardRef : undefined}
      className="flex items-start mb-2"
    >
      {/* Avatar */}
      <div className="w-[40px] h-[40px] min-w-[40px] mr-2 rounded-full overflow-hidden">
        {item.senderUsername === 'Schooling' ? (
          <Image
            src="/images/active-icon.png"
            alt="system"
            sizes="100vw"
            width={40}
            height={40}
          />
        ) : (
          <Image
            className="object-cover"
            src={
              item.senderUsername === user?.username
                ? item.receiverPicture
                : item.senderPicture
            }
            alt="user"
            sizes="100vw"
            width={40}
            height={40}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 py-2 px-[10px] bg-[var(--white)] rounded">
        <div className="flex mb-2 flex-wrap items-end justify-between">
          <div className="uppercase line-clamp-1 text-[var(--text-secondary)] mr-2">
            {item.title}
          </div>

          <div className="text-[12px] whitespace-nowrap">
            {formatTimeTo12Hour(item.createdAt)}
            {formatDateToDDMMYY(item.createdAt)}
          </div>
        </div>

        <div className="mb-1">
          {item.greetings} {user?.username}
        </div>

        <div
          className="text-sm sm:text-base"
          dangerouslySetInnerHTML={{ __html: item.content }}
        />
      </div>
    </div>
  )
}
