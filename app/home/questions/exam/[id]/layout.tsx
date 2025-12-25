'use client'
import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import ExamStore from '@/src/zustand/exam/Exam'
import UserExamStore from '@/src/zustand/exam/UserExam'

const UserExamLayout = ({ children }: { children: React.ReactNode }) => {
  const { id } = useParams()
  const { setIsFirstTime, getExam } = ExamStore()
  const { setMessage } = MessageStore()
  const { getUserExam } = UserExamStore()
  const { bioUser, bioUserState } = AuthStore()

  useEffect(() => {
    getExam(`/competitions/exams/${id}`, setMessage)
  }, [id])

  useEffect(() => {
    if (bioUser?._id) {
      getUserExam(
        `/user-competitions/exams/?bioUserId=${bioUser?._id}&paperId=${id}`
      )
    }
  }, [id, bioUser?._id])

  useEffect(() => {
    if (bioUserState?.examAttempts === 0) {
      setIsFirstTime(true)
    }
  }, [bioUserState])

  return <>{children}</>
}

export default UserExamLayout
