import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useSwipeable } from 'react-swipeable'
import ThemeToggle from './ThemeToggle'
import { NavStore } from '@/src/zustand/notification/Navigation'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import VNavHeader from './VNavHeader'

export default function VerticalNavigation() {
  const router = useRouter()

  const pathname = usePathname()
  const { toggleVNav, vNav, clearNav } = NavStore()
  const { user, bioUserState } = AuthStore()

  useEffect(() => {
    clearNav()
  }, [router, pathname])

  const handlers = useSwipeable({
    onSwipedLeft: toggleVNav,
  })
  return (
    <div
      onClick={toggleVNav}
      className={` ${vNav ? 'left-0' : 'left-[-100%]'} v_nav nav`}
    >
      <div
        onClick={(e) => {
          e.stopPropagation()
        }}
        {...handlers}
        className="v_nav_card nav"
      >
        <VNavHeader />

        <div className="mt-5 mb-auto">
          <Link
            className={`v_nav_items_user ${
              pathname === '/home' ? 'text-[var(--custom)]' : ''
            } block`}
            href="/home"
          >
            <i className="bi bi-house mr-3"></i>
            Home
          </Link>
          <Link
            className={`v_nav_items_user ${
              pathname === `/home/profile/${user?.username}`
                ? 'text-[var(--custom)]'
                : ''
            } block`}
            href={`/home/profile/${user?.username}`}
          >
            <div className="flex cursor-pointer items-center py-2">
              <i className="bi bi-person-circle mr-3"></i>
              Profile
            </div>
          </Link>
          <Link
            className={`v_nav_items_user ${
              pathname === '/home/posts/bookmarks' ? 'text-[var(--custom)]' : ''
            } block`}
            href={`/home/posts/bookmarks`}
          >
            <div className="flex cursor-pointer items-center py-2">
              <i className="bi bi-bookmark mr-3"></i>
              Bookmarks
            </div>
          </Link>
          {/* <i
            className={`bi bi-bookmark-fill text-[var(--custom-color)] scale-125 post_icon text-[16px] transition-transform duration-300`}
          ></i> */}
          {/* <Link
            className="v_nav_items_user block"
            href={`/home/profile/${user?._id}`}
          >
            <div className="flex cursor-pointer items-center py-2">
              <i className="bi bi-file-text mr-3"></i>
              Results
            </div>
          </Link> */}
          <Link
            className={`v_nav_items_user ${
              pathname.includes('/home/verification')
                ? 'text-[var(--custom)]'
                : ''
            } block`}
            href={`/home/verification`}
          >
            <div className="flex cursor-pointer items-center py-2">
              <i className="bi bi-shield-check mr-3"></i>
              Verification
              {bioUserState?.isVerified ? (
                <i className="bi bi-patch-check text-[var(--success)] ml-auto"></i>
              ) : (
                <i className="bi bi-question-circle text-red-600 ml-auto"></i>
              )}
            </div>
          </Link>
          <Link
            className={`v_nav_items_user ${
              pathname.includes('/home/notifications')
                ? 'text-[var(--custom)]'
                : ''
            } block`}
            href={`/home/notifications`}
          >
            <div className="flex cursor-pointer items-center py-2">
              <i className="bi bi-bell mr-3"></i>
              Notification
            </div>
          </Link>

          <Link
            className={`v_nav_items_user ${
              pathname.includes('/home/settings') ? 'text-[var(--custom)]' : ''
            } block`}
            href="/home/settings"
          >
            <div className="flex cursor-pointer items-center py-2">
              <i className="bi bi-gear mr-3"></i>
              Settings
            </div>
          </Link>
          {user?.status === 'Staff' && (
            <Link className="nav-items block" href="/team">
              <i className="bi bi-diagram-3 mr-3"></i>
              Staff
            </Link>
          )}
        </div>
        <ThemeToggle />
      </div>
    </div>
  )
}
