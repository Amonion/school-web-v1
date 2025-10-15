import Link from 'next/link'
import Image from 'next/image'
import { UserNotificationStore } from '@/src/zustand/notification/UserNotification'
import { NavStore } from '@/src/zustand/notification/Navigation'
import { useRouter } from 'next/navigation'

export default function OtherHeader() {
  const { unread, personalUnread, officialUnread } = UserNotificationStore()
  const { toggleVNav, toggleAsideVNav } = NavStore()
  const router = useRouter()
  return (
    <div className="px-2">
      <div className="flex items-center mb-2 relative">
        <span onClick={() => router.back()} className="sm:hidden">
          <i className="bi bi-arrow-left text-2xl mr-4"></i>
        </span>
        <span onClick={toggleVNav} className="">
          <i className="bi bi-text-left text-2xl mr-4"></i>
        </span>

        <Link href="/home/questions/" className="absoluteCenter">
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

        <Link href="/home/notifications" className="ml-auto">
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
          className="bi bi-people text-2xl ml-4 hidden sm:block md:hidden font-bold"
        ></i>
      </div>
    </div>
  )
}
