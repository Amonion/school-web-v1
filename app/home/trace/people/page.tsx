'use client'
import { useRef } from 'react'
import EmptySearch from '@/components/Home/Trace/EmptySearch'
import PeopleCard from '@/components/Home/Trace/PeopleResources/PeopleCard'
import { PeopleStore } from '@/src/zustand/Trace/People'
import SearchedPeopleCard from '@/components/Home/Trace/PeopleResources/SearchedPeople'

export default function PeopleList() {
  const lastUserRef = useRef<HTMLDivElement | null>(null)
  const { people, loading, searchedPeople } = PeopleStore()

  return (
    <div className="flex flex-col w-full">
      {loading && (
        <div className="flex items-center h-10 justify-center flex-wrap w-full">
          <i
            className={`bi  bi-opencollective loading  text-md text-[var(--custom-color)]`}
          ></i>
        </div>
      )}

      {searchedPeople.length > 0 && (
        <div className="absolute z-30 w-full top-0 left-0 bg-[var(--primary)] overflow-auto max-h-[300px] border border-[var(--border)]">
          {searchedPeople.map((user, index) => (
            <SearchedPeopleCard user={user} key={index} />
          ))}
        </div>
      )}

      {people.length > 0 ? (
        people.map((item, index) => {
          const isLast = index === people.length - 1
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
