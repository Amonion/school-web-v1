'use client'
import PostAnalysisStore from '@/src/zustand/post/PostAnalysis'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const COLORS = [
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#0088FE',
  '#FF6666',
  '#AA66CC',
]

// Example stats object (in real case, you'd pass this as props)

export default function PieGraph() {
  const { postAnalysisData } = PostAnalysisStore()
  const pieData = [
    { name: 'Likes', value: postAnalysisData.post.totalLikes },
    { name: 'Replies', value: postAnalysisData.post.totalReplies },
    { name: 'Shares', value: postAnalysisData.post.totalShares },
    { name: 'Bookmarks', value: postAnalysisData.post.totalBookmarks },
    { name: 'Posts', value: postAnalysisData.post.totalPosts },
    { name: 'Views', value: postAnalysisData.post.totalViews },
  ].filter((item) => item.value > 0) // optional: remove zero values

  return (
    <>
      <h2 className="mb-2 text-lg font-semibold">Social Distribution</h2>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={70}
            fill="#8884d8"
            dataKey="value"
            label
          >
            {pieData.map((entry, index) => (
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
