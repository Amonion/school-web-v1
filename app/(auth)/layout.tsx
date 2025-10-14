'use client'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Footer from '@/components/Public/Footer'
import Header from '@/components/Public/Header'
import PolicyMenu from '@/components/Public/PolicyMenu'
import { PolicyStore } from '@/src/zustand/app/Policy'
import { MessageStore } from '@/src/zustand/notification/Message'
import TermsMenu from '@/components/Public/TermsMenu'
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const { getPolicies, getTerms } = PolicyStore()
  const { setMessage } = MessageStore()

  useEffect(() => {
    getPolicies(`/company/policy/?page_size=100&category=Policy`, setMessage)
    getTerms(`/company/policy/?page_size=100&category=Terms`, setMessage)
  }, [])

  return (
    <>
      <div className="flex min-h-[100vh] w-full flex-1 flex-col items-center ">
        <Header />
        <div className="max-w-[1000px] w-full my-auto pb-5">
          <div className="bg-[var(--white)] rounded-[10px] min-h-[500px] flex mx-3 overflow-hidden">
            {pathname === '/terms-conditions' ? (
              <TermsMenu />
            ) : pathname === '/privacy-policy' ? (
              <PolicyMenu />
            ) : (
              <div className="w-1/2 sm:block hidden bg-[var(--custom-color)]">
                <Image
                  src="/images/auth.png"
                  alt="Media"
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="w-full sm:w-1/2 py-5 sm:px-5 px-1 flex flex-col items-center">
              {children}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  )
}
