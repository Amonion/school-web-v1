'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { formatDate } from '@/lib/helpers'
import { MessageStore } from '@/src/zustand/notification/Message'
import UserExamStore from '@/src/zustand/exam/UserExam'
import ExamStore from '@/src/zustand/exam/Exam'

const ExamDetails = () => {
  const { setMessage } = MessageStore()
  const { formData } = ExamStore()
  const { getExams } = UserExamStore()
  const { id } = useParams()
  const [currentPage] = useState(1)
  const [page_size] = useState(20)

  useEffect(() => {
    const find = async () => {
      if (id) {
        getExams(
          `/user-competitions/table/?paperId=${id}&page=${currentPage}&page_size=${page_size}&ordering=-metric`,
          setMessage
        )
      }
    }

    find()
  }, [id])

  // useEffect(() => {
  //   window.scrollTo({ top: 0, behavior: "smooth" });
  // }, [currentPage]);

  return (
    <>
      <div className="card_body sharp sm:text-lg">
        <div className="flex-1 mb-3">
          <div className="text-secondary dark:text-dark-secondary font-pmedium">
            Name:
          </div>
          <div className="bg-[var(--secondary)] p-2 text-[var(--text-primary)] rounded-[10px]">
            {formData.name}
          </div>
        </div>
        <div className="flex-1 mb-3">
          <div className="text-secondary dark:text-dark-secondary font-pmedium">
            Title:
          </div>
          <div className="bg-[var(--secondary)] p-2 text-[var(--text-primary)] rounded-[10px]">
            {formData.title}
          </div>
        </div>
        <div className="flex-1 mb-3">
          <div className="text-secondary dark:text-dark-secondary font-pmedium">
            Subtitle:
          </div>
          <div className="bg-[var(--secondary)] p-2 text-[var(--text-primary)] rounded-[10px]">
            {formData.subtitle}
          </div>
        </div>
        <div className="flex-1 mb-3">
          <div className="text-secondary dark:text-dark-secondary font-pmedium">
            Subject:
          </div>
          <div className="bg-[var(--secondary)] p-2 text-[var(--text-primary)] rounded-[10px]">
            {formData.subjects}
          </div>
        </div>
        <div className="flex-1 mb-3">
          <div className="text-secondary dark:text-dark-secondary font-pmedium">
            Type:
          </div>
          <div className="bg-[var(--secondary)] p-2 text-[var(--text-primary)] rounded-[10px]">
            {formData.type}
          </div>
        </div>
        <div className="flex-1 mb-3">
          <div className="text-secondary dark:text-dark-secondary font-pmedium">
            Instruction:
          </div>
          <div className="bg-[var(--secondary)] p-2 text-[var(--text-primary)] rounded-[10px]">
            {formData.instruction}
          </div>
        </div>
        <div className="flex-1 mb-3">
          <div className="text-secondary dark:text-dark-secondary font-pmedium">
            Participants:
          </div>
          <div className="bg-[var(--secondary)] p-2 text-[var(--text-primary)] rounded-[10px]">
            {formData.participants}
          </div>
        </div>
        <div className="flex-1 mb-3">
          <div className="text-secondary dark:text-dark-secondary font-pmedium">
            Duration:
          </div>
          <div className="bg-[var(--secondary)] p-2 text-[var(--text-primary)] rounded-[10px]">
            {formData.duration}
          </div>
        </div>
        <div className="flex-1 mb-3">
          <div className="text-secondary dark:text-dark-secondary font-pmedium">
            Questions:
          </div>
          <div className="bg-[var(--secondary)] p-2 text-[var(--text-primary)] rounded-[10px]">
            {formData.questions}
          </div>
        </div>
        <div className="flex-1 mb-3">
          <div className="text-secondary dark:text-dark-secondary font-pmedium">
            Questions Per Page:
          </div>
          <div className="bg-[var(--secondary)] p-2 text-[var(--text-primary)] rounded-[10px]">
            {formData.questionsPerPage}
          </div>
        </div>
        <div className="flex-1 mb-3">
          <div className="text-secondary dark:text-dark-secondary font-pmedium">
            Options Per Questions:
          </div>
          <div className="bg-[var(--secondary)] p-2 text-[var(--text-primary)] rounded-[10px]">
            {formData.optionsPerQuestion}
          </div>
        </div>
        <div className="flex-1 mb-3">
          <div className="text-secondary dark:text-dark-secondary font-pmedium">
            Published At:
          </div>
          <div className="bg-[var(--secondary)] p-2 text-[var(--text-primary)] rounded-[10px]">
            {formatDate(String(formData.publishedAt))}
          </div>
        </div>
      </div>
    </>
  )
}

export default ExamDetails
