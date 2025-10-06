'use client'
import { useTheme } from '@/context/ThemeProvider'
import Image from 'next/image'

export default function Monetization() {
  const { theme } = useTheme()

  return (
    <div className="card_body sharp flex items-center justify-center min-h-[50vh] flex-1">
      <div className="flex flex-col items-center">
        <div className="text-center text-[var(--custom)] mb-3 text-2xl">
          Account Monetization Coming Soon
        </div>
        <Image
          className="m-auto max-w-[400px] mb-3"
          src={
            theme === 'dark'
              ? '/images/darkMonetize.png'
              : '/images/lightMonetize.png'
          }
          loading="lazy"
          alt="username"
          sizes="100vw"
          height={0}
          width={0}
          style={{ height: 'auto', width: '80%' }}
        />
        <div className="text-center max-w-[500px] mb-5 text-lg">
          {`Keep growing your account while we prepare account monetization
          policy. You will be notified about your country's eligibility.`}
        </div>
      </div>
    </div>
  )
}
