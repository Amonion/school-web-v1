'use client'
import '../../styles/team/team.css'
import '../../styles/users/main.css'
import '../../styles/utility.css'
import UserResponse from '../../components/Messages/UserResponse'
import UserAlert from '@/components/Messages/UserAlert'
import UtilityNavigation from '@/components/Utility/Navigation/UtilityNavigation'
import UtilityMainHeader from '@/components/Utility/Navigation/MainHeader'
import { useEffect, useState } from 'react'
import MobileNav from '@/components/Home/Navigation/MobileNav'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import TransactionStore from '@/src/zustand/finance/Transaction'
import { NavStore } from '@/src/zustand/notification/Navigation'

export default function UtilityLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user } = AuthStore()
  const { walletForm, getAWallet, getTransactions } = TransactionStore()
  const { headerHeight } = NavStore()
  const [isMd, setIsMd] = useState(false)

  useEffect(() => {
    if (user && walletForm._id === '') {
      getAWallet(`/transactions/wallets/?userId=${user._id}`)
    }
  }, [user, walletForm])

  useEffect(() => {
    if (user) {
      getTransactions(
        `/transactions/?username=${user.username}&ordering=-createdAt`
      )
    }
  }, [user])

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
            <UtilityNavigation />

            <div className="flex-1 pb-[55px] overflow-x-auto md:overflow-visible md:pb-5 relative md:pl-5 sm:pr-0 flex flex-col">
              <UtilityMainHeader />

              <div
                style={{
                  marginTop: isMd ? 0 : `${headerHeight}px`,
                  minHeight: `calc(100vh - ${headerHeight}px)`,
                }}
                className={`pt-5 flex flex-col flex-1`}
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
