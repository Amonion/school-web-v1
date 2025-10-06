'use client'
import BarGraphGrades from '@/components/School/BarGraphGrades'
import EventCalendarWidget from '@/components/School/EventCalendarWidget'
import LatestMessages from '@/components/School/LatestMessages'
import PieStudentGraph from '@/components/School/PieStudentGraph'
import SchoolDashboardCards from '@/components/School/SchoolDashboardCards'
import { useTheme } from '@/context/ThemeProvider'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import Image from 'next/image'

export default function UtilsDashboard() {
  const { bioUserState } = AuthStore()
  const { theme } = useTheme()
  return (
    <>
      {bioUserState?.activeOffice.position !== 'Unknown' ? (
        <div className="sm:space-y-5 space-y-2  text-[var(--text-primary)] w-full">
          <div className="flex flex-wrap items-start lg:items-center justify-between mb-3">
            <div className="pageTitle mb-1 sm:mb-0">
              <span className="text-[var(--custom)] text-base mr-2 uppercase">
                {bioUserState?.activeOffice?.position}:
              </span>
              {bioUserState?.activeOffice?.name}
            </div>
          </div>
          <SchoolDashboardCards />

          <div className="flex flex-wrap">
            <div className="card_body pad w-full sm:w-auto mb-2 sm:mb-0 sm:flex-1 sm:mr-5">
              <BarGraphGrades />
            </div>
            <div className="card_body sharp w-full sm:max-w-[270px] min-w-[260px] sm:w-auto px-2 py-4 rounded-xl">
              <PieStudentGraph />
            </div>
          </div>
          <div className="flex w-full flex-col sm:flex-row">
            <LatestMessages />

            <div className="relative w-full sm:w-1/3">
              <EventCalendarWidget />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-center px-3 items-center flex-1 bg-[var(--primary)]">
          <div className="text-center text-xl mb-5">
            Hold on while the office assigns you a position
          </div>
          <Image
            className={`object-contain max-w-[500px]`}
            src={
              theme === 'dark'
                ? '/images/WaitDark.png'
                : '/images/WaitLight.png'
            }
            loading="lazy"
            alt="username"
            sizes="100vw"
            height={0}
            width={0}
            style={{ height: 'auto', width: 'auto' }}
          />
        </div>
      )}
    </>
  )
}
