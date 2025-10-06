'use client'
import '../../styles/team/team.css'
import '../../styles/users/main.css'
import '../../styles/utility.css'
import UserResponse from '../../components/Messages/UserResponse'
import UserAlert from '@/components/Messages/UserAlert'
import { useEffect, useState } from 'react'
import MobileNav from '@/components/Home/Navigation/MobileNav'
import { NavStore } from '@/src/zustand/notification/Navigation'
import SchoolNavigation from '@/components/School/Navigation/SchoolNavigation'
import SchoolMainHeader from '@/components/School/Navigation/SchoolMainHeader'
import { MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import OfficeStore from '@/src/zustand/utility/Office'
import SchoolStore from '@/src/zustand/school/School'

export default function SchoolLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { headerHeight } = NavStore()
  const [isMd, setIsMd] = useState(false)
  const { bioUserState, bioUser } = AuthStore()
  const { getOffice, officeForm } = OfficeStore()
  const { setMessage } = MessageStore()
  const { getSchool } = SchoolStore()
  useEffect(() => {
    if (bioUserState && bioUserState.activeOffice) {
      getOffice(
        `/offices/${bioUserState.activeOffice.username}?bioUserUsername=${bioUserState.bioUserUsername}`,
        setMessage
      )
    }
  }, [bioUser])

  useEffect(() => {
    if (officeForm.username) {
      getSchool(`/schools/${officeForm.username}`)
    }
  }, [officeForm])

  useEffect(() => {
    const media = window.matchMedia('(min-width: 991px)')
    setIsMd(media.matches)

    const handler = (e: MediaQueryListEvent) => setIsMd(e.matches)
    media.addEventListener('change', handler)

    return () => media.removeEventListener('change', handler)
  }, [])
  return (
    <>
      <UserResponse />
      <UserAlert />
      <div className="w-full utils flex justify-center sm:pb-0">
        <div className="custom_container">
          <div className="flex-col flex md:flex-row w-full ">
            <SchoolNavigation />

            <div className="flex-1 pb-[55px] overflow-x-auto md:overflow-visible sm:pb-5 relative md:pl-5 sm:pr-0 flex flex-col">
              <SchoolMainHeader />

              <div
                style={{
                  marginTop: isMd ? 0 : `${headerHeight}px`,
                  minHeight: `calc(100vh - ${headerHeight}px)`,
                }}
                className={`sm:pt-5 flex flex-col flex-1`}
              >
                {children}
              </div>
              {/* <div className={`pt-5 overflow-clip`}>{children}</div> */}
            </div>
          </div>
        </div>
      </div>
      <MobileNav />
    </>
  )
}
