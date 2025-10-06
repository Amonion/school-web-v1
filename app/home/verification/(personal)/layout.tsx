'use client'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function PersonalLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const { bioUserState } = AuthStore()

  return (
    <>
      <div className="">
        <div className=" pt-2  mb-10 flex overflow-auto">
          <Link
            href={`/home/verification`}
            className={`tab ${
              pathname === '/home/verification' ? 'active' : ''
            }`}
          >
            Bio
            {bioUserState?.isBio ? (
              <i className="bi bi-check-circle text-[10px] ml-1 text-green-400"></i>
            ) : (
              <i className="bi bi-question-circle text-[10px] text-[var(--text-primary)] ml-1"></i>
            )}
          </Link>
          {bioUserState?.isBio ? (
            <Link
              href={`/home/verification/origin`}
              className={`tab ${
                pathname === '/home/verification/origin' ? 'active' : ''
              }`}
            >
              Origin
              {bioUserState?.isOrigin ? (
                <i className="bi bi-check-circle text-[10px] ml-1 text-green-400"></i>
              ) : (
                <i className="bi bi-question-circle text-[10px] text-[var(--text-primary)] ml-1"></i>
              )}
            </Link>
          ) : (
            <div
              className={`tab ${
                pathname === '/home/verification/origin' ? 'active' : ''
              }`}
            >
              Origin
              <i className="bi bi-question-circle text-[10px] text-[var(--text-primary)] ml-1"></i>
            </div>
          )}
          {bioUserState?.isOrigin ? (
            <Link
              href={`/home/verification/contact`}
              className={`tab ${
                pathname === '/home/verification/contact' ? 'active' : ''
              }`}
            >
              Contact
              {bioUserState?.isContact ? (
                <i className="bi bi-check-circle text-[10px] ml-1 text-green-400"></i>
              ) : (
                <i className="bi bi-question-circle text-[10px] text-[var(--text-primary)] ml-1"></i>
              )}
            </Link>
          ) : (
            <div
              className={`tab ${
                pathname === '/home/verification/contact' ? 'active' : ''
              }`}
            >
              Contact
              <i className="bi bi-question-circle text-[10px] text-[var(--text-primary)] ml-1"></i>
            </div>
          )}
          {bioUserState?.isContact ? (
            <Link
              href={`/home/verification/related`}
              className={`tab ${
                pathname === '/home/verification/related' ? 'active' : ''
              }`}
            >
              Related
              {bioUserState?.isRelated ? (
                <i className="bi bi-check-circle text-[10px] ml-1 text-green-400"></i>
              ) : (
                <i className="bi bi-question-circle text-[10px] text-[var(--text-primary)] ml-1"></i>
              )}
            </Link>
          ) : (
            <div
              className={`tab ${
                pathname === '/home/verification/related' ? 'active' : ''
              }`}
            >
              Related
              <i className="bi bi-question-circle text-[10px] text-[var(--text-primary)] ml-1"></i>
            </div>
          )}

          {bioUserState?.isRelated ? (
            <Link
              href={`/home/verification/document`}
              className={`tab ${
                pathname === '/home/verification/document' ? 'active' : ''
              }`}
            >
              Document
              {bioUserState?.isDocument ? (
                <i className="bi bi-check-circle text-[10px] ml-1 text-green-400"></i>
              ) : (
                <i className="bi bi-question-circle text-[10px] text-[var(--text-primary)] ml-1"></i>
              )}
            </Link>
          ) : (
            <div
              className={`tab ${
                pathname === '/home/verification/document' ? 'active' : ''
              }`}
            >
              Document
              <i className="bi bi-question-circle text-[10px] text-[var(--text-primary)] ml-1"></i>
            </div>
          )}
        </div>
        {children}
      </div>
    </>
  )
}
