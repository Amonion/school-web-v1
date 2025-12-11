'use client'
// import { playPopSound } from '@/lib/sound'
import useSocket from '@/src/useSocket'
import { AccountStore } from '@/src/zustand/Trace/Account'
import { PeopleStore } from '@/src/zustand/Trace/People'
import { PostStore } from '@/src/zustand/Trace/TracePosts'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { createContext, useEffect, useContext, ReactNode, useMemo } from 'react'

const TraceContext = createContext<{
  socket: ReturnType<typeof useSocket> | null
}>({
  socket: null,
})

interface TraceProviderProps {
  children: ReactNode
}

export const TraceProvider = ({ children }: TraceProviderProps) => {
  const socket = useSocket()
  const { postResults, getSavedPosts } = PostStore()
  const { getSavedAccounts } = AccountStore()
  const { getSavedPeople } = PeopleStore()
  const { user } = AuthStore()

  useEffect(() => {
    if (postResults.length === 0 && user) {
      getSavedPosts(user)
      getSavedAccounts(user)
      getSavedPeople()
    }
  }, [user])

  const value = useMemo(() => ({ socket }), [socket])

  return <TraceContext.Provider value={value}>{children}</TraceContext.Provider>
}

export const useTraceContext = () => useContext(TraceContext)
