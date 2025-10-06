'use client'
import { useTheme } from '@/context/ThemeProvider'
import Image from 'next/image'
export default function EmptyTab() {
  const { theme } = useTheme()

  return (
    <div className="w-full flex-col items-center flex justify-center">
      <div className="text-center mb-5 text-2xl text-[var(--text-secondary)] uppercase font-semibold">
        Schooling Trace
      </div>{' '}
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
      <div className="text-center text-[var(--custom)] font-semibold">
        Trace what you are looking for.
      </div>
    </div>
  )
}
