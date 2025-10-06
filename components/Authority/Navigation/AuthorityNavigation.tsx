import { useSwipeable } from 'react-swipeable'
import { NavStore } from '@/src/zustand/notification/Navigation'
import ThemeToggle from '@/components/Home/Navigation/ThemeToggle'
import VNavHeader from './VNavHeader'
import Link from 'next/link'
import {
  BarChart,
  FileQuestion,
  GraduationCap,
  Layers,
  LayoutDashboard,
  MessageSquare,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import SchoolStore from '@/src/zustand/school/School'
import { useEffect, useState } from 'react'

export default function AuthorityNavigation() {
  const { toggleVNav, vNav } = NavStore()
  const pathname = usePathname()
  const { unreadMessages, unreadNotifications } = SchoolStore()
  const [isAcademicLevels, setAcademicLevels] = useState(false)

  const handlers = useSwipeable({
    onSwipedLeft: toggleVNav,
  })

  useEffect(() => {
    setAcademicLevels(false)
  }, [pathname])
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

        <div className="mt-4">
          <Link
            className={`v_nav_items_user block ${
              pathname === '/authority' ? 'visit' : ''
            }`}
            href="/authority"
          >
            <div className="flex cursor-pointer items-center py-2">
              <LayoutDashboard className="mr-3" />
              Dashboard
            </div>
          </Link>

          <Link
            className={`v_nav_items_user block ${
              pathname === '/authority/students' ? 'visit' : ''
            }`}
            href="/authority/students"
          >
            <div className="flex cursor-pointer items-center py-2">
              <GraduationCap className="mr-3" />
              Students
            </div>
          </Link>

          <div
            className={`utilNavDrop ${isAcademicLevels ? 'active two' : ''}`}
          >
            <div
              className={`flex v_nav_items_user ${
                isAcademicLevels ? 'active' : ''
              } items-center`}
            >
              <Link
                href={`/authority/curriculum`}
                className={`flex py-2 items-center ${
                  pathname.includes('/authority/curriculum')
                    ? 'text-[var(--custom)]'
                    : ''
                }`}
              >
                <Layers className="mr-3" />
                Curriculum
              </Link>
              <i
                onClick={() => setAcademicLevels((e) => !e)}
                className={`bi bi-caret-down-fill ml-auto cursor-pointer ${
                  isAcademicLevels ? 'active' : ''
                }`}
              ></i>
            </div>
            <div className="nav_dropdown">
              <Link
                className="inner_nav_items"
                href="/authority/curriculum/academic-levels/"
              >
                Academic Levels
              </Link>
              <Link
                className="inner_nav_items"
                href="/authority/curriculum/activities"
              >
                Activities
              </Link>
            </div>
          </div>

          <Link
            className={`v_nav_items_user block ${
              pathname === '/school/students' ? 'visit' : ''
            }`}
            href="/school/students"
          >
            <div className="flex cursor-pointer items-center py-2">
              <FileQuestion className="mr-3" />
              Question Paper
            </div>
          </Link>

          <Link
            className={`v_nav_items_user block ${
              pathname.includes('school/messages') ? 'text-[var(--custom)]' : ''
            }`}
            href={`/school/messages`}
          >
            <div className="flex cursor-pointer items-center py-2">
              <div className="relative mr-3">
                {unreadMessages + unreadNotifications > 0 && (
                  <span className="dot_notification">
                    {unreadMessages + unreadNotifications < 9
                      ? unreadMessages + unreadNotifications
                      : '9+'}
                  </span>
                )}
                <MessageSquare />
              </div>
              Messages
            </div>
          </Link>

          <Link className={`v_nav_items_user block`} href={`/school/results`}>
            <div className="flex cursor-pointer items-center py-2">
              <BarChart className="mr-3" />
              Results
            </div>
          </Link>
        </div>

        <ThemeToggle />
      </div>
    </div>
  )
}
