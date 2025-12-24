'use client'
import { createContext, useEffect, useContext, ReactNode } from 'react'
import ExamStore from '@/src/zustand/exam/Exam'

const QuestionContext = createContext<null>(null)

interface QuestionProviderProps {
  children: ReactNode
}

export const QuestionProvider = ({ children }: QuestionProviderProps) => {
  const { exams, getSavedExams } = ExamStore()

  useEffect(() => {
    if (exams.length === 0) {
      getSavedExams()
    }
  }, [exams.length])

  return (
    <QuestionContext.Provider value={null}>{children}</QuestionContext.Provider>
  )
}

export const useQuestionContext = () => useContext(QuestionContext)
