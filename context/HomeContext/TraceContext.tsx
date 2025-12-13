'use client'
// import { playPopSound } from '@/lib/sound'
import { AccountStore } from '@/src/zustand/Trace/Account'
import { PeopleStore } from '@/src/zustand/Trace/People'
import { PostStore } from '@/src/zustand/Trace/TracePosts'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { usePathname, useSearchParams } from 'next/navigation'
import { createContext, useEffect, useContext, ReactNode } from 'react'

const TraceContext = createContext<null>(null)

interface TraceProviderProps {
  children: ReactNode
}

export const TraceProvider = ({ children }: TraceProviderProps) => {
  const { postResults, getSavedPosts, getQueryPosts } = PostStore()
  const { getSavedAccounts } = AccountStore()
  const { getSavedPeople } = PeopleStore()
  const { user } = AuthStore()
  const pathName = usePathname()

  const searchParams = useSearchParams()
  const q = searchParams.get('q')

  useEffect(() => {
    if (q && user) {
      if (pathName === '/home/trace') {
        getQueryPosts(
          `/posts/get?content=${q}&username=${q}&displayName=${q}&myId=${user._id}&page=1&limit=20`
        )
      }
    } else if (postResults.length === 0 && user) {
      getSavedPosts(user)
      getSavedAccounts(user)
      getSavedPeople()
    }
  }, [user])

  return <TraceContext.Provider value={null}>{children}</TraceContext.Provider>
}

export const useTraceContext = () => useContext(TraceContext)
