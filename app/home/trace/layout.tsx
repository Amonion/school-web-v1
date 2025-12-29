'use client'
import TracePostMediaDisplay from '@/components/Home/Trace/PostResources/TracePostMediaDisplay'
import { PostStore } from '@/src/zustand/Trace/TracePosts'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

const TraceLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = AuthStore()
  const pathName = usePathname()
  const { getQueryPosts } = PostStore()
  const searchParams = useSearchParams()
  const q = searchParams.get('q')

  useEffect(() => {
    if (q && user) {
      if (pathName === '/home/trace') {
        getQueryPosts(
          `/posts/get?content=${q}&username=${q}&displayName=${q}&myId=${user._id}&page=1&limit=20`
        )
      }
    }
  }, [user])
  return (
    <>
      <div className="flex flex-col relative items-center w-full overflow-auto">
        {children}
      </div>
      <TracePostMediaDisplay />
    </>
  )
}

export default TraceLayout
