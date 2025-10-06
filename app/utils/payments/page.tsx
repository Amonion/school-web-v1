'use client'
import { ArrowUpCircle, LucideIcon } from 'lucide-react'
import Link from 'next/link'
import LineGraph from '@/components/Utility/Dashboard/LineGraph'
import PercentageChange from '@/components/Utility/Dashboard/PercentageChange'
import StatDuration from '@/components/Utility/Dashboard/StatDuration'
import { ArrowDownCircle, Wallet } from 'lucide-react'
import TopUp from '@/components/Utility/Payments/TopUp'
import { formatDate, formatMoney, formatTimeTo12Hour } from '@/lib/helpers'
import CustomPayment from '@/components/Utility/Payments/CustomPayments'
import TransactionStore from '@/src/zustand/finance/Transaction'

export default function PaymentDashboard() {
  const { transactions, walletForm } = TransactionStore()
  const url = '/utilities/dashboard'

  return (
    <div className="text-[var(--text-primary)]">
      <StatDuration url={url} title="Payment" />
      <div className="flex w-full flex-wrap mb-4">
        <div className="sm:flex-1 w-full sm:w-auto mb-4 sm:mb-0">
          <div className="grid xs:grid-cols-2 sm:grid-cols-3 gap-2">
            <WalletCard
              title="Balance"
              amount={walletForm.balance}
              currency={walletForm.currencySymbol}
              percentChange={-15.66}
              amountChange={+555}
              lucidIcon={Wallet}
            />
            <WalletCard
              title="Received"
              amount={walletForm.received}
              currency={walletForm.currencySymbol}
              percentChange={-15.66}
              amountChange={+555}
              lucidIcon={ArrowDownCircle}
            />
            <WalletCard
              title="Spent"
              amount={walletForm.spent}
              currency={walletForm.currencySymbol}
              percentChange={-15.66}
              amountChange={+555}
              lucidIcon={ArrowUpCircle}
            />
          </div>
          <div className="flex mb-4 justify-center">
            <TopUp />
          </div>
          <div className="card_body pad flex-1">
            <LineGraph />
          </div>
        </div>
        <CustomPayment />
      </div>
      <div className="card_body p-4 sharp">
        <h2 className="mb-2 text-lg font-semibold">Latest Transactions</h2>
        <div className="overflow-x-auto mb-2">
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
              {transactions.slice(0, 5).map((item, index) => (
                <tr
                  key={index}
                  className={`${
                    index % 2 === 1 ? 'bg-[var(--secondary)]' : ''
                  }`}
                >
                  <td className="py-2">{item.title}</td>
                  <td className="py-2 text-right">
                    {item.currencySymbol}
                    {formatMoney(item.amount)}
                  </td>
                  <td className="py-2 text-right">
                    {item.status ? (
                      <span>Completed</span>
                    ) : (
                      <span>Pending</span>
                    )}
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
        <Link
          className="text-[var(--custom)]"
          href={`/utils/payments/transactions`}
        >
          More Transactions
        </Link>
      </div>
    </div>
  )
}

interface WalletCardProps {
  title: string
  amount: number
  currency: string
  percentChange: number
  amountChange: number | string
  lucidIcon: LucideIcon
}

const WalletCard = ({
  title,
  amount,
  currency,
  percentChange,
  amountChange,
  lucidIcon: Icon,
}: WalletCardProps) => {
  return (
    <div className="card_body pad">
      <div className="flex items-center">
        <Icon className="mr-2" color="currentColor" size={18} /> {title}
      </div>
      <div className="flex items-end mt-3 mb-2 text-sm">
        <div className="text-lg mr-2 -mb-[2px] font-semibold text-[var(--text-secondary)]">
          {currency}
          {formatMoney(amount)}
        </div>{' '}
        <PercentageChange percentage={percentChange} />
      </div>
      <div className="text-sm">
        +{currency}
        {amountChange} than last week
      </div>
    </div>
  )
}
