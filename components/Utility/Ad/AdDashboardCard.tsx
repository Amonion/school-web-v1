'use client'
import { formatCount, formatMoney } from '@/lib/helpers'
import PercentageChange from '../Dashboard/PercentageChange'
import { Calendar } from 'lucide-react'
import AdStore from '@/src/zustand/finance/Ad'

export default function AdDashboardCard() {
  const {
    adStat,
    adPercentageChange,
    currency,
    reviewingStat,
    reviewPercentageChange,
    onlineStat,
    onlinePercentageChange,
    editingStat,
    editingPercentageChange,
  } = AdStore()

  return (
    <div className="grid gap-2 grid-cols-2 sm:grid-cols-2 md:grid-cols-4">
      <Card
        title="Total Ads"
        totalAds={adStat.totalAds}
        totalAmount={adStat.totalAmount}
        totalDuration={adStat.totalDuration}
        percentage={adPercentageChange}
        currency={currency}
      />
      <Card
        title="Total Reviewing"
        totalAds={reviewingStat.totalAds}
        totalAmount={reviewingStat.totalAmount}
        totalDuration={reviewingStat.totalDuration}
        percentage={reviewPercentageChange}
        currency={currency}
      />
      <Card
        title="Total Online"
        totalAds={onlineStat.totalAds}
        totalAmount={onlineStat.totalAmount}
        totalDuration={onlineStat.totalDuration}
        percentage={onlinePercentageChange}
        currency={currency}
      />
      <Card
        title="Total Editing"
        totalAds={editingStat.totalAds}
        totalAmount={editingStat.totalAmount}
        totalDuration={editingStat.totalDuration}
        percentage={editingPercentageChange}
        currency={currency}
      />
    </div>
  )
}

interface CardProps {
  title: string
  totalAds: number
  totalAmount: number
  totalDuration: number
  percentage: number
  currency: string
}

const Card = ({
  title,
  totalAds,
  totalAmount,
  totalDuration,
  percentage,
  currency,
}: CardProps) => {
  return (
    <div className="card_body pad">
      <div className="text-lg text-[var(--text-secondary)]">{title}</div>

      <div className="flex items-end my-2 justify-between">
        <div className="md:text-2xl text-xl leading-none text-[var(--custom)]">
          {formatCount(totalAds)}
        </div>
        <div className="flex items-center ">
          <div>{currency}</div>
          <div className="flex items-center md:text-lg">
            {formatMoney(isNaN(totalAmount) ? 0 : totalAmount)}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between text-[12px]">
        <PercentageChange percentage={percentage} />
        <div className="flex items-center ml-auto">
          <Calendar className="w-3 h-auto mr-2" />
          {formatCount(totalDuration)} Days
        </div>
      </div>
    </div>
  )
}
