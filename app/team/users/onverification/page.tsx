'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Pagination from '@/components/Team/Pagination'
import { formatDateToDDMMYY, formatTimeTo12Hour } from '@/lib/helpers'
import { MessageStore } from '@/src/zustand/notification/Message'
import { BioUserStateStore } from '@/src/zustand/user/BioUserState'
const UsersOnVerification: React.FC = () => {
  const url = '/users/bio-user/states'
  const {
    getBioUsersState,
    toggleChecked,
    toggleActive,
    reshuffleResults,
    loading,
    count,
    bioUsersState,
  } = BioUserStateStore()
  const [currentPage, setCurrentPage] = useState(1)
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { setMessage } = MessageStore()
  const pathname = usePathname()

  useEffect(() => {
    reshuffleResults()
  }, [pathname])

  useEffect(() => {
    reshuffleResults()
    const params = `?page_size=${page_size}&page=${currentPage}&ordering=${sort}&isOnVerification=true`
    getBioUsersState(`${url}${params}`, setMessage)
  }, [currentPage])

  return (
    <>
      <div className="card_body">
        <div className="custom_sm_title">Users on Verification</div>
        <div className="overflow-auto mb-5">
          {bioUsersState.length > 0 ? (
            <table className="min-w-[350px]">
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Username</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {bioUsersState.map((item, index) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 1 ? 'bg-[var(--white-gray)]' : ''
                    }`}
                  >
                    <td>
                      <div className="flex items-center">
                        <div
                          className={`checkbox ${
                            item.isChecked ? 'active' : ''
                          }`}
                          onClick={() => toggleChecked(index)}
                        >
                          {item.isChecked && (
                            <i className="bi bi-check text-white text-lg"></i>
                          )}
                        </div>
                        {(currentPage - 1) * page_size + index + 1}
                        <i
                          onClick={() => toggleActive(index)}
                          className="bi bi-three-dots-vertical text-lg cursor-pointer"
                        ></i>
                      </div>
                    </td>

                    <td>
                      <Link
                        href={`/team/users/onverification/verification-details/?username=${item.bioUserUsername}`}
                      >
                        {item.bioUserUsername}
                      </Link>
                    </td>
                    <td className="text-sm">
                      {formatTimeTo12Hour(item.createdAt)}
                      <br />
                      {formatDateToDDMMYY(item.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="relative flex justify-center">
              <div className="not_found_text">No User Found</div>
              <Image
                className="max-w-[300px]"
                alt={`no record`}
                src="/images/not-found.png"
                width={0}
                sizes="100vw"
                height={0}
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
          )}
        </div>
        <div className="table_nav">
          {loading && (
            <button className="custom_btn ">
              <i className="bi bi-opencollective loading"></i>

              <div>Processing...</div>
            </button>
          )}
        </div>
        <div className="flex items-center">
          <div>Results {count}</div>
          <Pagination
            currentPage={currentPage}
            totalItems={count}
            pageSize={page_size}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </>
  )
}

export default UsersOnVerification
