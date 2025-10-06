'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import FriendStore from '@/src/zustand/chat/Friend'
import { useTheme } from '@/context/ThemeProvider'

export default function MobileNav() {
  const pathname = usePathname()
  const { theme } = useTheme()

  // const [unread, setUnread] = useState(0);
  const { totalUnread } = FriendStore()

  return (
    <div className="border-t-2 h-[55px] border-t-[var(--border-color)] flex bg-[var(--white)] justify-between items-center py-2 px-2 fixed bottom-0 w-full left-0 z-20 sm:hidden">
      <Link href={`/home`} className="mobile_navs">
        <i
          className={`bi bi-house text-lg ${
            !pathname.includes('question') && !pathname.includes('friends')
              ? 'text-[var(--custom)]'
              : 'text-[var(--text-primary)]'
          }`}
        ></i>
      </Link>
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
      <Link href={`/home/friends/`} className="mobile_navs">
        {totalUnread > 0 && (
          <span className="dot_notification">
            {totalUnread > 9 ? `9+` : totalUnread}{' '}
          </span>
        )}
        <i
          className={`bi bi-people text-lg ${
            pathname.includes('/home/friends')
              ? 'text-[var(--custom)]'
              : 'text-[var(--text-primary)]'
          }`}
        ></i>
      </Link>
    </div>
  )
}
