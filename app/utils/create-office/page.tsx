'use client'
import { formatDate, formatTimeTo12Hour } from '@/lib/helpers'
import { MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import OfficeStore from '@/src/zustand/utility/Office'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect } from 'react'

export default function CreateOffice() {
  const { bioUserState, bioUser } = AuthStore()
  const { setMessage } = MessageStore()
  const url = '/offices'
  const { getOffices, offices } = OfficeStore()

  useEffect(() => {
    const approvedOffices = offices.filter((item) => item.isApproved)
    if (
      bioUser?.bioUserUsername &&
      approvedOffices.length !== bioUserState?.offices.length
    ) {
      getOffices(
        `${url}/?bioUserUsername=${bioUser.bioUserUsername}&isApplied=true`,
        setMessage
      )
    }
  }, [bioUserState])
  return (
    <>
      <div className="card_body sharp flex items-center justify-center mb-2">
        {bioUserState?.isVerified ? (
          <div className="grid xs:grid-cols-2 sm:grid-cols-3 gap-7 xs:gap-4 sm:gap-3">
            <div className="flex flex-col items-center">
              <div className="text-[30px] mb-2 text-[var(--custom)]">
                Scholarship
              </div>
              <i className="bi bi-gem text-[50px] mb-3"></i>
              <div className="text-center max-w-[500px] mb-5 text-xl">
                Set online scholarship exams and competitions for schools and
                students. You can specify candidate geolocation and eligibilty.
              </div>
              {bioUserState?.processingOffice ? (
                <div className="custom_btn neutral disabled">Processing</div>
              ) : (
                <Link
                  className="custom_btn neutral"
                  href={'/utils/create-school'}
                >
                  Create Scholarship
                </Link>
              )}
            </div>
            <div className="flex flex-col items-center">
              <div className="text-[30px] mb-2 text-[var(--custom)]">
                Social Market
              </div>
              <i className="bi bi-shop-window text-[50px] mb-3"></i>
              <div className="text-center max-w-[500px] mb-5 text-xl">
                Social market is where mainly entring students or users can
                browse and purchase items for sale placed by mainly graduating
                students or other users.
              </div>

              {bioUserState?.processingOffice ? (
                <div className="custom_btn neutral disabled">Processing</div>
              ) : (
                <Link
                  className="custom_btn neutral"
                  href={'/utils/create-shop'}
                >
                  Create Shop
                </Link>
              )}
            </div>
            <div className="flex flex-col items-center">
              <div className="text-[30px] mb-2 text-[var(--custom)]">
                School
              </div>
              <i className="bi bi-bank text-[50px] mb-3"></i>
              <div className="text-center max-w-[500px] mb-5 text-xl">
                You can create your official school account here if you own a
                school. This connects your school with other schools and
                students around the world.
              </div>

              {bioUserState?.processingOffice ? (
                <div className="custom_btn neutral disabled">Processing</div>
              ) : (
                <Link
                  className="custom_btn neutral"
                  href={'/utils/create-school'}
                >
                  Create School
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center max-w-[500px] mb-5 text-xl flex flex-col items-center">
            To create an office, you have to verify your account.
            <Link className="custom_btn mt-5" href={`/home/verification`}>
              Begin Verification
            </Link>
          </div>
        )}
      </div>

      <div className="card_body p-4 sharp overflow-x-auto">
        <h2 className="mb-2 text-lg font-semibold">Offices</h2>
        <table className="min-w-[600px] w-full">
          <thead>
            <tr className="">
              <th className="py-2 text-left">Logo</th>
              <th className="py-2">Name</th>
              <th className="py-2">Type</th>
              <th className="py-2">status</th>
              <th className="py-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {offices.map((item, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 1 ? 'bg-[var(--secondary)]' : ''
                } text-sm`}
              >
                <td className="py-2">
                  {item.logo && (
                    <div className="w-12 relative h-12 rounded-full overflow-hidden">
                      <Image
                        src={item.logo}
                        alt="Profile Background"
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                  )}
                </td>
                <td className="py-2 text-base">
                  <Link href={`/utils/create-school?username=${item.username}`}>
                    {item.name}
                  </Link>
                </td>
                <td className="py-2">{item.type}</td>
                <td className="py-2">
                  {item.isApproved ? (
                    <span className="text-[var(--success)]">Approved</span>
                  ) : (
                    <span className="text-[var(--custom)]">Pending</span>
                  )}
                </td>
                <td className="py-2">
                  <div className="flex flex-col">
                    <span className="text-sm mb-1">
                      {formatTimeTo12Hour(item.createdAt)}
                    </span>
                    <span className="text-sm">
                      {formatDate(String(item.createdAt))}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
