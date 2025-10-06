'use client'
import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { NavStore } from '@/src/zustand/notification/Navigation'
import SchoolStore from '@/src/zustand/school/School'
import EmptySearch from '@/components/Home/Trace/EmptySearch'
import SchoolCard from '@/components/Home/Trace/SchoolResources/SchoolCard'

export default function SchoolList() {
  const { query, searchedText, page, setPage } = NavStore()
  const {
    searchedSchools,
    hasMoreSearch,
    page_size,
    loading,
    getQuerySchools,
    searchSchool,
    clearSearchedSchools,
    addMoreSearchItems,
  } = SchoolStore()
  const lastUserRef = useRef<HTMLDivElement | null>(null)
  const url = '/schools/find'
  const searchParams = useSearchParams()

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
      searchSchool(getUrl(searchedText, 1))
    }
    if (searchedText.length > 0) {
      findResults()
    } else {
      clearSearchedSchools()
    }
  }, [searchedText, query])

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      getQuerySchools(getUrl(q, 1))
    } else {
      getQuerySchools(getUrl('', 1))
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
  }, [searchedSchools.length])

  const getUrl = (text: string, pageNum: number): string => {
    return `${url}/?${query}username=${text}&name=${text}&limit=${page_size}&page=${pageNum}`
  }

  return (
    <div className="flex pb-[55px] sm:pb-0 flex-col w-full">
      {loading && (
        <div className="flex items-center h-10 justify-center flex-wrap w-full">
          <i
            className={`bi  bi-opencollective loading  text-md text-[var(--custom-color)]`}
          ></i>
        </div>
      )}

      {searchedSchools.length > 0 ? (
        searchedSchools.map((item, index) => {
          const isLast = index === searchedSchools.length - 1
          return (
            <SchoolCard
              key={item._id}
              school={item}
              ref={isLast ? lastUserRef : null}
            />
          )
        })
      ) : (
        <EmptySearch />
      )}
    </div>
  )
}
