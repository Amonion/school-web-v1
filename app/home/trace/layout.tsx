'use client'
import { PostStore } from '@/src/zustand/post/Post'
import { AccountStore } from '@/src/zustand/Trace/Account'
import { PeopleStore } from '@/src/zustand/Trace/People'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

const TraceLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = AuthStore()
  const pathName = usePathname()
  const { postResults, getSavedPosts, getQueryPosts } = PostStore()
  const { getSavedAccounts } = AccountStore()
  const { getSavedPeople } = PeopleStore()
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
  return (
    <>
      <div className="flex flex-col items-center w-full overflow-auto">
        {children}
      </div>
    </>
  )
}

export default TraceLayout
