'use client'
import { formatTimeTo12Hour } from '@/lib/helpers'
import { OfficeNotificationStore } from '@/src/zustand/notification/OfficeNotification'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import Image from 'next/image'

export default function LatestMessages() {
  const { bioUserState } = AuthStore()
  const { officialMessages } = OfficeNotificationStore()
  return (
    <div className="card_body flex-1 sm:mr-4 mb-2 sm:mb-0 p-4 sharp overflow-x-auto">
      <h2 className="mb-2 text-lg font-semibold">Latest Messages</h2>

      {officialMessages
        .filter(
          (item) => item.senderUsername !== bioUserState?.activeOffice.username
        )
        .slice(0, 5)
        .map((item, index) => (
          <div
            key={index}
            className="flex items-start mb-2 w-full bg-[var(--secondary)] rounded-[5px] p-2"
          >
            <Image
              className={`${
                item.senderUsername === 'Schooling'
                  ? 'object-contain'
                  : 'object-cover'
              } rounded-full mr-2`}
              src={
                item.senderUsername === 'Schooling'
                  ? '/images/active-icon.png'
                  : item.senderPicture
              }
              loading="lazy"
              alt="username"
              sizes="100vw"
              height={0}
              width={0}
              style={{ height: '40px', width: '40px' }}
            />
            <div className="flex-1">
              <div className="flex justify-between items-end">
                <div className="text-[var(--text-secondary)] text-sm">
                  {item.senderName}
                </div>
                <div className="text-[12px]">
                  {formatTimeTo12Hour(item.createdAt)}
                </div>
              </div>
              <div
                className="line-clamp-2 text-sm overflow-ellipsis"
                dangerouslySetInnerHTML={{ __html: item.content }}
              ></div>
            </div>
          </div>
        ))}
    </div>
  )
}
