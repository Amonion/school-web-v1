'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Footer from '@/components/Public/Footer'
import { useTheme } from '@/context/ThemeProvider'
import Link from 'next/link'

export default function NotFound() {
  const { theme } = useTheme()
  const router = useRouter()
  return (
    <>
      <div className="flex min-h-[100vh] w-full flex-1 flex-col items-center ">
        <div className="flex w-full bg-[var(--primary)] justify-center py-1 mb-5">
          <Image
            style={{ height: 'auto' }}
            src="/images/logos/SchoolingLogo.png"
            loading="lazy"
            sizes="100vw"
            className="w-32"
            width={0}
            height={0}
            alt="Schooling Social Logo"
          />
        </div>
        <div className="max-w-[1000px] px-4 flex flex-col items-center w-full my-auto pb-5">
          <div className="text-center text-2xl mb-5 text-[var(--text-secondary)]">
            Page Not Found
          </div>
          <Image
            src={
              theme === 'dark'
                ? `/images/NotFoundDark.png`
                : '/images/NotFoundLight.png'
            }
            alt="Media"
            width={0}
            height={0}
            sizes="100vw"
            className="max-w-[400px] w-full h-auto object-contain"
          />
          <div className="flex items-center">
            <div
              onClick={() => router.back()}
              className="mx-2 cursor-pointer py-2 px-3 text-[var(--custom)] rounded-[5px] border border-[var(--custom)]"
            >
              Go Back
            </div>
            <Link
              href={'/home'}
              className="mx-2 py-2 px-3 text-white bg-[var(--custom)] rounded-[5px] border border-[var(--custom)]"
            >
              Home Page
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    </>
  )
}
