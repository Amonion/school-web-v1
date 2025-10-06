import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import SchoolStore from '@/src/zustand/school/School'

export default function VNavigationRouter() {
  const { bioUserState } = AuthStore()
  const pathname = usePathname()
  const { unreadMessages, unreadNotifications, unreadStaffs, unreadStudents } =
    SchoolStore()

  return (
    <div className="flex mt-5 mb-4">
      <Link
        href="/home"
        className={`aside-nav ${pathname.includes('home') ? 'active' : ''}`}
      >
        Home
      </Link>
      <Link
        href="/utils"
        className={`aside-nav ${pathname.includes('utils') ? 'active' : ''}`}
      >
        Utils
      </Link>
      {Number(bioUserState?.offices.length) > 0 &&
        bioUserState?.activeOffice && (
          <Link
            href={`/${bioUserState?.activeOffice?.type.toLowerCase()}`}
            className={`aside-nav relative ${
              !pathname.includes('/utils') && !pathname.includes('/home')
                ? 'active'
                : ''
            }`}
          >
            {unreadStudents +
              unreadMessages +
              unreadNotifications +
              unreadStaffs >
              0 &&
              (pathname.includes('/home') || pathname.includes('/utils')) && (
                <span className="dot_notification">
                  {unreadStudents +
                    unreadMessages +
                    unreadNotifications +
                    unreadStaffs <
                  9
                    ? unreadStudents +
                      unreadMessages +
                      unreadNotifications +
                      unreadStaffs
                    : '9+'}
                </span>
              )}
            Office
          </Link>
        )}
    </div>
  )
}
