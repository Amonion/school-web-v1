'use client'
import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { NavStore } from '@/src/zustand/notification/Navigation'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { BioUserSchoolInfoStore } from '@/src/zustand/user/BioUserSchoolInfo'
import EmptySearch from '@/components/Home/Trace/EmptySearch'
import PeopleCard from '@/components/Home/Trace/PeopleResources/PeopleCard'

export default function PeopleList() {
  const { query, searchedText } = NavStore()
  const {
    loading,
    hasMoreSearch,
    searchPageSize,
    searchCurrentPage,
    searchedBioUsersSchoolInfo,
    setSearchCurrentPage,
    searchPerson,
    getQueryBioUsersSchool,
    clearSearchedItem,
    addMoreSearchedBioUsersSchoolInfo,
  } = BioUserSchoolInfoStore()

  const url = '/users/biouser-school'
  const searchParams = useSearchParams()
  const { bioUserSchoolInfo, bioUser } = AuthStore()
  const lastUserRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (searchCurrentPage > 1) {
      addMoreSearchedBioUsersSchoolInfo(getUrl(searchedText, searchCurrentPage))
    }
  }, [searchCurrentPage])

  useEffect(() => {
    if (searchedText.length > 0 && bioUserSchoolInfo) {
      searchPerson(getUrl(searchedText, 1))
    } else {
      clearSearchedItem()
    }
  }, [searchedText, query, bioUserSchoolInfo])

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      getQueryBioUsersSchool(getUrl(q, 1))
    } else {
      getQueryBioUsersSchool(getUrl('', 1))
    }
  }, [])

  useEffect(() => {
    if (!lastUserRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreSearch) {
          setSearchCurrentPage(searchCurrentPage + 1)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(lastUserRef.current)
    return () => observer.disconnect()
  }, [searchedBioUsersSchoolInfo.length])

  const getUrl = (text: string, pageNum: number): string => {
    return `${url}/search/?${query}firstName=${text}&bioUserId=${bioUser?._id}&username=${text}&middleName=${text}&lastName=${text}&bioUserDisplayName=${text}&bioUserUsername=${text}&page=${pageNum}&limit=${searchPageSize}&isVerified=true`
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

      {searchedBioUsersSchoolInfo.length > 0 ? (
        searchedBioUsersSchoolInfo.map((item, index) => {
          const isLast = index === searchedBioUsersSchoolInfo.length - 1
          return (
            <PeopleCard
              key={item._id}
              user={item}
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
