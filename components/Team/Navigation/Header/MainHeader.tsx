import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Megaphone } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { NavStore } from '@/src/zustand/notification/Navigation'

export default function MainHeader() {
  const router = useRouter()
  const { toggleVNav, setHeaderHeight } = NavStore()

  const [showHeader, setShowHeader] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isOutOfView, setIsOutOfView] = useState(false)
  const divRef = useRef<HTMLDivElement | null>(null)

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
    // <div
    //   ref={divRef}
    //   className="w-full flex z-30 border-b border-b-[var(--border)] sticky top-0 justify-center bg-[var(--white)] py-2"
    // >

    <div
      ref={divRef}
      className={`w-full flex fixed md:sticky top-0 left-0 justify-center transition-transform duration-300 ease-in-out ${
        showHeader ? 'translate-y-0' : '-translate-y-full sm:-translate-y-0'
      } bg-[var(--white)] py-2 z-40 border-b border-[var(--border-color)]`}
    >
      <div className="custom_container">
        <div className="flex relative">
          <div onClick={() => router.back()} className="headerCircle top">
            <i className="bi bi-arrow-left common-icon"></i>
          </div>
          <span onClick={toggleVNav} className="headerCircle hfs">
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

          <Link href={'/team/ads'} className="headerCircle">
            <Megaphone className="m" />
          </Link>
          <Link href="/home/notifications" className="headerCircle">
            {/* {unread > 0 && (
              <span className="dot_notification">
                {unread > 9 ? '9+' : unread}
              </span>
            )} */}
            <i className="bi bi-bell common-icon"></i>
          </Link>
        </div>
      </div>
    </div>
  )
}
