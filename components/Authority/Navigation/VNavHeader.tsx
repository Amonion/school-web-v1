import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { NavStore } from '@/src/zustand/notification/Navigation'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import OfficeStore from '@/src/zustand/utility/Office'
import VNavigationRouter from '@/components/VNavigationRouter'

export default function VNavHeader() {
  const router = useRouter()
  const { bioUser } = AuthStore()
  const pathname = usePathname()
  const { clearNav } = NavStore()
  const { officeForm } = OfficeStore()

  useEffect(() => {
    clearNav()
  }, [router, pathname])

  return (
    <>
      <div className="flex items-start pt-2">
        {officeForm && officeForm.logo && (
          <Image
            className="object-cover rounded-full mr-2"
            src={String(officeForm.logo)}
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
          <div className="text-[var(--custom)]">
            {' '}
            {`@${bioUser?.bioUserUsername}`}
          </div>
        </div>
      </div>
      <VNavigationRouter />
    </>
  )
}
