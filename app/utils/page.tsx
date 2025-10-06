'use client'
import DashboardCards from '@/components/Utility/Dashboard/DashboardCards'
import LineGraph from '@/components/Utility/Dashboard/LineGraph'
import PieGraph from '@/components/Utility/Dashboard/PieGraph'
import StatDuration from '@/components/Utility/Dashboard/StatDuration'
import TopPosts from '@/components/Utility/Dashboard/TopPosts'
import PostAnalysisStore from '@/src/zustand/post/PostAnalysis'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { useEffect } from 'react'

export default function UtilsDashboard() {
  const { period, fromDate, toDate, getPostAnalysis } = PostAnalysisStore()
  const { user } = AuthStore()
  const url = '/utilities/dashboard'

  useEffect(() => {
    if (period !== 'custom') {
      getPostAnalysis(
        `/utilities/dashboard/?period=${period}&username=${user?.username}&dateFrom=${fromDate}&dateTo=${toDate}`
      )
    }
  }, [period])
  return (
    <div className="space-y-5 text-[var(--text-primary)]">
      <StatDuration url={url} title="Utilities" />
      <DashboardCards />

      <div className="flex flex-wrap md:flex-nowrap">
        <div className="card_body pad w-full md:w-auto mb-5 md:mb-0 flex-1 md:mr-5">
          <LineGraph />
        </div>
        <div className="card_body sharp w-full min-w-[260px] md:w-auto px-2 py-4 rounded-xl">
          <PieGraph />
        </div>
      </div>

      <TopPosts />
    </div>
  )
}
