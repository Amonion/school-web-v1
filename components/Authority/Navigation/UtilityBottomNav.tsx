'use client'
import FriendStore from '@/src/zustand/chat/Friend'
import Link from 'next/link'

export default function UtilityBottomNav() {
  const { totalUnread } = FriendStore()

  return (
    <div className="border-t-2 h-[55px] border-t-[var(--border-color)] flex bg-[var(--white)] justify-between items-center py-2 px-2 fixed bottom-0 w-full left-0 z-20 md:hidden">
      <Link href={`/home/`} className="mobile_navs">
        <i className="bi bi-house-door text-lg text-[var(--text-primary)]"></i>
      </Link>
      {/* <span className="mobile_navs">
        <i className="bi bi-camera-video text-lg text-[var(--text-primary)]"></i>
      </span> */}
      <span className="mobile_navs">
        <i className="bi bi-shop-window text-lg text-[var(--text-primary)]"></i>
      </span>
      {/* <span className="mobile_navs">
        <i className="bi bi-music-note-beamed text-lg text-[var(--text-primary)]"></i>
      </span> */}
      <Link href={`/home/chat/`} className="mobile_navs">
        {totalUnread > 0 && (
          <span className="dot_notification">
            {totalUnread > 9 ? `9+` : totalUnread}{' '}
          </span>
        )}
        <i className="bi bi-people text-lg text-[var(--text-primary)]"></i>
      </Link>
    </div>
  )
}
