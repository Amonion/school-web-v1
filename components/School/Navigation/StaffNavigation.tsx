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
} from 'lucide-react'
import { NavStore } from '@/src/zustand/notification/Navigation'
import SchoolStore from '@/src/zustand/school/School'

export default function StaffNavigation() {
  const router = useRouter()
  // const [isCurriculum, setCurriculum] = useState(false)
  const [isQuestion, setQuestion] = useState(false)

  const pathname = usePathname()
  const { clearNav } = NavStore()
  const { unreadMessages, unreadNotifications } = SchoolStore()

  useEffect(() => {
    clearNav()
    // setCurriculum(false)
    setQuestion(false)
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

      <Link
        className={`v_nav_items_user block ${
          pathname === '/school/students' ? 'visit' : ''
        }`}
        href="/school/students"
      >
        <div className="flex cursor-pointer items-center py-2">
          <GraduationCap className="mr-3" />
          Students
        </div>
      </Link>

      <Link
        className={`v_nav_items_user block ${
          pathname === '/school/curriculum' ? 'visit' : ''
        }`}
        href="/school/curriculum"
      >
        <div className="flex cursor-pointer items-center py-2">
          <Layers className="mr-3" />
          Subjects
        </div>
      </Link>

      {/* <div className={`utilNavDrop ${isCurriculum ? 'active two' : ''}`}>
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
            Subjects
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
      </div> */}

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
  )
}
