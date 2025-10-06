'use client'
import { formatCount, formatDateToDDMMYY } from '@/lib/helpers'
import PostAnalysisStore from '@/src/zustand/post/PostAnalysis'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { useEffect } from 'react'

export default function TopPosts() {
  const { period, topPosts, fromDate, toDate, getTopPosts } =
    PostAnalysisStore()
  const { user } = AuthStore()

  useEffect(() => {
    if (period !== 'custom') {
      getTopPosts(
        `/posts/?username=${user?.username}&page_size=10${
          fromDate ? `&createdAt[gte]=${fromDate}` : ''
        }${
          toDate ? `&createdAt[lte]=${toDate}` : ''
        }&ordering=-score&postType=main`
      )
    }
  }, [period])
  return (
    <div className="space-y-5 ">
      <div className="card_body p-4 sharp overflow-x-auto">
        <h2 className="mb-2 text-lg font-semibold">Top Performing Posts</h2>
        <table className="min-w-[600px] w-full text-sm">
          <thead>
            <tr className="">
              <th className="py-2 text-left">Content</th>
              <th className="py-2 text-right">Vws.</th>
              <th className="py-2 text-right">Lks</th>
              <th className="py-2 text-right">Bmks</th>
              <th className="py-2 text-right">Cmts</th>
              <th className="py-2 text-right">Shrs</th>
              <th className="py-2 text-right">Time</th>
            </tr>
          </thead>
          <tbody>
            {topPosts.map((item, index) => (
              <tr
                key={index}
                className={`${index % 2 === 1 ? 'bg-[var(--secondary)]' : ''}`}
              >
                <td className="py-2 line-clamp-1">
                  <div
                    className="line-clamp-1 overflow-ellipsis"
                    dangerouslySetInnerHTML={{
                      __html: item.content,
                    }}
                  />
                </td>
                <td className="py-2 text-right">{formatCount(item.views)}</td>
                <td className="py-2 text-right">{formatCount(item.likes)}</td>
                <td className="py-2 text-right">
                  {formatCount(item.bookmarks)}
                </td>
                <td className="py-2 text-right">{formatCount(item.replies)}</td>
                <td className="py-2 text-right">{formatCount(item.shares)}</td>

                <td className="py-2 text-right">
                  <span className="text-sm">
                    {formatDateToDDMMYY(String(item.createdAt))}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
