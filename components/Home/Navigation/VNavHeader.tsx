import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { NavStore } from '@/src/zustand/notification/Navigation'
import { AuthStore } from '@/src/zustand/user/AuthStore'

export default function VNavHeader() {
  const router = useRouter()
  const { user } = AuthStore()
  const pathname = usePathname()
  const { clearNav } = NavStore()

  useEffect(() => {
    clearNav()
  }, [router, pathname])

  return (
    <>
      <div className="flex items-start pt-2">
        {user && (
          <Image
            className="object-cover rounded-full mr-2"
            src={user.picture ? String(user.picture) : '/images/avatar.jpg'}
            loading="lazy"
            alt="username"
            sizes="100vw"
            height={0}
            width={0}
            style={{ height: '50px', width: '50px' }}
          />
        )}
        <div>
          <div className="text-lg mb-1">Welcome back</div>
          <div className="text-[var(--custom)]"> {`@${user?.username}`}</div>
        </div>
      </div>
    </>
  )
}
