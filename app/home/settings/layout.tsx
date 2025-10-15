'use client'
// import BankApplicationSheet from '@/components/Home/Verification/BankApplicationSheet'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  return (
    <>
      <div className="body-card pb-[55px] sm:pb-0 w-full mx-auto">
        <div className="post_card min-h-[85vh]">
          <div className="text-[var(--text-secondary)] pb-1 uppercase mb-4 border-b border-[var(--border)]">
            Settings
          </div>
          <div className="pt-2 mb-5 flex flex-wrap justify-center">
            <Link
              href={`/home/settings`}
              className={`tab_button ${
                pathname === '/home/settings' ? 'active' : ''
              }`}
            >
              Profile
            </Link>
            {/* <Link
              href={`/home/settings/set-official`}
              className={`tab_button ${
                pathname === '/home/settings/set-official' ? 'active' : ''
              }`}
            >
              Official
            </Link> */}
            <Link
              href={`/home/settings/set-social`}
              className={`tab_button ${
                pathname === '/home/settings/set-social' ? 'active' : ''
              }`}
            >
              Social
            </Link>
            {/* <Link
              href={`/home/settings/set-finance`}
              className={`tab_button ${
                pathname === '/home/settings/set-finance' ? 'active' : ''
              }`}
            >
              Finance
            </Link> */}
          </div>
          {children}
        </div>
      </div>
      {/* <BankApplicationSheet /> */}
    </>
  )
}
