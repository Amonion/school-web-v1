'use client'
import Image from 'next/image'
import Link from 'next/link'
import { formatDateToDDMMYY, formatTimeTo12Hour } from '@/lib/helpers'
import { OfficeNotificationStore } from '@/src/zustand/notification/OfficeNotification'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import NotFound from '@/components/NotFound'
import { useEffect } from 'react'
import OfficeStore from '@/src/zustand/utility/Office'
import { MessageStore } from '@/src/zustand/notification/Message'

export default function UtilsDashboard() {
  const { bioUserState } = AuthStore()
  const { setMessage } = MessageStore()
  const {
    officialMessages,
    page_size,
    readOfficeNotification,
    getOfficialMessages,
  } = OfficeNotificationStore()
  const { officeForm } = OfficeStore()

  useEffect(() => {
    const notes = officialMessages.filter(
      (e) => e.unread === true && e.receiverUsername === officeForm.username
    )
    if (notes.length > 0) {
      const noteIds = notes.map((note) => note._id)
      const form = new FormData()
      form.append('ids', JSON.stringify(noteIds))
      readOfficeNotification(
        `/messages/official/read?username=${officeForm.username}`,
        form,
        setMessage
      )
    }
  }, [officeForm, officialMessages])

  useEffect(() => {
    if (!officeForm.username) return
    getOfficialMessages(
      `/messages/official/?officeUsername=${officeForm.username}&bioUserUsername=${officeForm.username}&page_size=${page_size}&page=1&ordering=-createdAt`,
      setMessage
    )
  }, [officeForm])

  return (
    <div className="flex-1 flex flex-col pt-3 sm:pt-0 text-[var(--text-primary)] w-full">
      <div className=" flex-1 sharp">
        {officialMessages.map((item, index) => (
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
              {item.greetings && (
                <div className="flex">
                  <div className="mr-2">{item.greetings}</div>
                </div>
              )}
              <div className="flex items-center">
                <div
                  className="line-clamp-1 text-sm sm:text-base overflow-ellipsis"
                  dangerouslySetInnerHTML={{ __html: item.content }}
                ></div>{' '}
                {item.senderAddress && (
                  <Link
                    href={`/school/messages/${item._id}`}
                    className="ml-auto text-sm text-[var(--custom)]"
                  >
                    Read
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
        {officialMessages.length === 0 && (
          <NotFound message="You have no messages" />
        )}
      </div>
    </div>
  )
}
