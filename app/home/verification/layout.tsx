'use client'
import { MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const { bioUserState } = AuthStore()
  const { setMessage } = MessageStore()
  const [isProfile, setProfile] = useState(false)
  const [isEducation, setEducation] = useState(false)
  const [isPublic, setPublic] = useState(false)

  useEffect(() => {
    if (bioUserState?.isPublic) {
      setPublic(true)
    }
    if (
      bioUserState?.isEducation &&
      bioUserState.isEducationHistory &&
      bioUserState.isEducationDocument
    ) {
      setEducation(true)
    }

    if (
      bioUserState?.isBio &&
      bioUserState.isOrigin &&
      bioUserState.isContact &&
      bioUserState.isRelated &&
      bioUserState.isDocument
    ) {
      setProfile(true)
    }
  }, [bioUserState])
  return (
    <>
      <div className="body-card pb-[55px] h-full sm:pb-0 w-full">
        <div className="post_card h-full">
          <div className="text-[var(--text-secondary)] pb-1 uppercase mb-4 border-b border-[var(--border)]">
            Verification
          </div>
          <div className="flex flex-wrap justify-center">
            <Link
              href={`/home/verification`}
              className={`tab_button ${
                !pathname.includes('education') && !pathname.includes('public')
                  ? 'active'
                  : ''
              }`}
            >
              Profile
              {isProfile ? (
                <i className="bi bi-check-circle ml-1 text-[10px] text-green-400"></i>
              ) : (
                <i className="bi bi-question-circle ml-1 text-[10px]"></i>
              )}
            </Link>
            {isProfile ? (
              <Link
                href={`/home/verification/public`}
                className={`tab_button ${
                  pathname.includes('/home/verification/public') ? 'active' : ''
                }`}
              >
                Public{' '}
                {isPublic ? (
                  <i className="bi bi-check-circle ml-1 text-[10px] text-green-400"></i>
                ) : (
                  <i className="bi bi-question-circle ml-1 text-[10px]"></i>
                )}
              </Link>
            ) : (
              <div
                onClick={() =>
                  setMessage('Complete your education verification.', false)
                }
                className={`tab_button ${
                  pathname.includes('/home/verification/public') ? 'active' : ''
                }`}
              >
                Public{' '}
                <i className="bi bi-question-circle text-[var(--text-primary)] ml-1 text-[10px]"></i>
              </div>
            )}
            {isPublic ? (
              <Link
                href={`/home/verification/education`}
                className={`tab_button ${
                  pathname.includes('/home/verification/education')
                    ? 'active'
                    : ''
                }`}
              >
                Education
                {isEducation ? (
                  <i className="bi bi-check-circle ml-1 text-[10px] text-green-400"></i>
                ) : (
                  <i className="bi bi-question-circle ml-1 text-[10px]"></i>
                )}
              </Link>
            ) : (
              <div
                onClick={() =>
                  setMessage('Complete your profile verification.', false)
                }
                className={`tab_button`}
              >
                Education
                <i className="bi bi-question-circle text-[var(--text-primary)] ml-1 text-[10px]"></i>
              </div>
            )}
          </div>
          {children}
        </div>
      </div>
    </>
  )
}
