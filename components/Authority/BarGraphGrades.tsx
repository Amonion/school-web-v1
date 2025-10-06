'use client'

import { useTheme } from '@/context/ThemeProvider'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts'

// Example: replace with your real data
const gradeData = [
  { grade: 'A', male: 25, female: 20 },
  { grade: 'B', male: 18, female: 12 },
  { grade: 'C', male: 10, female: 15 },
  { grade: 'D', male: 7, female: 8 },
  { grade: 'E', male: 3, female: 5 },
  { grade: 'F', male: 2, female: 3 },
]

export default function BarGraphGrades() {
  const { theme } = useTheme()

  return (
    <>
      <h2 className="mb-2 text-lg font-semibold">
        Grades Distribution (Male vs Female)
      </h2>

      <ResponsiveContainer
        className={'bg-[var(--secondary)] text-gray-400 pt-2 rounded-[5px]'}
        width="100%"
        height={300}
      >
        <BarChart data={gradeData} barGap={6}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme === 'dark' ? '#444' : '#ddd'}
          />
          <XAxis
            dataKey="grade"
            stroke={theme === 'dark' ? '#ccc' : '#9ca3af'}
          />
          <YAxis stroke={theme === 'dark' ? '#ccc' : '#9ca3af'} />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="male"
            fill="#4A90E2"
            name="Male"
            radius={[5, 5, 0, 0]}
          />
          <Bar
            dataKey="female"
            fill="#FF66A1"
            name="Female"
            radius={[5, 5, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </>
  )
}
