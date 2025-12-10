'use client'
import { MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { BioUserSchoolInfoStore } from '@/src/zustand/user/BioUserSchoolInfo'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
// import { useRouter } from "next/navigation";
export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // const router = useRouter();
  const pathname = usePathname()
  const { bioUserSchoolInfo, bioUserState } = AuthStore()
  const { setMessage } = MessageStore()
  const { getPastSchools } = BioUserSchoolInfoStore()
  useEffect(() => {
    if (!bioUserSchoolInfo) return
    BioUserSchoolInfoStore.setState({ bioUserSchoolForm: bioUserSchoolInfo })
    getPastSchools(
      `/biousers-school/${bioUserSchoolInfo.bioUserId}`,
      setMessage
    )
  }, [bioUserSchoolInfo])

  return (
    <>
      <div className="">
        <div className=" pt-2 flex overflow-auto">
          <Link
            href={`/home/verification/education`}
            className={`tab ${
              pathname === '/home/verification/education' ? 'active' : ''
            }`}
          >
            Current
            {bioUserState?.isEducation ? (
              <i className="bi bi-check-circle text-[10px] ml-2 text-green-400"></i>
            ) : (
              <i className="bi bi-question-circle text-[10px] text-[var(--text-primary)] ml-2"></i>
            )}
          </Link>
          {bioUserState?.isEducation ? (
            <Link
              href={`/home/verification/education/history`}
              className={`tab ${
                pathname === '/home/verification/education/history'
                  ? 'active'
                  : ''
              }`}
            >
              History
              {bioUserState?.isEducationHistory ? (
                <i className="bi bi-check-circle text-[10px] ml-2 text-green-400"></i>
              ) : (
                <i className="bi bi-question-circle text-[10px] text-[var(--text-primary)] ml-2"></i>
              )}
            </Link>
          ) : (
            <div
              className={`tab ${
                pathname === '/home/verification/education/history'
                  ? 'active'
                  : ''
              }`}
            >
              History
              <i className="bi bi-question-circle text-[10px] text-[var(--text-primary)] ml-2"></i>
            </div>
          )}
          {bioUserState?.isEducationHistory ? (
            <Link
              href={`/home/verification/education/documents`}
              className={`tab ${
                pathname === '/home/verification/education/documents'
                  ? 'active'
                  : ''
              }`}
            >
              Document
              {bioUserState?.isEducationDocument ? (
                <i className="bi bi-check-circle text-[10px] ml-2 text-green-400"></i>
              ) : (
                <i className="bi bi-question-circle text-[10px] text-[var(--text-primary)] ml-2"></i>
              )}
            </Link>
          ) : (
            <div
              className={`tab ${
                pathname === '/home/verification/education/documents'
                  ? 'active'
                  : ''
              }`}
            >
              Document
              <i className="bi bi-question-circle text-[10px] text-[var(--text-primary)] ml-2"></i>
            </div>
          )}
        </div>
        {children}
      </div>
    </>
  )
}
