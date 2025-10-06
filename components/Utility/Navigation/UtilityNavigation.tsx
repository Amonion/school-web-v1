import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import {
  Building2,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  Megaphone,
  UserPlus,
} from 'lucide-react'
import { NavStore } from '@/src/zustand/notification/Navigation'
import AdStore from '@/src/zustand/finance/Ad'
import VNavHeader from '@/components/Home/Navigation/VNavHeader'
import ThemeToggle from '@/components/Home/Navigation/ThemeToggle'

export default function UtilityNavigation() {
  const router = useRouter()
  const [isPayment, setPayment] = useState(false)
  const [isAd, setAd] = useState(false)
  const pathname = usePathname()
  const { toggleVNav, vNav, clearNav } = NavStore()
  const { draftAd, adStage } = AdStore()

  useEffect(() => {
    clearNav()
    setPayment(false)
    setAd(false)
  }, [router, pathname])

  const handlers = useSwipeable({
    onSwipedLeft: toggleVNav,
  })
  return (
    <div
      style={{}}
      onClick={toggleVNav}
      // className={` ${vNav ? 'left-0' : 'left-[-100%]'} v_nav nav`}
      className={` ${
        vNav ? 'left-0' : 'left-[-100%]'
      } md:border-r-0 md:w-[270px] overflow-auto fixed  h-[100vh] top-0 md:z-30 z-50 w-full flex transition-all  md:left-0 justify-start md:sticky`}
    >
      <div
        onClick={(e) => {
          e.stopPropagation()
        }}
        {...handlers}
        className="v_nav_card nav"
      >
        <VNavHeader />

        <div className="mt-4">
          <Link
            className={`v_nav_items_user block ${
              pathname === '/utils' ? 'visit' : ''
            }`}
            href="/utils"
          >
            <div className="flex cursor-pointer items-center py-2">
              <LayoutDashboard className="mr-3" />
              Utilities
            </div>
          </Link>

          {/* <Link
            className={`v_nav_items_user block ${
              pathname.includes('/ads') ? 'visit' : ''
            }`}
            href={`/utils/ads`}
          >
            <div className="flex cursor-pointer items-center py-2">
              <Megaphone className="mr-3" />
              Ads Placement
            </div>
          </Link> */}

          <div className={`utilNavDrop ${isAd ? 'active two' : ''}`}>
            <div className="flex v_nav_items_user items-center">
              <Link
                href={`/utils/ads`}
                className={`flex py-2 items-center ${
                  pathname.includes('/utils/ads') ? 'text-[var(--custom)]' : ''
                }`}
              >
                <Megaphone className="mr-3" />
                Ads Placement
              </Link>
              <i
                onClick={() => setAd((e) => !e)}
                className={`bi bi-caret-down-fill ml-auto cursor-pointer ${
                  isAd ? 'active' : ''
                }`}
              ></i>
            </div>
            <div className="nav_dropdown">
              {draftAd ? (
                <Link
                  href={
                    adStage === 3
                      ? `/utils/ads/ad-review`
                      : adStage === 2
                      ? `/utils/ads/ad-payment`
                      : `/utils/ads/create-ad-target`
                  }
                  className={`inner_nav_items`}
                >
                  Continue Ad
                </Link>
              ) : (
                <Link
                  href={`/utils/ads/create-ads`}
                  className={`inner_nav_items`}
                >
                  Create Ad
                </Link>
              )}
              <Link className="inner_nav_items" href="/team/schools/table">
                Ads Table
              </Link>
            </div>
          </div>

          <div className={`utilNavDrop ${isPayment ? 'active two' : ''}`}>
            <div className="flex v_nav_items_user items-center">
              <Link
                href={`/utils/payments`}
                className={`flex py-2 items-center ${
                  pathname.includes('/utils/payments')
                    ? 'text-[var(--custom)]'
                    : ''
                }`}
              >
                <CreditCard className="mr-3" />
                Payments
              </Link>
              <i
                onClick={() => setPayment((e) => !e)}
                className={`bi bi-caret-down-fill ml-auto cursor-pointer ${
                  isPayment ? 'active' : ''
                }`}
              ></i>
            </div>
            <div className="nav_dropdown">
              <Link className="inner_nav_items" href="/team/schools/">
                Available Payments
              </Link>
              <Link className="inner_nav_items" href="/team/schools/table">
                Transactions
              </Link>
            </div>
          </div>

          <Link
            className={`v_nav_items_user block`}
            href={`/home/notifications`}
          >
            <div className="flex cursor-pointer items-center py-2">
              <UserPlus className="mr-3" />
              Create Account
            </div>
          </Link>
          <Link
            className={`v_nav_items_user block ${
              pathname.includes('/utils/create-office') ? 'visit' : ''
            }`}
            href="/utils/create-office"
          >
            <div className="flex cursor-pointer items-center py-2">
              <Building2 className="mr-3" />
              Create Office
            </div>
          </Link>
          <Link
            className={`v_nav_items_user block ${
              pathname === '/utils/monetization' ? 'visit' : ''
            }`}
            href="/utils/monetization"
          >
            <div className="flex cursor-pointer items-center py-2">
              <DollarSign className="mr-3" />
              Monetize Account
            </div>
          </Link>
        </div>
        <ThemeToggle />
      </div>
    </div>
  )
}
