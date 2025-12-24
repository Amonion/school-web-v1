'use client'
import { useEffect, useRef } from 'react'
import ExamStore from '@/src/zustand/exam/Exam'
import QuestionCard from '@/components/Home/Exam/QuestionResources/QuestionCard'

export default function QuestionList() {
  const { hasMore, loading, exams, getMoreSavedExams } = ExamStore()
  const lastCardRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!lastCardRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          getMoreSavedExams()
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(lastCardRef.current)
    return () => observer.disconnect()
  }, [exams.length])

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
