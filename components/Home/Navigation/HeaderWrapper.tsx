import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { NavStore } from '@/src/zustand/notification/Navigation'
import TraceHeader from './TraceHeader'
import HomeHeader from './HomeHeader'
import OtherHeader from './OtherHeader'
import QuestionHeader from './QuestionHeader'
import { PostStore } from '@/src/zustand/post/Post'

export default function HeaderWrapper() {
  const { setHeaderHeight } = NavStore()
  const { postResults } = PostStore()
  const pathname = usePathname()
  const divRef = useRef<HTMLDivElement | null>(null)
  const [showHeader, setShowHeader] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isOutOfView, setIsOutOfView] = useState(false)

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (divRef.current) {
        const height = divRef.current.getBoundingClientRect().height
        setHeaderHeight(height)
      }
    }

    // Run once after render
    const timeout = setTimeout(() => {
      updateHeaderHeight()
    }, 100)

    window.addEventListener('resize', updateHeaderHeight)
    return () => {
      clearTimeout(timeout)
      window.removeEventListener('resize', updateHeaderHeight)
    }
  }, [pathname, postResults])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && lastScrollY > 100) {
        setShowHeader(false)
        setIsOutOfView(true)
      } else if (currentScrollY < lastScrollY && isOutOfView) {
        setShowHeader(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY, isOutOfView])

  return (
    <>
      <div
        ref={divRef}
        className={`w-full flex fixed top-0 z-40 sm:z-30 left-0 justify-center transition-transform duration-300 ease-in-out ${
          showHeader ? 'translate-y-0' : '-translate-y-full sm:-translate-y-0'
        }  `}
      >
        <div className="custom_container">
          <div className="w-full flex">
            <div className="sm:w-[270px] sm:min-w-[270px] xl:w-[300px] w-0" />
            <div className="flex-1 sm:px-4 py-2 overflow-x-auto sm:overflow-hidden border-b border-b-[var(--border)] relative sm:ml-5 md:mr-5  bg-[var(--primary)]">
              {pathname.includes('/home/trace') ? (
                <TraceHeader />
              ) : pathname === '/home' ? (
                <HomeHeader />
              ) : pathname === '/home/questions' ? (
                <QuestionHeader />
              ) : (
                <OtherHeader />
              )}
            </div>
            <div className="md:right-0 z-0 w-0 md:min-w-[270px] md:w-[270px] xl:w-[300px]" />
          </div>
        </div>
      </div>
    </>
  )
}
