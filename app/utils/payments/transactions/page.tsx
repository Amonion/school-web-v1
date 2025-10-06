'use client'
import StatDuration from '@/components/Utility/Dashboard/StatDuration'

import { useEffect } from 'react'
import { formatDate, formatMoney, formatTimeTo12Hour } from '@/lib/helpers'
import TransactionStore from '@/src/zustand/finance/Transaction'

export default function PaymentDashboard() {
  const { transactions } = TransactionStore()
  const url = ''
  useEffect(() => {}, [])
  return (
    <>
      <StatDuration url={url} title="Transactions" />
      <div className="card_body p-4 sharp overflow-x-auto">
        <h2 className="mb-2 text-lg font-semibold">Latest Transactions</h2>
        <table className="min-w-[600px] w-full text-sm">
          <thead>
            <tr className="">
              <th className="py-2 text-left">Name</th>
              <th className="py-2 text-right">Amount</th>
              <th className="py-2 text-right">Status</th>
              <th className="py-2 text-right">Time</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((item, index) => (
              <tr
                key={index}
                className={`${index % 2 === 1 ? 'bg-[var(--secondary)]' : ''}`}
              >
                <td className="py-2">{item.title}</td>
                <td className="py-2 text-right">
                  {item.currencySymbol}
                  {formatMoney(item.amount)}
                </td>
                <td className="py-2 text-right">
                  {item.status ? <span>Completed</span> : <span>Pending</span>}
                </td>
                <td className="py-2 text-right">
                  <div className="flex flex-col">
                    <span className="text-sm mb-1">
                      {formatTimeTo12Hour(item.createdAt)}
                    </span>
                    <span className="text-sm">
                      {formatDate(String(item.createdAt))}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
