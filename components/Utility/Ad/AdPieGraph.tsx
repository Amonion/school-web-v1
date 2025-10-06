'use client'
import AdStore from '@/src/zustand/finance/Ad'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const COLORS = ['#00C49F', '#FFBB28', '#FF8042']

export default function AdPieGraph() {
  const { lineData } = AdStore()

  return (
    <>
      <h2 className="mb-2 text-lg font-semibold">Ads Distribution</h2>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={lineData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label
          >
            {lineData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </>
  )
}
