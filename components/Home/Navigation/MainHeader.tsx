import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import TraceHeader from './TraceHeader'
import { NavStore } from '@/src/zustand/notification/Navigation'
import HeaderWrapper from './HeaderWrapper'

export default function MainHeader() {
  const { setHeaderHeight } = NavStore()
  const pathname = usePathname()
  const divRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (divRef.current) {
        const height = divRef.current.getBoundingClientRect().height
        setHeaderHeight(pathname.includes('/home/friends') ? 0 : height)
      }
    }

    updateHeaderHeight()
    window.addEventListener('resize', updateHeaderHeight)
    return () => window.removeEventListener('resize', updateHeaderHeight)
  }, [pathname])

  return (
    <>
      {!pathname.includes('/home/friends') && (
        <>
          {pathname.includes('trace') ||
          pathname.includes('/home/questions') ? (
            <TraceHeader />
          ) : (
            <HeaderWrapper />
          )}
        </>
      )}
    </>
  )
}
