import Link from 'next/link'
import Image from 'next/image'
import { UserNotificationStore } from '@/src/zustand/notification/UserNotification'
import { NavStore } from '@/src/zustand/notification/Navigation'
import { useRouter } from 'next/navigation'

export default function NewsHeader() {
  const { unread, personalUnread, officialUnread } = UserNotificationStore()
  const router = useRouter()

  const { toggleVNav } = NavStore()

  return (
    <>
      <div className="flex items-center relative">
        <div className="headerCircle hfs">
          <i onClick={toggleVNav} className="bi bi-text-left text-lg"></i>
        </div>
        <div onClick={() => router.back()} className="headerCircle">
          <i className="bi bi-arrow-left text-lg"></i>
        </div>

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
        <div className="mx-auto block cursor-pointer sm:hidden">
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
        <Link href="/home/notifications" className="headerCircle">
          {unread + officialUnread + personalUnread > 0 && (
            <span className="dot_notification">
              {unread + officialUnread + personalUnread > 9
                ? `9+`
                : unread + officialUnread + personalUnread}
            </span>
          )}
          <i className={`bi bi-bell text-lg`}></i>
        </Link>
        <div className="headerCircle">
          <i className="bi bi-search text-lg"></i>
        </div>
      </div>
    </>
  )
}
