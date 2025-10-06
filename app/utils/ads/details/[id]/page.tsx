'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect } from 'react'
import AdStore from '@/src/zustand/team/Ad'
import { useParams, useRouter } from 'next/navigation'
import AdCreateCard from '@/components/Utility/Ad/AdCreateCard'
import AdTargetCard from '@/components/Utility/Ad/AdTargetCard'
import AdPaymentCard from '@/components/Utility/Ad/AdPaymentCard'
import { MessageStore } from '@/src/zustand/msgStore'

const CreateUserAd: React.FC = () => {
  const { itemFormData, loadingAds, getAd, updateItem } = AdStore()
  const { id } = useParams()
  const router = useRouter()
  const { setMessage } = MessageStore()
  const url = '/ads'

  useEffect(() => {
    if (id) {
      getAd(`/ads/${id}`)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    updateItem(
      `${url}/${itemFormData._id}`,
      { status: false, onReview: false, isEditing: true },
      setMessage,
      () => router.replace(`/utils/ads/create-ads`)
    )
  }

  return (
    <div className="flex-1">
      <div className="mb-5">
        <div className="grid sm:grid-cols-2 gap-3 flex-1">
          <AdCreateCard />

          <AdTargetCard />

          <AdPaymentCard />

          <div className="flex card_body items-center sm:w-auto flex-col">
            <Image
              src="/images/PostAdDark.png"
              alt="Media"
              width={0}
              sizes="100vw"
              height={0}
              style={{ width: '150px', height: 'auto' }}
              objectFit="contain"
            />
            <div className="text-center text-sm text-[var(--custom)] mt-2">
              {itemFormData.onReview
                ? 'This Ad is currently on review, you can still make changes if you want'
                : !itemFormData.status
                ? 'This Ad is not completed yet, click the button below to continue completion'
                : ''}
            </div>
            {(itemFormData.onReview || !itemFormData.status) && (
              <div onClick={handleSubmit} className="custom_btn neutral mt-5">
                Edit Ad
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card_body sharp mt-auto flex justify-end">
        {loadingAds ? (
          <div className={`custom_btn neutral disabled`}>Processing</div>
        ) : (
          <Link href={'/utils/ads'} className="custom_btn ml-auto mr-3">
            Go Back
          </Link>
        )}
      </div>
    </div>
  )
}

export default CreateUserAd
