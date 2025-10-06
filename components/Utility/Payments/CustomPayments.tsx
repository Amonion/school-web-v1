'use client'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect } from 'react'
import PaymentCarousel from '@/components/Utility/Payments/PaymentCarousel'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import PaymentStore from '@/src/zustand/finance/Payment'

export default function CustomPayment() {
  const { getQuickPayments, quickPayments } = PaymentStore()
  const { user } = AuthStore()

  useEffect(() => {
    if (user) {
      getQuickPayments(
        `/payments?country=${
          user.signupCountry ? user.signupCountry : 'Nigeria'
        }&durationName=quick`
      )
    }
  }, [user])

  return (
    <div className="sm:w-1/3 w-full sm:pl-3 grid grid-cols-1 gap-4 xs:gap-2 xs:grid-cols-2 sm:flex sm:flex-col mb-4 sm:mb-0">
      <div className="card_body pad flex flex-col items-start xs:mb-0">
        <div className="text-lg mb-3">Custom Payments</div>
        <PaymentCarousel
          items={[
            { source: '/images/ad1.jpg', url: '/utils' },
            { source: '/images/ad2.png', url: '/utils' },
            { source: '/images/ad3.jpg', url: '/utils' },
          ]}
        />
        <div className="flex text-[var(--custom)] items-center mt-5 py-2 px-3 rounded-[5px] cursor-pointer bg-[var(--secondary)]">
          <Plus size={20} color="currentColor" className="mr-2" />
          New Bank Account
        </div>
      </div>
      <div className="card_body pad sm:mt-auto sm:w-full">
        <div className="text-lg mb-3">Quick Payments</div>
        <div className="grid gap-1">
          {quickPayments.slice(0, 5).map((item, index) => (
            <Link
              href={`/utils`}
              key={index}
              className={`flex py-2 px-1 items-center ${
                index % 2 === 0 ? 'bg-[var(--secondary)]' : ''
              }`}
            >
              <Image
                src={String(item.logo)}
                alt={`Ad Media`}
                sizes="100vw"
                width={0}
                height={0}
                style={{ width: 30, height: 30 }}
                className="object-cover mr-2"
              />

              <div>{item.title}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
