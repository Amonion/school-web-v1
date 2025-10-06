// AdFooter.tsx
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import AdStore from '@/src/zustand/finance/Ad'

interface AdFooterProps {
  isCompleted: boolean
  loading: boolean
  urlFront: string
  onClick: (e: React.FormEvent) => void
  urlBack?: string
}

export const AdFooter: React.FC<AdFooterProps> = ({
  isCompleted,
  loading,
  urlFront,
  onClick,
  urlBack,
}) => {
  const pathName = usePathname()
  const { user } = AuthStore()
  const { itemFormData, getAd } = AdStore()
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    if (!itemFormData._id && user) {
      getAd(`/ads/drafted/?username=${user?.username}`)
    }
    if (itemFormData._id) {
      setIsSaved(true)
    }
  }, [user, itemFormData._id])

  return (
    <div className="card_body mt-auto flex justify-end">
      {pathName !== urlBack && (
        <Link href={String(urlBack)} className="custom_btn ml-auto mr-3">
          Go Back
        </Link>
      )}
      {loading ? (
        <div className={`custom_btn neutral disabled`}>Processing</div>
      ) : isCompleted ? (
        <div
          onClick={(e) => onClick(e as unknown as React.FormEvent)}
          className={`custom_btn neutral`}
        >
          Save & Proceed
        </div>
      ) : isSaved ? (
        <Link href={urlFront} className={`custom_btn neutral`}>
          Next
        </Link>
      ) : (
        <div className={`custom_btn neutral disabled`}>Save & Proceed</div>
      )}
    </div>
  )
}
