'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect } from 'react'
import { formatDate, formatMoney } from '@/lib/helpers'
import LineGraph from '@/components/Utility/Dashboard/LineGraph'
import PieGraph from '@/components/Utility/Dashboard/PieGraph'
import StatDuration from '@/components/Utility/Dashboard/StatDuration'
import AdStore from '@/src/zustand/finance/Ad'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { useTheme } from '@/context/ThemeProvider'

export default function AdsDashboard() {
  const { getAds, itemResults, page_size, page, toggleChecked } = AdStore()
  const { user } = AuthStore()
  const { theme } = useTheme()

  useEffect(() => {
    getAds(`/ads/?user=${user?.username}`)
  }, [user])
  return (
    <div className="flex-1 text-[var(--text-primary)] pb-3">
      {itemResults.length > 0 ? (
        <>
          <StatDuration url={''} title="Ads Dashboard" />

          {/* <DashboardCards /> */}
          <div className="flex flex-wrap md:flex-nowrap my-4">
            <div className="card_body pad w-full md:w-auto mb-5 md:mb-0 flex-1 md:mr-5">
              <LineGraph />
            </div>
            <div className="card_body sharp w-full min-w-[260px] md:w-auto px-2 py-4">
              <PieGraph />
            </div>
          </div>
          <div className="sm:flex-1 w-full">
            <div className="card_body pad w-full sharp p-4 overflow-x-auto">
              <h2 className="mb-2 text-lg font-semibold">Latest Ads</h2>
              <div className="overflow-x-auto w-full">
                <table className="text-sm sm:min-w-full min-w-[700px] w-full">
                  <thead>
                    <tr className="">
                      <th className="py-2">SN</th>
                      <th className="py-2">Name</th>
                      <th className="py-2">Level</th>
                      <th className="py-2">Duration</th>
                      <th className="py-2">Amount</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Time</th>
                      <th className="py-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemResults.map((item, index) => (
                      <tr
                        key={index}
                        className={`${
                          index % 2 === 1 ? 'bg-[var(--secondary)]' : ''
                        }`}
                      >
                        <td className="py-2">
                          <div className="flex items-center">
                            {' '}
                            <div
                              className={`checkbox ${
                                item.isChecked ? 'active' : ''
                              }`}
                              onClick={() => toggleChecked(index)}
                            >
                              {item.isChecked && (
                                <i className="bi bi-check text-white text-lg"></i>
                              )}
                            </div>
                            {(page - 1) * page_size + index + 1}
                          </div>
                        </td>

                        <td className="py-2">
                          <div className="flex items-center">
                            {' '}
                            <div className="relative min-w-10 h-10 overflow-hidden mr-1 rounded-full">
                              <Image
                                alt={`email of ${item.picture}`}
                                src={String(item.picture)}
                                width={0}
                                sizes="100vw"
                                height={0}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }}
                              />
                            </div>
                            <Link
                              href={`/utils/ads/details/${item._id}`}
                              className={`text-[var(--custom)]`}
                            >
                              {item.displayName}
                            </Link>{' '}
                          </div>
                        </td>
                        <td className="py-2">{item.distribution}</td>
                        <td className="py-2">{item.duration} Days</td>
                        <td className="py-2">
                          {item.currencySymbol}
                          {formatMoney(item.amount)}
                        </td>
                        <td className="py-2">
                          {item.onReview ? (
                            <span className="text-[var(--custom)]">
                              Reviewing
                            </span>
                          ) : item.status ? (
                            <span className="text-[var(--success)]">
                              Approved
                            </span>
                          ) : item.isEditing ? (
                            <span className="text-slate-400">Incomplete</span>
                          ) : (
                            <span>Completed</span>
                          )}
                        </td>
                        <td className="py-2">
                          <div className="flex flex-col">
                            <span className="text-sm">
                              {formatDate(String(item.publishedAt))}
                            </span>
                          </div>
                        </td>
                        <td className="py-2">
                          <div className="flex justify-center">
                            <div
                              className={`custom_btn neutral disabled text-center`}
                            >
                              Publish
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="card_body sharp min-h-[50vh] flex-1">
          <div className="flex flex-col items-center">
            <div className="text-center text-[var(--custom)] mb-3 text-2xl">
              Begin your Business Campaign
            </div>
            <Image
              className="m-auto max-w-[400px] mb-3"
              src={
                theme === 'dark' ? '/images/adDark.png' : '/images/adLight.png'
              }
              loading="lazy"
              alt="username"
              sizes="100vw"
              height={0}
              width={0}
              style={{ height: 'auto', width: '80%' }}
            />
            <div className="text-center max-w-[500px] mb-5 text-lg">
              Let the world see your products and services through{' '}
              <span className="text-[var(--custom)]">Schooling Social</span>
            </div>
            <Link
              href={`/utils/ads/create-ads`}
              className={`statDuration link`}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
