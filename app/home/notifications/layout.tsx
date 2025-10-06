'use client'
// import Link from 'next/link'
// import { usePathname } from 'next/navigation'

export default function NotificationLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // const pathname = usePathname()
  return (
    <>
      <div className="body-card w-full px-1 mx-auto">
        {/* <div className="text-[var(-text-secondary)] w-full pt-5 text-xl mb-2 border-b border-[var(--border-color)]">
          <div className="flex w-full mb-1 justify-center items-center">
            <Link
              href={`/home/notifications`}
              className={`${
                pathname === '/home/notifications'
                  ? 'bg-[var(--custom)] text-white'
                  : 'text-[var(--custom)]'
              } notificationPill`}
            >
              Social
            </Link>
            <Link
              href={`/home/notifications/personal`}
              className={`${
                pathname.includes('/personal')
                  ? 'bg-[var(--custom)] text-white'
                  : 'text-[var(--custom)]'
              } notificationPill`}
            >
              Personal
            </Link>
            <Link
              href={`/home/notifications/official`}
              className={`${
                pathname.includes('/official')
                  ? 'bg-[var(--custom)] text-white'
                  : 'text-[var(--custom)]'
              } notificationPill`}
            >
              Official
            </Link>
          </div>
        </div> */}

        {children}
      </div>
    </>
  )
}
