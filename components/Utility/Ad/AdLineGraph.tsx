'use client'
import { useTheme } from '@/context/ThemeProvider'
import AdStore from '@/src/zustand/finance/Ad'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

export default function AdLineGraph() {
  const { theme } = useTheme()
  const { lineData } = AdStore()

  return (
    <>
      <h2 className="mb-2 text-lg font-semibold">Ads Analysis </h2>

      <ResponsiveContainer
        className={'bg-[var(--secondary)] text-gray-400 pt-2 rounded-[5px]'}
        width="100%"
        height={300}
      >
        <LineChart data={lineData}>
          <XAxis dataKey="day" stroke={theme === 'dark' ? '#ccc' : '#9ca3af'} />
          <YAxis stroke={theme === 'dark' ? '#ccc' : '#9ca3af'} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="reviews" stroke="#00C49F" />
          <Line type="monotone" dataKey="online" stroke="#FFBB28" />
          <Line type="monotone" dataKey="editing" stroke="#FF8042" />
        </LineChart>
      </ResponsiveContainer>
    </>
  )
}
