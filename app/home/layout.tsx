'use client'
import '../../styles/team/team.css'
import '../../styles/users/main.css'
import '../../styles/users/onboard.css'
import UserResponse from '../../components/Messages/UserResponse'
import UserAlert from '@/components/Messages/UserAlert'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import AsideFriends from '@/components/Home/Navigation/AsideFriends'
import VerticalNavigation from '@/components/Home/Navigation/VerticalNavigation'
import { NavStore } from '@/src/zustand/notification/Navigation'
import MainHeader from '@/components/Home/Navigation/MainHeader'
import MobileNav from '@/components/Home/Navigation/MobileNav'
import CommentBottomSheet from '@/components/Home/Comment/CommentBottomSheet'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { MomentStore } from '@/src/zustand/post/Moment'
import { MessageStore } from '@/src/zustand/notification/Message'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { headerHeight, setShowHeader, setHeaderHeight } = NavStore()
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const lastScrollY = useRef(0)
  const { getMoments } = MomentStore()
  const isOutOfView = useRef(false)
  const { user } = AuthStore()
  const { setMessage } = MessageStore()
  // const [isMd, setIsMd] = useState(false)
  const pathname = usePathname()

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

  useEffect(() => {
    if (user) {
      getMoments(
        `/posts/moments/?myId=${
          user._id
        }&page_size=20&page=${1}&ordering=-createdAt`,
        setMessage
      )
    }
  }, [user])

  useEffect(() => {
    if (pathname.includes('/home/friends')) {
      setHeaderHeight(0)
    }
    const media = window.matchMedia('(min-width: 767px)')
    // setIsMd(media.matches)

    const handler = (e: MediaQueryListEvent) => {
      if (e) {
      }
    }
    media.addEventListener('change', handler)

    return () => media.removeEventListener('change', handler)
  }, [pathname])
  return (
    <>
      <UserResponse />
      <UserAlert />
      <CommentBottomSheet />

      <div className=" w-full flex justify-center">
        <div className="custom_container">
          <div className="flex w-full">
            <VerticalNavigation />

            <div className="flex-1 overflow-x-auto sm:overflow-hidden relative sm:ml-5 md:mr-5 flex flex-col">
              <MainHeader />

              <div
                style={{
                  marginTop: `${headerHeight}px`,
                  minHeight: `calc(100vh - ${headerHeight}px)`,
                }}
                className={`flex flex-col flex-1 w-full`}
              >
                {children}
              </div>
            </div>
            <AsideFriends />
          </div>
        </div>
      </div>
      <MobileNav />
    </>
  )
}
