import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { NavStore } from '@/src/zustand/notification/Navigation'
import SchoolStore from '@/src/zustand/school/School'
import { usePathname, useRouter } from 'next/navigation'

export default function SchoolMainHeader() {
  const { setHeaderHeight, toggleVNav } = NavStore()
  const { unreadMessages, unreadStaffs, unreadStudents, unreadNotifications } =
    SchoolStore()
  const [showHeader, setShowHeader] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isOutOfView, setIsOutOfView] = useState(false)
  const divRef = useRef<HTMLDivElement | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (divRef.current) {
      setHeaderHeight(divRef.current.offsetHeight)
    }
  }, [])

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
    <div
      ref={divRef}
      className={`w-full flex fixed md:sticky top-0 left-0 justify-center transition-transform duration-300 ease-in-out ${
        showHeader ? 'translate-y-0' : '-translate-y-full sm:-translate-y-0'
      } bg-[var(--white)] py-2 z-40 border-b border-[var(--border-color)]`}
    >
      <div className="custom_container">
        <div className="flex relative">
          {pathname !== '/school' && (
            <div onClick={router.back} className="headerCircle">
              <i className="bi bi-arrow-left common-icon"></i>
            </div>
          )}
          <span onClick={toggleVNav} className="headerCircle hfm">
            <i className="bi bi-text-left text-lg text-[var(--text-primary)]"></i>
          </span>

          <div className="mr-auto"></div>
          <Link href="/home/questions" className="block absoluteCenter">
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
          </Link>
          <Link href="/school/messages" className="headerCircle">
            {unreadNotifications +
              unreadStudents +
              unreadStaffs +
              unreadMessages >
              0 && (
              <span className="dot_notification">
                {unreadNotifications +
                  unreadStudents +
                  unreadStaffs +
                  unreadMessages >
                9
                  ? '9+'
                  : unreadNotifications +
                    unreadStudents +
                    unreadStaffs +
                    unreadMessages}
              </span>
            )}
            <i className="bi bi-bell common-icon"></i>
          </Link>
        </div>
      </div>
    </div>
  )
}
