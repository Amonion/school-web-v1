'use client'
import Link from 'next/link'
import Image from 'next/image'
import { formatMoney } from '@/lib/helpers'
import AdStore from '@/src/zustand/team/Ad'
import { MessageStore } from '@/src/zustand/msgStore'
import AdHeader from '@/components/Utility/Ad/AdHeader'
import TransactionStore from '@/src/zustand/users/Transaction'
import { useRouter } from 'next/navigation'
import AdCreateCard from '@/components/Utility/Ad/AdCreateCard'
import AdTargetCard from '@/components/Utility/Ad/AdTargetCard'
import AdPaymentCard from '@/components/Utility/Ad/AdPaymentCard'

const CreateUserAd: React.FC = () => {
  const url = '/ads/publish'
  const { itemFormData, loadingAds, updateItem } = AdStore()
  const { walletForm } = TransactionStore()
  const { setMessage } = MessageStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    if (walletForm.balance < itemFormData.amount * itemFormData.quantity) {
      setMessage(
        `Sorry, your balance ${walletForm.currencySymbol}${formatMoney(
          walletForm.balance
        )} is less than the total amount ${
          walletForm.currencySymbol
        }${formatMoney(itemFormData.amount * itemFormData.quantity)}`,
        false
      )
      return
    }
    e.preventDefault()
    updateItem(`${url}/${itemFormData._id}`, {}, setMessage, () =>
      router.replace(`/utils/ads`)
    )
  }

  return (
    <div className="flex-1">
      <div className="mb-5">
        <AdHeader page={4} title="Ad Review" />

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
              Once published, it will be on review to ensure it does not contain
              prohibited contents. This may take up to 24 hours
            </div>
            <div onClick={handleSubmit} className="custom_btn neutral mt-5">
              Publish For Review
            </div>
          </div>
        </div>
      </div>

      <div className="card_body sharp mt-auto flex justify-end">
        {loadingAds ? (
          <div className={`custom_btn neutral disabled`}>Processing</div>
        ) : (
          <Link
            href={'/utils/ads/ad-payment'}
            className="custom_btn ml-auto mr-3"
          >
            Go Back
          </Link>
        )}
      </div>
    </div>
  )
}

export default CreateUserAd
