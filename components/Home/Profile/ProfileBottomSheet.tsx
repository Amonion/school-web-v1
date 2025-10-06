'use client'
import { UserStore } from '@/src/zustand/user/User'
import Link from 'next/link'

const ProfileBottomSheet = () => {
  const { showProfileSheet, setShowProfileSheet } = UserStore()

  return (
    <>
      <div
        className={`${
          showProfileSheet ? 'absolute ' : 'overflow-hidden relative'
        } flex flex-col flex-1 bottom-[55px] sm:bottom-0  left-0 w-full`}
      >
        <div
          className={`bg-[var(--secondary)] flex flex-col w-full commentScrollbar rounded-tl-[15px] rounded-tr-[15px] absolute bottom-0 left-0 max-h-[50vh]
    transition-transform duration-300 ease-in-out ${
      showProfileSheet ? 'translate-y-0 overflow-hidden' : 'translate-y-full'
    }`}
        >
          <div
            onClick={() => setShowProfileSheet(!showProfileSheet)}
            className="w-full z-20 sticky top-0 left-0 flex flex-col px-3 py-5 rounded-tl-[15px] rounded-tr-[15px] bg-[var(--white)] border border-[var(--border)]"
          >
            <div className="h-2 bg-[var(--border)] w-[70px] mx-auto rounded-[10px] cursor-pointer"></div>
          </div>
          <Link
            href={`/home/profile/followers`}
            className="py-4 flex px-2 items-center border-b border-b-[var(--border)]"
          >
            <i className="bi bi-people mr-4 text-xl"></i>
            Account Followers
          </Link>
          <Link
            href={`/home/profile/followings`}
            className="py-4 flex px-2 items-center border-b border-b-[var(--border)]"
          >
            <i className="bi bi-person-plus mr-4 text-xl"></i>
            Account Followings
          </Link>
          <Link
            href={`/home/profile/muted-users`}
            className="py-4 flex px-2 items-center border-b border-b-[var(--border)]"
          >
            <i className="bi bi-person-dash mr-4 text-xl"></i>
            Muted Accounts
          </Link>
          <Link
            href={`/home/profile/blocked-users`}
            className="py-4 flex px-2 items-center border-b border-b-[var(--border)]"
          >
            <i className="bi bi-person-slash mr-4 text-xl"></i>
            Blocked Accounts
          </Link>
        </div>
      </div>
    </>
  )
}

export default ProfileBottomSheet
