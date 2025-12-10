'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { formatDateToDDMMYY, formatTimeTo12Hour } from '@/lib/helpers'
import { MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '@/components/Team/LinkedPagination'
import _debounce from 'lodash/debounce'
import { BioUserStateStore } from '@/src/zustand/user/BioUserState'
const Verifying: React.FC = () => {
  const url = '/biousers/states'
  const {
    getBioUsersState,
    toggleChecked,
    reshuffleResults,
    searchBioUserState,
    searchedBioUsersState,
    loading,
    count,
    bioUsersState,
  } = BioUserStateStore()
  const { page } = useParams()
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { setMessage } = MessageStore()
  const pathname = usePathname()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    reshuffleResults()
  }, [pathname])

  useEffect(() => {
    reshuffleResults()
    const params = `?page_size=${page_size}&page=${
      page ? Number(page) : 1
    }&ordering=${sort}&isOnVerification=true`
    getBioUsersState(`${url}${params}`, setMessage)
  }, [page])

  const handleSearchUsers = _debounce(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (value.trim().length > 0) {
        searchBioUserState(
          `${url}/search?bioUserUsername=${value}&page_size=${page_size}&isOnverification=true`
        )
      } else {
        BioUserStateStore.setState({ searchedBioUsersState: [] })
      }
    },
    1000
  )

  return (
    <>
      <div className="overflow-auto mb-5">
        <div className="card_body sharp mb-5">
          <div className="text-lg text-[var(--text-secondary)]">
            Table of Verifying Users
          </div>
          <div className="relative mb-2">
            <div className={`input_wrap ml-auto active `}>
              <input
                ref={inputRef}
                type="search"
                onChange={handleSearchUsers}
                className={`transparent-input flex-1 `}
                placeholder="Search users"
              />
              {loading ? (
                <i className="bi bi-opencollective common-icon loading"></i>
              ) : (
                <i className="bi bi-search common-icon cursor-pointer"></i>
              )}
            </div>

            {searchedBioUsersState.length > 0 && (
              <div
                className={`dropdownList ${
                  searchedBioUsersState.length > 0
                    ? 'overflow-auto'
                    : 'overflow-hidden h-0'
                }`}
              >
                {searchedBioUsersState.map((item, index) => (
                  <Link
                    href={`/team/users/onverification/verification-details/${item.bioUserUsername}`}
                    key={index}
                    className="input_drop_list"
                  >
                    {item.bioUserUsername}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {bioUsersState.length > 0 ? (
          <table>
            <thead className="bg-[var(--primary)]">
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
                  className={`${index % 2 === 1 ? 'bg-[var(--primary)]' : ''}`}
                >
                  <td>
                    <div className="flex items-center">
                      <div
                        className={`checkbox ${item.isChecked ? 'active' : ''}`}
                        onClick={() => toggleChecked(index)}
                      >
                        {item.isChecked && (
                          <i className="bi bi-check text-white text-lg"></i>
                        )}
                      </div>
                      {(page ? Number(page) - 1 : 0) * page_size + index + 1}
                    </div>
                  </td>
                  <td>
                    <Link
                      className="card_list_item"
                      href={`/team/users/onverification/verification-details/${item.bioUserUsername}`}
                    >
                      {item.bioUserUsername}
                    </Link>
                  </td>
                  <td>
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
            <div className="not_found_text">No Users Found</div>
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

      <div className=" card_body sharp my-5">
        {loading ? (
          <button className="custom_btn ">
            <i className="bi bi-opencollective loading"></i>

            <div>Processing...</div>
          </button>
        ) : (
          <div className="flex items-center w-full">
            {/* <i
                onClick={startSendMassEmail}
                className="bi bi-envelope text-lg ml-auto text-[var(--custom)]"
              ></i> */}
          </div>
        )}
      </div>

      <div className="card_body sharp">
        <LinkedPagination
          url="/team/users/onverification"
          count={count}
          page_size={20}
        />
      </div>
    </>
  )
}

export default Verifying
