import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSwipeable } from 'react-swipeable'
import ThemeToggle from '@/components/Home/Navigation/ThemeToggle'
import { NavStore } from '@/src/zustand/notification/Navigation'
import { AuthStore } from '@/src/zustand/user/AuthStore'

export default function VerticalNavigation() {
  const router = useRouter()
  const [isUsers, setUsers] = useState(false)
  const [isSchool, setSchool] = useState(false)
  const [isPlace, togglePlace] = useState(false)
  const [isMsgActive, toggleMessages] = useState(false)
  const [isCompetition, toggleCompetition] = useState(false)
  const [isSettingsActive, toggleSettings] = useState(false)
  const pathname = usePathname()
  const { toggleVNav, vNav, clearNav } = NavStore()
  const { user } = AuthStore()

  const offStates = () => {
    setSchool(false)
    toggleMessages(false)
    toggleCompetition(false)
    toggleSettings(false)
    togglePlace(false)
    setUsers(false)
    clearNav()
  }

  useEffect(() => {
    // loadUserFromStorage();
    offStates()
  }, [router, pathname])

  const handlers = useSwipeable({
    onSwipedLeft: toggleVNav,
  })

  return (
    <div
      onClick={toggleVNav}
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
        <div className="flex items-start pt-2">
          {user && user.picture && (
            <Image
              className="object-cover rounded-full mr-2"
              src={String(user.picture)}
              loading="lazy"
              alt="username"
              sizes="100vw"
              height={0}
              width={0}
              style={{ height: '50px', width: '50px' }}
            />
          )}
          <div>
            <div className="text-lg mb-1">Welcome back</div>
            <div className="text-[var(--custom)]"> {`@${user?.username}`}</div>
          </div>
        </div>

        <div className="flex py-1">{user?.staffPositions}</div>

        <div className="mt-4">
          <Link className="v_nav_items block" href="/team">
            <i className="bi bi-speedometer2 mr-3"></i>
            Dashboard
          </Link>

          {/* {(user?.staffPositions.includes('users') ||
            user?.staffPositions.includes('General')) && (
            <Link className="v_nav_items py-2 block" href="/team/users">
              <i className="bi bi-people mr-3"></i>
              Users
            </Link>
          )} */}

          {(user?.staffPositions.includes('users') ||
            user?.staffPositions.includes('General')) && (
            <div className={`v_nav_items ${isUsers ? 'active two' : ''}`}>
              <div
                className="flex cursor-pointer items-center py-2"
                onClick={() => setUsers((e) => !e)}
              >
                <i className="bi bi-people mr-3"></i>
                Users
                <i
                  className={`bi bi-caret-down-fill ml-auto ${
                    isUsers ? 'active' : ''
                  }`}
                ></i>
              </div>
              <div className="nav_dropdown">
                <Link className="inner_nav_items" href="/team/users/accounts">
                  Accounts
                </Link>
                <Link className="inner_nav_items" href="/team/users">
                  Persons
                </Link>
              </div>
            </div>
          )}

          {(user?.staffPositions.includes('schools') ||
            user?.staffPositions.includes('General')) && (
            <div className={`v_nav_items ${isSchool ? 'active two' : ''}`}>
              <div
                className="flex cursor-pointer items-center py-2"
                onClick={() => setSchool((e) => !e)}
              >
                <i className="bi bi-bank mr-3"></i>
                Schools
                <i
                  className={`bi bi-caret-down-fill ml-auto ${
                    isSchool ? 'active' : ''
                  }`}
                ></i>
              </div>
              <div className="nav_dropdown">
                <Link className="inner_nav_items" href="/team/schools/">
                  School Stats
                </Link>
                <Link className="inner_nav_items" href="/team/schools/table">
                  Schools Table
                </Link>
              </div>
            </div>
          )}

          <div className={`v_nav_items ${isPlace ? 'active two' : ''}`}>
            <div
              className="flex cursor-pointer items-center py-2"
              onClick={() => togglePlace((e) => !e)}
            >
              <Link className="block" href="/team/places/1">
                <i className="bi bi-globe-americas mr-3"></i>
                Places
              </Link>
              <i
                className={`bi bi-caret-down-fill ml-auto ${
                  isPlace ? 'active' : ''
                }`}
              ></i>
            </div>
            <div className="nav_dropdown">
              <Link className="inner_nav_items" href="/team/places/ads">
                Ads
              </Link>
              <Link className="inner_nav_items" href="/team/schools/table">
                Schools Table
              </Link>
            </div>
          </div>

          <Link className="v_nav_items py-2 block" href="/team/policy">
            <i className="bi bi-globe-americas mr-3"></i>
            Policy
          </Link>

          <Link className="v_nav_items py-2 block" href="/team/news">
            <i className="bi bi-people mr-3"></i>
            News
          </Link>

          <div className={`v_nav_items ${isCompetition ? 'active trip' : ''}`}>
            <div
              className="flex cursor-pointer items-center py-2"
              onClick={() => toggleCompetition((e) => !e)}
            >
              <i className="bi bi-trophy mr-3"></i>
              Competitions
              <i
                className={`bi bi-caret-down-fill ml-auto ${
                  isCompetition ? 'active' : ''
                }`}
              ></i>
            </div>
            <div className="nav_dropdown">
              <Link
                className="inner_nav_items"
                href="/team/competitions/weekends"
              >
                Weekends
              </Link>
              <Link
                className="inner_nav_items"
                href="/team/competitions/leagues"
              >
                Leagues
              </Link>
              <Link className="inner_nav_items" href="/team/competitions/exams">
                Exams
              </Link>
            </div>
          </div>

          <div className={`v_nav_items ${isMsgActive ? 'active trip' : ''}`}>
            <div
              className="flex cursor-pointer items-center py-2"
              onClick={() => toggleMessages((e) => !e)}
            >
              <i className="bi bi-envelope mr-3"></i>
              Messages
              <i
                className={`bi bi-caret-down-fill ml-auto ${
                  isMsgActive ? 'active' : ''
                }`}
              ></i>
            </div>
            <div className="nav_dropdown">
              <Link className="inner_nav_items" href="/team/messages/emails">
                Emails
              </Link>
              <Link
                className="inner_nav_items"
                href="/team/messages/notifications"
              >
                Notifications
              </Link>
              <Link className="inner_nav_items" href="/team/messages/sms">
                SMS
              </Link>
            </div>
          </div>

          <div className={`v_nav_items ${isSettingsActive ? 'active' : ''}`}>
            <div
              onClick={() => toggleSettings((e) => !e)}
              className="flex cursor-pointer items-center py-2"
            >
              <i className="bi bi-diagram-3 mr-3"></i>
              Company
              <i
                className={`bi bi-caret-down-fill ml-auto ${
                  isSettingsActive ? 'active' : ''
                }`}
              ></i>
            </div>
            <div className="nav_dropdown">
              <Link className="inner_nav_items" href="/team/company/staffs">
                Staffs
              </Link>
              <Link
                className="inner_nav_items"
                href="/team/company/set-company"
              >
                Set Company
              </Link>
              <Link className="inner_nav_items" href="/team/company/expenses">
                Expenses
              </Link>
              <Link className="inner_nav_items" href="/team/company">
                Branches
              </Link>
            </div>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </div>
  )
}
