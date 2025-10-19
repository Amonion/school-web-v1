'use client'
import { useEffect, useRef } from 'react'
import { NavStore } from '@/src/zustand/notification/Navigation'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import ExamStore from '@/src/zustand/exam/Exam'
import QuestionCard from '@/components/Home/Exam/QuestionResources/QuestionCard'
import { MessageStore } from '@/src/zustand/notification/Message'

export default function QuestionList() {
  const { query, searchedText, setPage, page } = NavStore()
  // const [users, setUsers] = useState<UserInfo[]>();
  const {
    searchedExams,
    hasMoreSearch,
    loading,
    page_size,
    exams,
    getItems,
    searchExams,
    clearSearchedExams,
    addMoreSearchItems,
  } = ExamStore()
  const url = '/competitions/exams/find'
  const { user } = AuthStore()
  const { setMessage } = MessageStore()
  const lastCardRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const findItems = async () => {
      getItems(getUrl(searchedText, page), setMessage)
    }
    if (exams.length === 0) {
      findItems()
    }
  }, [exams])

  useEffect(() => {
    const findItems = async () => {
      addMoreSearchItems(getUrl(searchedText, page))
    }
    if (page > 1) {
      findItems()
    }
  }, [page, user])

  useEffect(() => {
    const findResults = async () => {
      searchExams(getUrl(searchedText, 1))
    }
    if (searchedExams.length > 0 && user) {
      findResults()
    } else {
      clearSearchedExams()
    }
  }, [searchedText, query, user])

  useEffect(() => {
    if (!lastCardRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreSearch) {
          setPage(page + 1)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(lastCardRef.current)
    return () => observer.disconnect()
  }, [searchedExams.length])

  const getUrl = (text: string, pageNum: number): string => {
    return `${url}/?${query}title=${text}&name=${text}&instruction=${text}&subtitle=${text}&limit=${page_size}&page=${pageNum}`
  }

  return (
    <div className="flex flex-col pb-[55px] sm:pb-0 w-full">
      {loading && (
        <div className="flex items-center h-10 justify-center flex-wrap w-full">
          <i
            className={`bi  bi-opencollective loading  text-md text-[var(--custom-color)]`}
          ></i>
        </div>
      )}

      {exams.map((item, index) => {
        const isLast = index === exams.length - 1
        return (
          <QuestionCard
            key={item._id}
            exam={item}
            ref={isLast ? lastCardRef : null}
          />
        )
      })}
    </div>
  )
}
