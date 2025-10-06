import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  BarChart,
  FileQuestion,
  GraduationCap,
  Layers,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
} from 'lucide-react'
import { NavStore } from '@/src/zustand/notification/Navigation'
import SchoolStore from '@/src/zustand/school/School'

export default function OwnerNavigation() {
  const router = useRouter()
  const [isQuestion, setQuestion] = useState(false)
  const [isSettings, setSettings] = useState(false)
  const [isStaff, setStaff] = useState(false)
  const [isCurriculum, setCurriculum] = useState(false)
  const [isStudent, setStudent] = useState(false)
  const pathname = usePathname()
  const { clearNav } = NavStore()
  const { unreadMessages, unreadStaffs, unreadStudents, unreadNotifications } =
    SchoolStore()

  useEffect(() => {
    clearNav()
    setQuestion(false)
    setSettings(false)
    setCurriculum(false)
    setStaff(false)
    setStudent(false)
  }, [router, pathname])

  return (
    <div className="mt-4">
      <Link
        className={`v_nav_items_user block ${
          pathname === '/school' ? 'visit' : ''
        }`}
        href="/school"
      >
        <div className="flex cursor-pointer items-center py-2">
          <LayoutDashboard className="mr-3" />
          Dashboard
        </div>
      </Link>

      <div className={`utilNavDrop ${isStudent ? 'active two' : ''}`}>
        <div className="flex v_nav_items_user items-center">
          <Link
            href={`/school/students`}
            className={`flex py-2 items-center ${
              pathname.includes('/school/students')
                ? 'text-[var(--custom)]'
                : ''
            }`}
          >
            <div className="relative mr-3">
              {unreadStudents > 0 && (
                <span className="dot_notification">
                  {unreadStudents < 9 ? unreadStudents : '9+'}
                </span>
              )}
              <GraduationCap />
            </div>
            Students
          </Link>
          <i
            onClick={() => setStudent((e) => !e)}
            className={`bi bi-caret-down-fill ml-auto cursor-pointer ${
              isStudent ? 'active' : ''
            }`}
          ></i>
        </div>
        <div className="nav_dropdown">
          <Link className="inner_nav_items" href="/school/students/applicants">
            Applicants
          </Link>
          <Link href={`/utils/ads/create-ads`} className={`inner_nav_items`}>
            Classes
          </Link>
        </div>
      </div>

      <div className={`utilNavDrop ${isCurriculum ? 'active two' : ''}`}>
        <div
          className={`flex v_nav_items_user ${
            isCurriculum ? 'active' : ''
          } items-center`}
        >
          <Link
            href={`/school/curriculum`}
            className={`flex py-2 items-center ${
              pathname.includes('/school/curriculum')
                ? 'text-[var(--custom)]'
                : ''
            }`}
          >
            <Layers className="mr-3" />
            Curriculum
          </Link>
          <i
            onClick={() => setCurriculum((e) => !e)}
            className={`bi bi-caret-down-fill ml-auto cursor-pointer ${
              isCurriculum ? 'active' : ''
            }`}
          ></i>
        </div>
        <div className="nav_dropdown">
          <Link className="inner_nav_items" href="/school/curriculum/scheme">
            Scheme of Work
          </Link>
          <Link
            className="inner_nav_items"
            href="/school/curriculum/activities"
          >
            Activities
          </Link>
        </div>
      </div>

      <div className={`utilNavDrop ${isQuestion ? 'active two' : ''}`}>
        <div
          className={`flex v_nav_items_user ${
            isQuestion ? 'active' : ''
          } items-center`}
        >
          <Link
            href={`/school/questions`}
            className={`flex py-2 items-center ${
              pathname.includes('/school/questions')
                ? 'text-[var(--custom)]'
                : ''
            }`}
          >
            <FileQuestion className="mr-3" />
            Question Paper
          </Link>
          <i
            onClick={() => setQuestion((e) => !e)}
            className={`bi bi-caret-down-fill ml-auto cursor-pointer ${
              isQuestion ? 'active' : ''
            }`}
          ></i>
        </div>
        <div className="nav_dropdown">
          <Link
            className="inner_nav_items"
            href="/school/questions/create-question-paper"
          >
            Create Question
          </Link>
          <Link
            className="inner_nav_items"
            href="/school/questions/past-questions"
          >
            Past Questions
          </Link>
        </div>
      </div>

      <div className={`utilNavDrop ${isStaff ? 'active two' : ''}`}>
        <div
          className={`flex v_nav_items_user ${
            isStaff ? 'active' : ''
          } items-center`}
        >
          <Link
            href={`/school/staffs`}
            className={`flex py-2 items-center ${
              pathname.includes('/school/staffs') ? 'text-[var(--custom)]' : ''
            }`}
          >
            <div className="relative mr-3">
              {unreadStaffs > 0 && (
                <span className="dot_notification">
                  {unreadStaffs < 9 ? unreadStaffs : '9+'}
                </span>
              )}
              <Users />
            </div>
            Staffs
          </Link>
          <i
            onClick={() => setStaff((e) => !e)}
            className={`bi bi-caret-down-fill ml-auto cursor-pointer ${
              isStaff ? 'active' : ''
            }`}
          ></i>
        </div>
        <div className="nav_dropdown">
          <Link className="inner_nav_items" href="/school/staffs/applicants">
            Applicants
          </Link>
          <Link className="inner_nav_items" href="/school/staffs/inactive">
            Inactive
          </Link>
        </div>
      </div>

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

      <div className={`utilNavDrop ${isSettings ? 'active tri' : ''}`}>
        <div
          className={`flex v_nav_items_user ${
            isSettings ? 'active' : ''
          } items-center`}
        >
          <Link
            href={`/school/settings`}
            className={`flex py-2 items-center ${
              pathname.includes('/school/settings')
                ? 'text-[var(--custom)]'
                : ''
            }`}
          >
            <Settings className="mr-3" />
            Settings
          </Link>
          <i
            onClick={() => setSettings((e) => !e)}
            className={`bi bi-caret-down-fill ml-auto cursor-pointer ${
              isSettings ? 'active' : ''
            }`}
          ></i>
        </div>
        <div className="nav_dropdown">
          <Link className="inner_nav_items" href="/school/settings/media">
            Media
          </Link>
          <Link className="inner_nav_items" href="/school/settings/academic">
            Academic
          </Link>
          <Link
            className="inner_nav_items"
            href="/school/settings/notifications"
          >
            Notifications
          </Link>
        </div>
      </div>
    </div>
  )
}
