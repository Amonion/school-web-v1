'use client'
import Image from 'next/image'
import { formatDate, formatTimeTo12Hour } from '@/lib/helpers'
import Link from 'next/link'
import { useEffect } from 'react'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { MessageStore } from '@/src/zustand/notification/Message'
import StaffStore from '@/src/zustand/school/Staff'

const SchoolStaffs: React.FC = () => {
  const { applicants, currentPage, page_size, toggleChecked, getApplicants } =
    StaffStore()
  const { bioUser, bioUserState } = AuthStore()
  const { setMessage } = MessageStore()

  useEffect(() => {
    if (!bioUserState) return
    getApplicants(
      `/offices/?username=${bioUserState.activeOffice.username}&isUserApplied=true&page_size=${page_size}&page=${currentPage}`,
      setMessage
    )
  }, [bioUser])
  return (
    <>
      <div className="flex flex-wrap items-start lg:items-center mb-3">
        <span className="text-[var(--custom)] text-base mr-2 uppercase">
          Staffs:
        </span>{' '}
        {bioUserState?.activeOffice?.name}
      </div>
      <div className="overflow-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-[var(--primary)]">
              <th className="py-2">S/N</th>
              <th className="py-2">Photo</th>
              <th className="py-2">Username</th>
              <th className="py-2">Name</th>
              <th className="py-2">Position</th>
              <th className="py-2">Rank</th>
              <th className="py-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map((item, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 1 ? 'bg-[var(--primary)]' : ''
                } text-sm`}
              >
                <td className="py-2">
                  <div className="flex items-center">
                    <div
                      className={`checkbox ${item.isChecked ? 'active' : ''}`}
                      onClick={() => toggleChecked(index)}
                    >
                      {item.isChecked && (
                        <i className="bi bi-check text-white text-lg"></i>
                      )}
                    </div>
                    {(currentPage - 1) * page_size + index + 1}
                  </div>
                </td>
                <td className="py-2">
                  {item.bioUserPicture && (
                    <div className="w-12 relative h-12 rounded-full overflow-hidden">
                      <Image
                        src={item.bioUserPicture}
                        alt="Profile Background"
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                  )}
                </td>
                <td className="py-2 text-base">
                  <Link href={`/school/staffs/${item.bioUserUsername}`}>
                    {item.bioUserUsername}
                  </Link>
                </td>
                <td className="py-2">{item.bioUserDisplayName}</td>
                <td className="py-2">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: item.bioUserIntro,
                    }}
                  />
                </td>
                <td className="py-2">
                  {item.isUserActive ? (
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

export default SchoolStaffs
