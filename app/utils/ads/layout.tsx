'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import AdStore, { AdEmpty } from '@/src/zustand/finance/Ad'

export default function AdLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user } = AuthStore()
  const { itemFormData, getDraftAd, setAdStage, adStage } = AdStore()
  const pathName = usePathname()
  const paths = ['ad-payment', 'ad-review', 'create-ad-target', 'create-ads']

  useEffect(() => {
    if (!itemFormData._id && user) {
      getDraftAd(`/ads/drafted/?username=${user?.username}`)
    }

    if (
      itemFormData.onReview &&
      paths.some((path) => pathName.includes(path))
    ) {
      AdStore.setState({ itemFormData: AdEmpty })
    }

    if (adStage === 2 && itemFormData.durationName) {
      setAdStage(3)
    } else if (
      adStage === 1 &&
      itemFormData.distribution &&
      itemFormData.category &&
      itemFormData._id
    ) {
      setAdStage(2)
    } else if (
      itemFormData.picture &&
      itemFormData.username &&
      itemFormData.displayName &&
      itemFormData.media.length > 0
    ) {
      setAdStage(1)
    }
  }, [user, itemFormData])
  return (
    <div className="flex-1 flex-col text-[var(--text-primary)]">
      <div className="flex w-full justify-between items-center mb-2 px-2 md:px-0"></div>
      <div className={`flex-1 flex flex-col`}>{children}</div>
    </div>
  )
}
