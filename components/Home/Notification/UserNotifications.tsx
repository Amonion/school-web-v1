'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'

import { formatDateToDDMMYY, formatTimeTo12Hour } from '@/lib/helpers'
import { UserNotificationStore } from '@/src/zustand/notification/UserNotification'
import { MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import LinkedPagination from '@/components/Team/LinkedPagination'
import { useParams } from 'next/navigation'
// import TruncatedText from "@/components/Users/Notifications/TruncateText";

const UserNotifications: React.FC = () => {
  const {
    getSocialNotifications,
    count,
    socialNotifications,
    reshuffleResults,
  } = UserNotificationStore()

  const [page_size] = useState(8)
  const [sort] = useState('-createdAt')
  const { page } = useParams()
  const { setMessage } = MessageStore()
  const { user } = AuthStore()
  const url = '/user-notifications/'

  useEffect(() => {
    reshuffleResults()
    const params = `?page_size=${page_size}&page=${
      page ? page : 1
    }&ordering=${sort}&receiverUsername=${user?.username}&senderUsername=${
      user?.username
    }`
    getSocialNotifications(`${url}${params}`, setMessage)
  }, [user])

  useEffect(() => {
    if (page && Number(page) > 0) {
      const params = `?page_size=${page_size}&page=${page}&ordering=${sort}&receiverUsername=${user?.username}&senderUsername=${user?.username}`
      getSocialNotifications(`${url}${params}`, setMessage)
    }
  }, [page])

  return (
    <>
      <div className=" flex-1 sharp">
        {socialNotifications.map((item, index) => (
          <div className="flex items-start mb-2" key={index}>
            <div className="overflow-hidden border border-[var(--border)] rounded-full w-[30px] h-[30px] sm:w-[40px] sm:h-[40px] mr-1 sm:mr-2">
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
              <div className="flex">
                <div className="mr-2">{item.greetings}</div>
              </div>
              <div className="flex items-center">
                <div
                  className="line-clamp-1 text-sm sm:text-base overflow-ellipsis"
                  dangerouslySetInnerHTML={{ __html: item.content }}
                ></div>{' '}
                {/* <Link
                            href={`/school/messages/${item._id}`}
                            className="ml-auto text-sm text-[var(--custom)]"
                          >
                            Read
                          </Link> */}
              </div>
            </div>
          </div>
        ))}
      </div>

      <LinkedPagination
        url="/user-notifications"
        count={count}
        page_size={20}
        query={`?page_size=${page_size}&ordering=${sort}&receiverUsername=${user?.username}&senderUsername=${user?.username}`}
      />
    </>
  )
}

export default UserNotifications
