'use client'
import '../../styles/team/team.css'
import '../../styles/users/main.css'
import '../../styles/users/onboard.css'
import UserResponse from '../../components/Messages/UserResponse'
import UserAlert from '@/components/Messages/UserAlert'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import VerticalNavigation from '@/components/Home/Navigation/VerticalNavigation'
import { NavStore } from '@/src/zustand/notification/Navigation'
import MobileNav from '@/components/Home/Navigation/MobileNav'
import CommentBottomSheet from '@/components/Home/Comment/CommentBottomSheet'
import AsideNews from '@/components/News/Navigation/AsideNews'
import NewsHeader from '@/components/News/Navigation/NewsHeader'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { headerHeight, setShowHeader, setHeaderHeight } = NavStore()
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const lastScrollY = useRef(0)
  const isOutOfView = useRef(false)
  // const [isMd, setIsMd] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const currentScrollY = container.scrollTop

      if (currentScrollY > lastScrollY.current && lastScrollY.current > 100) {
        // Scrolling down
        setShowHeader(false)
        isOutOfView.current = true
      } else if (currentScrollY < lastScrollY.current && isOutOfView.current) {
        // Scrolling up
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
    if (pathname.includes('/home/friends')) {
      setHeaderHeight(0)
    }
    const media = window.matchMedia('(min-width: 767px)')
    // setIsMd(media.matches)

    const handler = (e: MediaQueryListEvent) => console.log(e.matches)
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
              <NewsHeader />

              <div
                style={{
                  marginTop: `${headerHeight}px`,
                  minHeight: `calc(100vh - ${headerHeight}px)`,
                }}
                className={`flex flex-col pb-[55px] sm:pb-0 flex-1 w-full`}
              >
                {children}
              </div>
            </div>
            <AsideNews />
          </div>
        </div>
      </div>
      <MobileNav />
    </>
  )
}
