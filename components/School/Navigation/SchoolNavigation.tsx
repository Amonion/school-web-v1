import Image from 'next/image'
import { useSwipeable } from 'react-swipeable'
import { NavStore } from '@/src/zustand/notification/Navigation'
import ThemeToggle from '@/components/Home/Navigation/ThemeToggle'
import VNavHeader from './VNavHeader'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { useTheme } from '@/context/ThemeProvider'
import OwnerNavigation from './OwnerNavigation'
import StaffNavigation from './StaffNavigation'

export default function SchoolNavigation() {
  const { bioUserState } = AuthStore()
  const { theme } = useTheme()
  const { toggleVNav, vNav } = NavStore()

  const handlers = useSwipeable({
    onSwipedLeft: toggleVNav,
  })
  return (
    <div
      style={{}}
      onClick={toggleVNav}
      className={` ${
        vNav ? 'left-0' : 'left-[-100%]'
      } verticalNavigationWrapper`}
    >
      <div
        onClick={(e) => {
          e.stopPropagation()
        }}
        {...handlers}
        className="v_nav_card nav"
      >
        <VNavHeader />

        {bioUserState && bioUserState.activeOffice.position !== 'Unknown' ? (
          <>
            {bioUserState.activeOffice.position === 'Owner' ? (
              <OwnerNavigation />
            ) : (
              <StaffNavigation />
            )}
          </>
        ) : (
          <Image
            className={`object-contain w-full`}
            src={
              theme === 'dark'
                ? '/images/PostAdDark.png'
                : '/images/PostAdLight.png'
            }
            loading="lazy"
            alt="username"
            sizes="100vw"
            height={0}
            width={0}
            style={{ height: 'auto', width: 'auto' }}
          />
        )}

        <ThemeToggle />
      </div>
    </div>
  )
}
