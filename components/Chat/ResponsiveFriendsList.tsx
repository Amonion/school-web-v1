'use client'

import { NavStore } from '@/src/zustand/notification/Navigation'
import FriendsListBody from './FriendsListBody'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ResponsiveFriendsList() {
  const { isMobileFriends, setMobileFriends } = NavStore()
  const pathname = usePathname()

  useEffect(() => {
    setMobileFriends(false)
  }, [pathname])
  return (
    <>
      <div
        onClick={() => setMobileFriends(false)}
        className={`${
          isMobileFriends ? 'fixed right-0 top-0 md:hidden' : 'hidden'
        } w-full flex justify-center z-40 `}
      >
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          className="custom_container"
        >
          <div className="flex w-full">
            <div className="hidden sm:block">
              <div className=" v_nav nav" />
            </div>

            <div className="flex-1 bg-[var(--secondary)] p-3 overflow-auto sm:ml-5 md:mr-5 flex flex-col">
              <FriendsListBody />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
