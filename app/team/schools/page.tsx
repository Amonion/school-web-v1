'use client'
import GroupedBarChart from '@/components/Team/Stat/GroupedBarChart'
import ShoolStatCard from '@/components/Team/Stat/ShoolStatCard'

const Team: React.FC = () => {
  return (
    <>
      <div className="body-card">
        <ShoolStatCard />

        <div className="w-full overscroll-x-auto">
          <div className="w-full rounded-[10px] bg-[var(--primary)] py-3">
            <GroupedBarChart />
          </div>
        </div>
      </div>
    </>
  )
}

export default Team
