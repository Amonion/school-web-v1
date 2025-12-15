import Link from 'next/link'
import Image from 'next/image'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { UserNotificationStore } from '@/src/zustand/notification/UserNotification'
import { NavStore } from '@/src/zustand/notification/Navigation'
import { PostStore } from '@/src/zustand/post/Post'
import { SocialNotificationStore } from '@/src/zustand/notification/SocialNotification'

export default function HomeHeader() {
  const { personalUnread, officialUnread } = UserNotificationStore()
  const { unreadNotifications } = SocialNotificationStore()
  const { user } = AuthStore()
  const { toggleVNav, toggleAsideVNav, setScrollUp } = NavStore()
  const { getSavedPosts } = PostStore()

  const refresh = async () => {
    setScrollUp()
    if (user) {
      getSavedPosts(user)
    }
  }

  return (
    <div className="px-2">
      <div className="flex items-center mb-2 relative">
        <span onClick={toggleVNav} className="sm:hidden">
          <i className="bi bi-text-left text-2xl mr-4"></i>
        </span>
        <Link href={`/home/posts/create-post`}>
          <i className="bi bi-pen text-2xl hidden sm:block cursor-pointer"></i>
        </Link>

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
          <i className={`bi bi-megaphone font-bold text-xl`}></i>
        </Link>
        <Link href={`/news`} className="">
          <i className={`bi bi-globe font-bold text-xl`}></i>
        </Link>
        <Link href={`/giveaway`} className="">
          <i className={`bi bi-gift font-bold text-xl`}></i>
        </Link>

        <Link href="/home/notifications" className="relative">
          {unreadNotifications + officialUnread + personalUnread > 0 && (
            <span className="dot_notification">
              {unreadNotifications + officialUnread + personalUnread > 9
                ? `9+`
                : unreadNotifications + officialUnread + personalUnread}
            </span>
          )}
          <i className={`bi bi-bell font-bold text-xl`}></i>
        </Link>

        <i
          onClick={toggleAsideVNav}
          className="bi bi-people text-xl hidden sm:block md:hidden font-bold"
        ></i>
      </div>
    </div>
  )
}
