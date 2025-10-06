'use client'
import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { NavStore } from '@/src/zustand/notification/Navigation'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import AccountStore from '@/src/zustand/user/Account'
import EmptySearch from '@/components/Home/Trace/EmptySearch'
import AccountCard from '@/components/Home/Trace/AccountResources/AccountCard'

export default function PeopleList() {
  const { query, searchedText, setPage, page } = NavStore()
  const {
    addMoreSearchItems,
    searchAccount,
    clearSearchedItem,
    getQueryAccounts,
    searchedAccounts,
    loading,
    hasMoreSearch,
    page_size,
  } = AccountStore()
  const lastUserRef = useRef<HTMLDivElement | null>(null)
  const url = '/users/accounts'
  const searchParams = useSearchParams()
  const { user, bioUser } = AuthStore()

  useEffect(() => {
    const findItems = async () => {
      addMoreSearchItems(getUrl(searchedText, page))
    }
    if (page > 1) {
      findItems()
    }
  }, [page])

  useEffect(() => {
    const findResults = async () => {
      searchAccount(getUrl(searchedText, 1))
    }
    if (searchedText.length > 0 && user) {
      findResults()
    } else {
      clearSearchedItem()
    }
  }, [searchedText, query, user])

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      getQueryAccounts(getUrl(q, 1))
    } else {
      getQueryAccounts(getUrl('', 1))
    }
  }, [])

  useEffect(() => {
    if (!lastUserRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreSearch) {
          setPage(page + 1)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(lastUserRef.current)
    return () => observer.disconnect()
  }, [searchedAccounts.length])

  const getUrl = (text: string, pageNum: number): string => {
    return `${url}/?${query}username=${text}&displayName=${text}&bioUserId=${bioUser?._id}&page=${pageNum}&limit=${page_size}`
  }

  return (
    <div className="flex flex-col w-full">
      {loading && (
        <div className="flex items-center h-10 justify-center flex-wrap w-full">
          <i
            className={`bi  bi-opencollective loading  text-md text-[var(--custom-color)]`}
          ></i>
        </div>
      )}

      {searchedAccounts.length === 0 && <EmptySearch />}

      {searchedAccounts.map((item, index) => {
        const isLast = index === searchedAccounts.length - 1
        return (
          <AccountCard
            key={item._id}
            user={item}
            ref={isLast ? lastUserRef : null}
          />
        )
      })}
    </div>
  )
}
