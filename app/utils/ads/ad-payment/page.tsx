'use client'
import Link from 'next/link'
import { appendForm, formatMoney } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState, useEffect } from 'react'
import AdStore from '@/src/zustand/team/Ad'
import { MessageStore } from '@/src/zustand/msgStore'
import AdHeader from '@/components/Utility/Ad/AdHeader'
import TransactionStore from '@/src/zustand/users/Transaction'
import PaymentStore from '@/src/zustand/team/Payment'
import { useRouter } from 'next/navigation'
import AdPaymentCard from '@/components/Utility/Ad/AdPaymentCard'

const CreateUserAd: React.FC = () => {
  const url = '/ads/'
  const { itemFormData, setItemForm, loadingAds, updateItem } = AdStore()
  const { walletForm } = TransactionStore()
  const [isPeriod, setPeriodList] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isChanged, setIsChanged] = useState(false)
  // const [quantity, setIsQuantity] = useState(1)
  const { setMessage } = MessageStore()
  const { getPayments, results } = PaymentStore()
  const router = useRouter()

  useEffect(() => {
    if (itemFormData.durationName && itemFormData.duration > 0) {
      setIsCompleted(true)
    } else {
      setIsCompleted(false)
    }

    if (itemFormData.quantity * itemFormData.duration > 365) {
      setIsCompleted(false)
    } else {
      setIsCompleted(true)
    }

    if (itemFormData.country) {
      getPayments(
        `/places/payments/?name=ad_payment&country=${itemFormData.country}`
      )
    }
  }, [itemFormData])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setItemForm(name as keyof typeof itemFormData, value)
    setIsChanged(true)
  }

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

    const inputsToValidate = [
      {
        name: 'description',
        value: itemFormData.description,
        rules: { blank: true, maxLength: 1000 },
        field: 'Duration name',
      },
      {
        name: 'durationName',
        value: itemFormData.durationName,
        rules: { blank: true, maxLength: 1000 },
        field: 'Duration name',
      },
      {
        name: 'charge',
        value: itemFormData.charge,
        rules: { blank: true, maxLength: 1000 },
        field: 'Charge',
      },
      {
        name: 'duration',
        value: itemFormData.duration,
        rules: { blank: true, maxLength: 1000 },
        field: 'Duration field',
      },
      {
        name: 'amount',
        value: Number(itemFormData.amount) * Number(itemFormData.quantity),
        rules: { blank: false, maxLength: 1000 },
        field: 'Amount field',
      },
      {
        name: 'quantity',
        value: itemFormData.quantity,
        rules: { blank: false, maxLength: 1000 },
        field: 'Amount field',
      },
      {
        name: 'publishedAt',
        value: itemFormData.publishedAt,
        rules: { blank: false, maxLength: 1000 },
        field: 'Published field',
      },
    ]
    const { messages } = validateInputs(inputsToValidate)
    const getFirstNonEmptyMessage = (
      messages: Record<string, string>
    ): string | null => {
      for (const key in messages) {
        if (messages[key].trim() !== '') {
          return messages[key]
        }
      }
      return null
    }

    const firstNonEmptyMessage = getFirstNonEmptyMessage(messages)
    if (firstNonEmptyMessage) {
      setMessage(firstNonEmptyMessage, false)
      return
    }

    e.preventDefault()
    const data = appendForm(inputsToValidate)
    updateItem(`${url}/${itemFormData._id}`, data, setMessage, () =>
      router.push(`/utils/ads/ad-review`)
    )
  }

  return (
    <div className="flex-1">
      <div className="mb-5">
        <AdHeader page={3} title="Ad Budget" />

        <div className="grid sm:grid-cols-2 gap-3 flex-1">
          {/* <div className="flex card_body w-full sm:w-auto flex-col">
            <div className="paymentTableRow">
              <div className="min-w-[110px] paymentTableRowLeft">Balance</div>
              <div className="flex-1 p-2">
                {itemFormData.currencySymbol}
                {formatMoney(walletForm.balance)}
              </div>
            </div>
            {itemFormData.durationName && (
              <div className="paymentTableRow">
                <div className="min-w-[110px] paymentTableRowLeft">Ad Rate</div>
                <div className="flex-1 p-2">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: itemFormData.description,
                    }}
                  />
                </div>
              </div>
            )}
            {itemFormData.durationName && (
              <div className="paymentTableRow">
                <div className="min-w-[110px] paymentTableRowLeft">
                  Min Deposit
                </div>
                <div className="flex-1 p-2">
                  {itemFormData.currencySymbol}
                  {formatMoney(itemFormData.amount)}
                </div>
              </div>
            )}

            {itemFormData.durationName && (
              <div className="paymentTableRow">
                <div className="min-w-[110px] paymentTableRowLeft">
                  Duration{' '}
                </div>
                <div className="flex-1 p-2">
                  {itemFormData.duration} Days{' '}
                  {`* ${itemFormData.quantity} = ${
                    itemFormData.quantity * itemFormData.duration
                  } Days`}
                </div>
              </div>
            )}

            {itemFormData.durationName && (
              <div className="paymentTableRow">
                <div className="min-w-[110px] paymentTableRowLeft">Total </div>
                <div className="flex-1 p-2">
                  {itemFormData.currencySymbol}

                  {formatMoney(itemFormData.amount * itemFormData.quantity)}
                </div>
              </div>
            )}
          </div> */}

          <AdPaymentCard />

          <div className="card_body w-full sm:w-auto">
            <div className="grid grid-lay">
              <div className="flex flex-col relative">
                <label className="label flex items-center w-full" htmlFor="">
                  Ad Period
                </label>
                <div
                  onClick={() => setPeriodList(!isPeriod)}
                  className="form-input cursor-pointer"
                >
                  {itemFormData.durationName
                    ? `${itemFormData.durationName}ly`
                    : 'Select Ad Period'}
                  <i className="ml-auto bi bi-caret-down-fill"></i>
                </div>
                {isPeriod && (
                  <div className="input_drop">
                    {results.map((item, index) => (
                      <div
                        onClick={() => {
                          setPeriodList(false)
                          setItemForm('duration', item.duration)
                          setItemForm('durationName', item.durationName)
                          setItemForm('description', item.description)
                          setItemForm('charge', item.charge)
                          setItemForm('amount', item.amount)
                          setIsChanged(true)
                        }}
                        key={index}
                        className="input_drop_list"
                      >
                        {item.durationName}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {itemFormData.durationName && (
                <>
                  <div className="flex flex-col relative">
                    <label className="label" htmlFor="">
                      Ad Duration
                    </label>
                    <div className="relative">
                      <input
                        className="form-input"
                        name="quantity"
                        value={itemFormData.quantity}
                        onChange={(e) => {
                          const value = Math.max(1, Number(e.target.value)) // force >= 0
                          setItemForm('quantity', value)
                          // setIsQuantity(value)
                          setIsChanged(true)
                        }}
                        type="number"
                        min={1}
                        placeholder="Enter quantity"
                      />
                      {itemFormData.quantity * itemFormData.duration > 365 && (
                        <div className="text-sm text-[var(--custom)]">
                          Maximum days is 365 days.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="label" htmlFor="">
                      To Publish On
                    </label>
                    <div className="flex justify-between">
                      <div className="form-input sm w-input mr-6">
                        {itemFormData.publishedAt
                          ? `${itemFormData.publishedAt}`
                          : `Set Date & Time`}
                      </div>

                      <label
                        className="ml-auto rounded-[5px] relative cursor-pointer flex justify-center items-center px-4 h-10 bg-[var(--border-background)]"
                        htmlFor="date"
                      >
                        <i className="cursor-pointer bi bi-calendar-week absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"></i>
                        <input
                          id="date"
                          className="sm opacity-0 w-8 cursor-pointer"
                          name="publishedAt"
                          type="date"
                          min={new Date(Date.now() + 24 * 60 * 60 * 1000)
                            .toISOString()
                            .slice(0, 10)}
                          max={new Date(Date.now() + 24 * 60 * 60 * 1000 * 5)
                            .toISOString()
                            .slice(0, 10)}
                          onChange={handleInputChange}
                        />
                      </label>
                    </div>
                    <div className="text-sm text-[var(--custom)]">
                      You can set date to activate your ad or it will start
                      immediately.
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card_body mt-auto flex justify-end">
        <Link
          href={'/utils/ads/create-ad-target'}
          className="custom_btn ml-auto mr-3"
        >
          Go Back
        </Link>
        {loadingAds ? (
          <div className={`custom_btn neutral disabled`}>Processing</div>
        ) : isCompleted && !isChanged ? (
          <Link href={'/utils/ads/ad-review'} className={`custom_btn neutral`}>
            Next
          </Link>
        ) : isCompleted && isChanged ? (
          <div onClick={handleSubmit} className={`custom_btn neutral`}>
            Save & Proceed
          </div>
        ) : (
          <div className={`custom_btn neutral disabled`}>Save & Proceed</div>
        )}
      </div>
    </div>
  )
}

export default CreateUserAd
