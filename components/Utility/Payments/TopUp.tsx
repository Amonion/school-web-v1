'use client'
import Image from 'next/image'
import type PaystackInline from '@paystack/inline-js'
import { CirclePlus } from 'lucide-react'
// import Paystack from '@paystack/inline-js'
import { useEffect, useState } from 'react'
import { formatMoney } from '@/lib/helpers'
import TransactionStore from '@/src/zustand/finance/Transaction'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { MessageStore } from '@/src/zustand/notification/Message'

export default function TopUp() {
  const [showForm, setShowForm] = useState(false)
  const [amount, setAmount] = useState<number>(0)
  // const popup = new Paystack()
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_TEST_KEY
  const { user } = AuthStore()
  const { setMessage } = MessageStore()
  const { getAPayment, createTransaction, transactionForm } = TransactionStore()
  const [Paystack, setPaystack] = useState<typeof PaystackInline>()

  const handleTopUp = async () => {
    if (!publicKey || !Paystack) return
    const popup = new Paystack()
    const newAmount = amount * 1
    popup.checkout({
      key: publicKey,
      email: String(user?.email),
      amount: newAmount,
      onSuccess: (transaction) => {
        const form = {
          email: user?.email,
          username: user?.username,
          userId: user?._id,
          amount: newAmount,
          currency: transactionForm.currency,
          picture: user?.picture,
          charge: 0,
          currencySymbol: transactionForm.currencySymbol,
          country: transactionForm.country,
          status: true,
          name: transactionForm.name,
          logo: transactionForm.logo,
          title: transactionForm.title,
          reference: transaction.reference,
          createdAt: new Date(),
        }
        createTransaction(
          `/transactions/?username=${user?.username}&ordering=-createdAt`,
          form,
          setMessage
        )
      },
      onLoad: (response) => {
        console.log('onLoad: ', response)
      },
      onCancel: () => {
        console.log('onCancel')
      },
      onError: (error) => {
        console.log('Error: ', error.message)
      },
    })
  }

  const handlePayment = () => {
    if (amount < transactionForm.amount) {
      setMessage(
        `The amount you entered is less than the minimum amount: ${transactionForm.currencySymbol}${transactionForm.amount}`,
        false
      )
    } else {
      handleTopUp()
      setShowForm(false)
    }
  }

  useEffect(() => {
    import('@paystack/inline-js').then((mod) => {
      setPaystack(() => mod.default)
    })
  }, [])

  useEffect(() => {
    if (showForm) {
      getAPayment(`/transactions/payments/?name=top_up`)
    }
  }, [showForm])

  return (
    <div className="relative">
      {showForm && (
        <div
          onClick={() => setShowForm(false)}
          className="p-2 fixed z-40 top-0 left-0 w-full h-full bg-black/50 flex justify-center items-center"
        >
          <div
            onClick={(e) => {
              e.stopPropagation()
            }}
            className="card_body w-full flex flex-col items-center max-w-[500px]"
          >
            {user && user.picture && (
              <Image
                className="object-cover rounded-full mb-1"
                src={String(user.picture)}
                loading="lazy"
                alt="username"
                sizes="100vw"
                height={0}
                width={0}
                style={{ height: '50px', width: '50px' }}
              />
            )}
            <div className="flex items-center flex-wrap">
              <div className="text-lg mr-2">{user?.displayName}</div>
              <div className="text-[var(--custom)]">{`@${user?.username}`}</div>
            </div>
            <div className="mb-5 text-sm">{user?.email}</div>
            <div className="flex flex-col items-center text-center">
              <label className="label" htmlFor="">
                Top Up Amount
              </label>
              <input
                className="form-input"
                name="amount"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                type="number"
                placeholder="Enter top up amount"
              />
              <div className="text-sm text-[var(--custom)]">
                Minimum top up is:
                {transactionForm.currencySymbol}
                {formatMoney(transactionForm.amount)}
              </div>

              <div onClick={handlePayment} className="custom_btn neutral mt-4">
                <i className="bi bi-cash mr-3"></i>Make Payment
              </div>
            </div>
          </div>
        </div>
      )}
      <div
        onClick={() => setShowForm(true)}
        className="flex text-[var(--custom)] items-center mt-5 py-2 px-3 rounded-[5px] cursor-pointer bg-[var(--primary)]"
      >
        <CirclePlus size={20} color="currentColor" className="mr-2" />
        Top Up Your Account
      </div>
    </div>
  )
}
