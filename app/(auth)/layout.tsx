'use client'
import Image from 'next/image'
import { useEffect } from 'react'
import Footer from '@/components/Public/Footer'
import Header from '@/components/Public/Header'
import { PolicyStore } from '@/src/zustand/app/Policy'
import { MessageStore } from '@/src/zustand/notification/Message'
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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
        <div className="max-w-[1000px] w-full my-auto sm:pb-5">
          <div className="bg-[var(--white)] sm:rounded-[10px] min-h-[100vh] sm:min-h-[500px] sm:flex sm:mx-3 overflow-hidden">
            <div
              className="sm:w-1/2 relative bg-cover bg-center bg-no-repeat sm:min-h-[500px] sm:h-full h-[250px] sm:block bg-[var(--custom-color)]"
              style={{
                backgroundImage: `url('/images/auth.png')`,
              }}
            ></div>
            <div className="w-full sm:hidden flex justify-center -mt-5 z-20 relative">
              <div className="rounded-full bg-[var(--primary)] p-1 min-w-[60px] w-[60px] h-[60px] flex justify-center items-center">
                <Image
                  src="/images/active-icon.png"
                  alt="Media"
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="w-[50px] min-w-[50px] h-[50px] object-cover"
                />
              </div>
            </div>
            <div className="w-full sm:w-1/2 py-5 sm:px-5 px-3 flex flex-col items-center">
              {children}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  )
}
