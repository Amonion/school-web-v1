// components/UtilsDashboard.js
'use client'

import { useTheme } from '@/context/ThemeProvider'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const lineData = [
  { day: 'Mon', likes: 40, comments: 24, shares: 10 },
  { day: 'Tue', likes: 30, comments: 13, shares: 8 },
  { day: 'Wed', likes: 20, comments: 98, shares: 20 },
  { day: 'Thu', likes: 27, comments: 39, shares: 15 },
  { day: 'Fri', likes: 18, comments: 48, shares: 18 },
  { day: 'Sat', likes: 23, comments: 38, shares: 12 },
  { day: 'Sun', likes: 34, comments: 43, shares: 20 },
]

export default function LineGraph() {
  const { theme } = useTheme()

  return (
    <>
      <h2 className="mb-2 text-lg font-semibold">Post Reactions </h2>

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
          <Line type="monotone" dataKey="likes" stroke="#00C49F" />
          <Line type="monotone" dataKey="comments" stroke="#FFBB28" />
          <Line type="monotone" dataKey="shares" stroke="#FF8042" />
        </LineChart>
      </ResponsiveContainer>
    </>
  )
}
