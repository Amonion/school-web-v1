'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect } from 'react'
import { AppStore } from '@/src/zustand/app/AppStore'
import { MessageStore } from '@/src/zustand/notification/Message'

const Header: React.FC = () => {
  const { getApp } = AppStore()
  const { setMessage } = MessageStore()

  useEffect(() => {
    getApp(`/company/`, setMessage)
  }, [])
  return (
    <div className="flex w-full bg-[var(--primary)] justify-center py-1 mb-5">
      <div className="w-full max-w-[1000px] px-3">
        <div className="flex">
          <Link href="/home" className="w-32 max-w-40">
            <Image
              style={{ height: 'auto' }}
              src="/images/logos/SchoolingLogo.png"
              loading="lazy"
              sizes="100vw"
              className="w-32"
              width={0}
              height={0}
              alt="Schooling Social Logo"
            />
          </Link>
          <div className="flex ml-auto items-center">
            <Link
              href="/sign-up"
              className="bg-[var(--secondary)] mr-3 text-[var(--text-secondary)] rounded-[5px] py-2 px-4"
            >
              Sign Up
            </Link>
            <Link
              href="/"
              className="bg-[var(--custom)] text-white rounded-[5px] py-2 px-4"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header
