'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import FriendStore from '@/src/zustand/chat/Friend'
import { useTheme } from '@/context/ThemeProvider'
import { useEffect, useState } from 'react'
import { NavStore } from '@/src/zustand/notification/Navigation'

export default function MobileNav() {
  const { isMobileFriends, setMobileFriends } = NavStore()
  const pathname = usePathname()
  const { theme } = useTheme()
  const [unread, setUnread] = useState(0)
  const { friendsResults } = FriendStore()

  useEffect(() => {
    setUnread(0)
    for (let i = 0; i < friendsResults.length; i++) {
      const el = friendsResults[i]
      setUnread((prev) => {
        return prev + Number(el.totalUnread)
      })
    }
  }, [friendsResults])

  return (
    <>
      {pathname !== '/home/posts/create-post' && (
        <div className="border-t-2 h-[55px] border-t-[var(--border-color)] flex bg-[var(--white)] justify-between items-center py-2 px-2 fixed bottom-0 w-full left-0 z-50 sm:hidden">
          {pathname === '/home' ? (
            <div className="mobile_navs">
              <i
                onClick={() => {
                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                  })
                }}
                className={`bi bi-house text-lg ${
                  !pathname.includes('question') &&
                  !pathname.includes('friends')
                    ? 'text-[var(--custom)]'
                    : 'text-[var(--text-primary)]'
                }`}
              ></i>
            </div>
          ) : (
            <Link href={`/home`} className="mobile_navs">
              <i
                className={`bi bi-house text-lg ${
                  !pathname.includes('question') &&
                  !pathname.includes('friends')
                    ? 'text-[var(--custom)]'
                    : 'text-[var(--text-primary)]'
                }`}
              ></i>
            </Link>
          )}
          {/* <span className="mobile_navs">
        <i className="bi bi-camera-video text-lg text-[var(--text-primary)]"></i>
      </span> */}
          <Link href={`/home/questions`} className="mobile_navs">
            <Image
              style={{ height: 'auto' }}
              src={`${
                pathname.includes('question')
                  ? '/images/active-icon.png'
                  : theme === 'dark'
                  ? '/images/dark-icon.png'
                  : '/images/light-icon.png'
              }`}
              loading="lazy"
              sizes="100vw"
              className="w-7"
              width={0}
              height={0}
              alt="Schooling Social Logo"
            />
          </Link>
          {/* <span className="mobile_navs">
        <i className="bi bi-music-note-beamed text-lg text-[var(--text-primary)]"></i>
      </span> */}
          <div
            onClick={() => setMobileFriends(!isMobileFriends)}
            className="mobile_navs"
          >
            {unread > 0 && (
              <div
                className={`${
                  unread >= 100
                    ? 'w-[20px] h-[20px] text-[10px]'
                    : 'w-[15px] h-[15px] text-[12px]'
                } flex items-center  text-white absolute right-0 top-0 z-30 justify-center rounded-full bg-[var(--custom)]`}
              >
                {unread >= 100 ? '99+' : unread}
              </div>
            )}
            <i
              className={`bi bi-people text-lg ${
                pathname.includes('/home/friends')
                  ? 'text-[var(--custom)]'
                  : 'text-[var(--text-primary)]'
              }`}
            ></i>
          </div>
        </div>
      )}
    </>
  )
}
