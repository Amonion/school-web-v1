'use client'
import { useTheme } from '@/context/ThemeProvider'
import Image from 'next/image'

export default function EmptySearch() {
  const { theme } = useTheme()

  return (
    <div className="w-full flex-col pt-5 items-center flex justify-center">
      <div className="text-center text-[var(--custom)] font-semibold  mb-10">
        Keep Tracing...
      </div>
      <Image
        style={{ width: '100%', maxWidth: '300px', height: 'auto' }}
        src={`${
          theme === 'light' ? '/images/trace.png' : '/images/tracel.png'
        } `}
        loading="lazy"
        sizes="100vw"
        className="w-full mb-5 max-w-[300]"
        width={0}
        height={0}
        alt="Schooling Trace"
      />
      <div className="text-center text-2xl text-[var(--text-secondary)] uppercase font-semibold">
        No Result found
      </div>{' '}
    </div>
  )
}
