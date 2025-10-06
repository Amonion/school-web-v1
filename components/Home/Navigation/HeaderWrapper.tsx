import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { MessageStore } from '@/src/zustand/notification/Message'
import { UserNotificationStore } from '@/src/zustand/notification/UserNotification'
import { NavStore } from '@/src/zustand/notification/Navigation'
import { PostStore } from '@/src/zustand/post/Post'

export default function HeaderWrapper() {
  const { unread, personalUnread, officialUnread } = UserNotificationStore()
  const { user } = AuthStore()
  const { setMessage } = MessageStore()
  const {
    setHeaderHeight,
    toggleVNav,
    togglePostBox,
    toggleAsideVNav,
    setScrollUp,
  } = NavStore()
  const { getPosts, page_size } = PostStore()
  const pathname = usePathname()
  const router = useRouter()
  const divRef = useRef<HTMLDivElement | null>(null)
  const [showHeader, setShowHeader] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isOutOfView, setIsOutOfView] = useState(false)
  const [sort] = useState('-createdAt')

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (divRef.current) {
        const height = divRef.current.getBoundingClientRect().height
        setHeaderHeight(pathname.includes('/home/friends') ? 0 : height)
      }
    }

    updateHeaderHeight()
    window.addEventListener('resize', updateHeaderHeight)
    return () => window.removeEventListener('resize', updateHeaderHeight)
  }, [pathname])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && lastScrollY > 100) {
        setShowHeader(false)
        setIsOutOfView(true)
      } else if (currentScrollY < lastScrollY && isOutOfView) {
        setShowHeader(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY, isOutOfView])

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
    <>
      <div
        ref={divRef}
        className={`w-full flex fixed top-0 z-40 sm:z-30 left-0 justify-center transition-transform duration-300 ease-in-out ${
          showHeader ? 'translate-y-0' : '-translate-y-full sm:-translate-y-0'
        }  `}
      >
        <div className="custom_container">
          <div className="w-full flex">
            <div className="sm:w-[270px] sm:min-w-[270px] xl:w-[300px] w-0" />

            <div className="flex-1 py-3 overflow-x-auto sm:overflow-hidden border-b border-b-[var(--border)] relative sm:ml-5 md:mr-5  bg-[var(--primary)] flex">
              <span onClick={toggleVNav} className="headerCircle hfs">
                <i className="bi bi-text-left text-lg text-[var(--text-primary)]"></i>
              </span>
              <>
                {pathname !== '/home' ? (
                  <div onClick={router.back} className="headerCircle">
                    <i className="bi bi-arrow-left common-icon"></i>
                  </div>
                ) : (
                  <div onClick={togglePostBox} className="headerCircle sfs">
                    <i className="bi bi-pen common-icon"></i>
                  </div>
                )}
              </>

              {pathname === '/home' && (
                <Link href={`/home/following`} className="headerCircle">
                  <i className={`bi bi-megaphone common-icon`}></i>
                </Link>
              )}
              <div className="mr-auto" />
              <Link
                href="/home/questions/"
                className="mx-auto absoluteCenter hidden sm:block"
              >
                <Image
                  style={{ height: 'auto' }}
                  src="/images/cap.png"
                  loading="lazy"
                  sizes="100vw"
                  className="w-12"
                  width={0}
                  height={0}
                  alt="Schooling Social Logo"
                />
              </Link>
              <div
                onClick={refresh}
                className="mx-auto block absoluteCenter cursor-pointer sm:hidden"
              >
                <Image
                  style={{ height: 'auto' }}
                  src="/images/cap.png"
                  loading="lazy"
                  sizes="100vw"
                  className="w-14"
                  width={0}
                  height={0}
                  alt="Schooling Social Logo"
                />
              </div>

              <Link href="/home/notifications" className="headerCircle hfssfm">
                {unread + officialUnread + personalUnread > 0 && (
                  <span className="dot_notification">
                    {unread + officialUnread + personalUnread > 9
                      ? `9+`
                      : unread + officialUnread + personalUnread}
                  </span>
                )}
                <i className="bi bi-bell common-icon "></i>
              </Link>

              <div className="headerCircle sfshfm" onClick={toggleAsideVNav}>
                <i className="bi bi-people"></i>
              </div>
              <Link href="/home/trace" className="headerCircle">
                <i className="bi bi-search common-icon "></i>
              </Link>
            </div>
            <div className="md:right-0 z-0 w-0 md:min-w-[270px] md:w-[270px] xl:w-[300px]" />
          </div>
        </div>
      </div>
    </>
  )
}
