'use client'
import '../../styles/team/team.css'
import '../../styles/users/main.css'
import '../../styles/utility.css'
import VerticalNavigation from '@/components/Team/Navigation/VerticalNavigation'
import Response from '../../components/Messages/Response'
// import UploadFile from '@/components/Team/Upload'
import MainHeader from '@/components/Team/Navigation/Header/MainHeader'
import UserAlert from '@/components/Messages/UserAlert'
import { MessageStore } from '@/src/zustand/notification/Message'
import { NavStore } from '@/src/zustand/notification/Navigation'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // const { display } = uploadStore()
  const { message } = MessageStore()
  const { headerHeight, setHeaderHeight } = NavStore()
  const [isMd, setIsMd] = useState(false)
  const pathname = usePathname()
  useEffect(() => {
    if (pathname.includes('/home/friends')) {
      setHeaderHeight(0)
    }
    const media = window.matchMedia('(min-width: 990px)')
    setIsMd(media.matches)

    const handler = (e: MediaQueryListEvent) => setIsMd(e.matches)
    media.addEventListener('change', handler)

    return () => media.removeEventListener('change', handler)
  }, [pathname])

  return (
    <>
      {message !== null && <Response />}

      {/* {display && <UploadFile />} */}
      <UserAlert />

      <div className="body-content w-full flex justify-center">
        <div className="custom_container">
          <div className="flex w-full">
            <VerticalNavigation />
            <div className="flex-1 pb-[55px] md:pb-0 md:pl-5 overflow-x-auto md:overflow-visible">
              <MainHeader />
              {/* <div className="pt-5 flex-1"> */}
              <div
                style={{
                  marginTop: isMd ? 0 : `${headerHeight}px`,
                  minHeight: `calc(100vh - ${headerHeight}px)`,
                }}
                className={`md:pt-5   flex flex-col flex-1`}
              >
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
