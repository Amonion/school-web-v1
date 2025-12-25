'use client'
import { createContext, useEffect, useContext, ReactNode } from 'react'
import ExamStore from '@/src/zustand/exam/Exam'
import useSocket from '@/src/useSocket'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { Objective } from '@/src/zustand/exam/Objective'
import { addRecordsToDB } from '@/lib/indexDB'

const QuestionContext = createContext<null>(null)

interface QuestionProviderProps {
  children: ReactNode
}

export const QuestionProvider = ({ children }: QuestionProviderProps) => {
  const { exams, getSavedExams } = ExamStore()
  const { bioUser } = AuthStore()
  const socket = useSocket()

  useEffect(() => {
    if (exams.length === 0) {
      getSavedExams()
    }
  }, [exams.length])

  useEffect(() => {
    if (!socket) return

    if (bioUser) {
      socket.on(`test_${bioUser._id}`, (data: { paper: Objective }) => {
        console.log(data.paper)
        if (data.paper) {
          addRecordsToDB('last_question', [data.paper])
        }
      })
    }

    return () => {
      socket.off(`test_${bioUser?._id}`)
    }
  }, [bioUser?._id, socket])

  return (
    <QuestionContext.Provider value={null}>{children}</QuestionContext.Provider>
  )
}

export const useQuestionContext = () => useContext(QuestionContext)
