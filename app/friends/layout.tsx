'use client'
import '../../styles/team/team.css'
import '../../styles/users/main.css'
import '../../styles/users/onboard.css'
import UserResponse from '../../components/Messages/UserResponse'
import UserAlert from '@/components/Messages/UserAlert'
import { useEffect, useRef } from 'react'
import AsideFriends from '@/components/Home/Navigation/AsideFriends'
import VerticalNavigation from '@/components/Home/Navigation/VerticalNavigation'
import { NavStore } from '@/src/zustand/notification/Navigation'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { setShowHeader } = NavStore()
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const lastScrollY = useRef(0)
  const isOutOfView = useRef(false)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const currentScrollY = container.scrollTop

      if (currentScrollY > lastScrollY.current && lastScrollY.current > 100) {
        setShowHeader(false)
        isOutOfView.current = true
      } else if (currentScrollY < lastScrollY.current && isOutOfView.current) {
        setShowHeader(true)
        isOutOfView.current = false
      }

      lastScrollY.current = currentScrollY
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <>
      <UserResponse />
      <UserAlert />

      <div className=" w-full flex justify-center">
        <div className="custom_container">
          <div className="flex w-full">
            <VerticalNavigation />

            <div className="flex-1 overflow-x-auto h-[100vh] sm:ml-5 md:mr-5 flex flex-col">
              <div className={`flex flex-col flex-1 w-full`}>{children}</div>
            </div>
            <AsideFriends />
          </div>
        </div>
      </div>
    </>
  )
}
