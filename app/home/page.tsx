'use client'
import HomeMediaHolder from '@/components/Home/Media/HomeMediaHolder'
import HomeNews from '@/components/News/HomeNews'
import Stories from '@/components/News/Stories'
import Post from '@/components/Home/Posts/Post'
import { NavStore } from '@/src/zustand/notification/Navigation'
import { useEffect } from 'react'
const Home: React.FC = () => {
  const { togglePostBox, scrollUp } = NavStore()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [scrollUp])

  useEffect(() => {
    let startY = 0

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY
      const scrollY = window.scrollY
      if (scrollY === 0 && currentY > startY + 50) {
        e.preventDefault()
        runMyFunction()
      }
    }

    const runMyFunction = () => {
      console.log('✅ Custom pull-to-refresh triggered')
    }

    document.addEventListener('touchstart', handleTouchStart, {
      passive: false,
    })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
    }
  }, [])
  return (
    <>
      <HomeMediaHolder />
      <HomeNews />
      <Stories />
      <Post />

      <div
        onClick={togglePostBox}
        className="sm:hidden bg-[var(--custom)] w-10 h-10 rounded-full fixed text-white right-3 bottom-[80px] flex justify-center items-center cursor-pointer"
      >
        <i className="bi bi-pen common-icon"></i>
      </div>
    </>
  )
}

export default Home
