'use client'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NotificationLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const { bioUserState } = AuthStore()

  return (
    <>
      <div className="body-card w-full mx-auto">
        {bioUserState && bioUserState.activeOffice.position === 'Owner' && (
          <div className="text-[var(-text-secondary)] sticky top-0 text-xl mb-2 border-b border-[var(--border-color)]">
            <div className="ml-auto flex mb-1 justify-center items-center">
              <Link
                href={`/school/messages`}
                className={`${
                  !pathname.includes('/social')
                    ? 'bg-[var(--custom)] text-white'
                    : 'text-[var(--custom)]'
                } mx-2 sm:mx-3 py-1 px-5 rounded-[25px] text-sm border border-[var(--custom)]`}
              >
                Official
              </Link>
              <Link
                href={`/school/messages/social`}
                className={`${
                  pathname.includes('/social')
                    ? 'bg-[var(--custom)] text-white'
                    : 'text-[var(--custom)]'
                } mx-2 sm:mx-3 py-1 px-5 rounded-[25px] text-sm border border-[var(--custom)]`}
              >
                Social
              </Link>
            </div>
          </div>
        )}

        {children}
      </div>
    </>
  )
}
