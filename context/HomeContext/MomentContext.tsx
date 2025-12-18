'use client'
import { createContext, useEffect, useContext, ReactNode } from 'react'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { MomentStore } from '@/src/zustand/post/Moment'

const MomentContext = createContext<null>(null)

interface MomentProviderProps {
  children: ReactNode
}

export const MomentProvider = ({ children }: MomentProviderProps) => {
  const { getSavedMoments } = MomentStore()
  const { user } = AuthStore()

  useEffect(() => {
    if (user) {
      getSavedMoments(user)
    }
  }, [user?._id])

  return (
    <MomentContext.Provider value={null}>{children}</MomentContext.Provider>
  )
}

export const useMomentContext = () => useContext(MomentContext)
