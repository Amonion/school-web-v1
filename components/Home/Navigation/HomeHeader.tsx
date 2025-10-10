import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { MessageStore } from '@/src/zustand/notification/Message'
import { UserNotificationStore } from '@/src/zustand/notification/UserNotification'
import { NavStore } from '@/src/zustand/notification/Navigation'
import { PostStore } from '@/src/zustand/post/Post'

export default function HomeHeader() {
  const { unread, personalUnread, officialUnread } = UserNotificationStore()
  const { user } = AuthStore()
  const { setMessage } = MessageStore()
  const { toggleVNav, togglePostBox, toggleAsideVNav, setScrollUp } = NavStore()
  const { getPosts, page_size } = PostStore()

  const [sort] = useState('-createdAt')

  const refresh = async () => {
    setScrollUp()
    if (user) {
      getPosts(
        `/posts/?myId=${user._id}&page_size=${page_size}&page=1&ordering=${sort}&postType=main`,
        setMessage
      )
    }
  }

  return (
    <div className="px-2">
      <div className="flex items-center mb-2 relative">
        <span onClick={toggleVNav} className="sm:hidden">
          <i className="bi bi-text-left text-2xl mr-4"></i>
        </span>
        <i
          onClick={togglePostBox}
          className="bi bi-pen text-2xl hidden sm:block cursor-pointer"
        ></i>
        <Link href="/home/questions/" className="mx-auto hidden sm:block">
          <Image
            style={{ height: 'auto' }}
            src="/images/cap.png"
            loading="lazy"
            sizes="100vw"
            className="sm:w-12 w-10"
            width={0}
            height={0}
            alt="Schooling Social Logo"
          />
        </Link>
        <div
          onClick={refresh}
          className="mx-auto block cursor-pointer sm:hidden"
        >
          <Image
            style={{ height: 'auto' }}
            src="/images/cap.png"
            loading="lazy"
            sizes="100vw"
            className="sm:w-12 w-10"
            width={0}
            height={0}
            alt="Schooling Social Logo"
          />
        </div>
        <Link href="/home/trace" className="">
          <i className="bi bi-search text-2xl ml-4"></i>
        </Link>
      </div>
      <div className="flex items-center justify-between">
        <Link href={`/home/following`} className="">
          <i className={`bi bi-megaphone font-bold text-2xl`}></i>
        </Link>
        <Link href={`/news`} className="">
          <i className={`bi bi-globe font-bold text-2xl`}></i>
        </Link>
        <Link href={`/home/following`} className="">
          <i className={`bi bi-gift font-bold text-2xl`}></i>
        </Link>

        <Link href="/home/notifications" className="">
          {unread + officialUnread + personalUnread > 0 && (
            <span className="dot_notification">
              {unread + officialUnread + personalUnread > 9
                ? `9+`
                : unread + officialUnread + personalUnread}
            </span>
          )}
          <i className={`bi bi-bell font-bold text-2xl`}></i>
        </Link>

        <i
          onClick={toggleAsideVNav}
          className="bi bi-people text-2xl hidden sm:block md:hidden font-bold"
        ></i>
      </div>
    </div>
  )
}
