import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { NavStore } from '@/src/zustand/notification/Navigation'
import Link from 'next/link'
import Image from 'next/image'
import { UserNotificationStore } from '@/src/zustand/notification/UserNotification'

export default function NewsHeader() {
  const { setHeaderHeight } = NavStore()
  const pathname = usePathname()
  const divRef = useRef<HTMLDivElement | null>(null)
  const [showHeader, setShowHeader] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isOutOfView, setIsOutOfView] = useState(false)
  const { toggleVNav } = NavStore()
  const router = useRouter()
  const { unread, personalUnread, officialUnread } = UserNotificationStore()

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
            <div className="flex-1 py-2 overflow-x-auto sm:overflow-hidden border-b border-b-[var(--border)] relative sm:ml-5 md:mr-5  bg-[var(--primary)]">
              <div className="flex items-center relative">
                <div className="headerCircle hfs">
                  <i
                    onClick={toggleVNav}
                    className="bi bi-text-left text-lg"
                  ></i>
                </div>
                <div onClick={() => router.back()} className="headerCircle">
                  <i className="bi bi-arrow-left text-lg"></i>
                </div>

                <Link
                  href="/home/questions/"
                  className="mx-auto absoluteCenter hidden sm:block"
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
                </Link>
                <div className="mx-auto block absoluteCenter cursor-pointer sm:hidden">
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
                <div className="ml-auto" />
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
                <div className="headerCircle hfm">
                  <i className="bi bi-search text-lg"></i>
                </div>
              </div>
            </div>
            <div className="md:right-0 z-0 w-0 md:min-w-[270px] md:w-[270px] xl:w-[300px]" />
          </div>
        </div>
      </div>
    </>
  )
}
