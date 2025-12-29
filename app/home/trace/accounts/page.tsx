'use client'
import { useRef } from 'react'
import EmptySearch from '@/components/Home/Trace/EmptySearch'
import AccountCard from '@/components/Home/Trace/AccountResources/AccountCard'
import { AccountStore } from '@/src/zustand/Trace/Account'

export default function PeopleList() {
  const lastUserRef = useRef<HTMLDivElement | null>(null)
  const { accounts, loading } = AccountStore()
  return (
    <div className="flex flex-col w-full">
      {loading && (
        <div className="flex items-center h-10 justify-center flex-wrap w-full">
          <i
            className={`bi  bi-opencollective loading  text-md text-[var(--custom-color)]`}
          ></i>
        </div>
      )}

      {accounts.length === 0 && <EmptySearch />}

      {accounts.map((item, index) => {
        const isLast = index === accounts.length - 1
        return (
          <AccountCard
            key={item._id}
            account={item}
            ref={isLast ? lastUserRef : null}
          />
        )
      })}
    </div>
  )
}
