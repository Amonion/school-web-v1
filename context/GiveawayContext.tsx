'use client'
import { createContext, useEffect, useContext, ReactNode } from 'react'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import WeekendStore from '@/src/zustand/exam/Weekend'

const GiveawayContext = createContext<null>(null)

interface GiveawayProviderProps {
  children: ReactNode
}

export const GiveawayProvider = ({ children }: GiveawayProviderProps) => {
  const { giveaways, getSavedGiveaways } = WeekendStore()
  const { user } = AuthStore()

  useEffect(() => {
    if (user && giveaways.length === 0) {
      getSavedGiveaways(user)
    }
  }, [user?._id])

  return (
    <GiveawayContext.Provider value={null}>{children}</GiveawayContext.Provider>
  )
}

export const useGiveawayContext = () => useContext(GiveawayContext)
