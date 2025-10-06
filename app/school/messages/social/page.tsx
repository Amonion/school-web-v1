'use client'
import Image from 'next/image'
import { formatDateToDDMMYY, formatTimeTo12Hour } from '@/lib/helpers'
import { OfficeNotificationStore } from '@/src/zustand/notification/OfficeNotification'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import OfficeStore from '@/src/zustand/utility/Office'
import { useEffect } from 'react'
import { MessageStore } from '@/src/zustand/notification/Message'
import NotFound from '@/components/NotFound'

export default function UtilsDashboard() {
  const { bioUserState } = AuthStore()
  const {
    officeSocialNotifications,
    socialPage,
    getOfficeSocialNotifications,
  } = OfficeNotificationStore()
  const { officeForm, page_size } = OfficeStore()
  const { setMessage } = MessageStore()

  useEffect(() => {
    if (!officeForm.username) return
    getOfficeSocialNotifications(
      `/notifications/social/?receiverUsername=${officeForm.username}&page_size=${page_size}&page=${socialPage}&ordering=-createdAt`,
      setMessage
    )
  }, [officeForm, socialPage])

  return (
    <div className="flex-1 flex flex-col text-[var(--text-primary)] w-full">
      <div className=" flex-1 sharp">
        {officeSocialNotifications.map((item, index) => (
          <div className="flex items-start mb-2" key={index}>
            <div className="overflow-hidden border border-[var(--border)] rounded-full w-[30px] h-[30px] sm:w-[40px] sm:h-[40px] mr-1 sm:mr-2">
              {item.senderUsername === 'Schooling' ? (
                <Image
                  className="object-contain "
                  src="/images/active-icon.png"
                  loading="lazy"
                  alt="username"
                  sizes="100vw"
                  height={0}
                  width={0}
                  style={{ height: '100%', width: '100%' }}
                />
              ) : (
                <Image
                  className="object-cover "
                  src={
                    item.senderUsername === bioUserState?.activeOffice.username
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
            <div className="flex flex-col flex-1 py-2 px-[10px] bg-[var(--white)] mb-2">
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

              <div className="flex items-center">
                <div
                  className="line-clamp-1 text-sm sm:text-base overflow-ellipsis"
                  dangerouslySetInnerHTML={{ __html: item.content }}
                ></div>{' '}
              </div>
            </div>
          </div>
        ))}
        {officeSocialNotifications.length === 0 && (
          <NotFound message="You have no notifications" />
        )}
      </div>
    </div>
  )
}
