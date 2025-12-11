'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { formatDateToDDMMYY, formatTimeTo12Hour } from '@/lib/helpers'
import EmailStore from '@/src/zustand/notification/Email'
import { MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '@/components/Team/LinkedPagination'
import _debounce from 'lodash/debounce'
import EmailForm from '@/components/Team/Email/EmailForm'
import { BioUserStore } from '@/src/zustand/user/BioUser'
import CustomBtn from '@/components/CustomBtn'
const Persons: React.FC = () => {
  const url = 'biousers/'
  const {
    selectedBioUsers,
    isAllChecked,
    loading,
    searchedBioUsers,
    count,
    bioUsers,
    massUpdateBioUsers,
    getBioUsers,
    massDeleteBioUsers,
    toggleAllSelected,
    toggleChecked,
    searchBioUser,
    reshuffleResults,
  } = BioUserStore()
  const { setShowEmailForm, showEmailForm } = EmailStore()
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { page } = useParams()
  const { setMessage } = MessageStore()
  const pathname = usePathname()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    reshuffleResults()
  }, [pathname])

  useEffect(() => {
    reshuffleResults()
    const params = `?page_size=${page_size}&page=${
      page ? page : 1
    }&ordering=${sort}&status=User&isVerified=true`
    getBioUsers(`${url}${params}`, setMessage)
  }, [page])

  const handleSearchUsers = _debounce(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (value.trim().length > 0) {
        searchBioUser(
          `${url}search?username=${value}&displayName=${value}&page_size=${page_size}`
        )
      } else {
        BioUserStore.setState({ searchedBioUsers: [] })
      }
    },
    1000
  )

  const DeleteItems = async () => {
    if (selectedBioUsers.length === 0) {
      setMessage('Please select at least one user to delete', false)
      return
    }
    await massDeleteBioUsers(`${url}mass-delete/`, selectedBioUsers, setMessage)
  }

  const makeUsersStaffs = async () => {
    if (selectedBioUsers.length === 0) {
      setMessage('Please select at least one user to make staff', false)
      return
    }
    const usersIds = selectedBioUsers.map((user) => user._id)

    await massUpdateBioUsers(`/staffs`, { usersIds }, setMessage)
  }

  return (
    <>
      <div className="overflow-auto mb-5">
        <div className="card_body sharp mb-5">
          <div className="text-lg text-[var(--text-secondary)]">
            Table of Verified Users
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

            {searchedBioUsers.length > 0 && (
              <div
                className={`dropdownList ${
                  searchedBioUsers.length > 0
                    ? 'overflow-auto'
                    : 'overflow-hidden h-0'
                }`}
              >
                {searchedBioUsers.map((item, index) => (
                  <div key={index} className="input_drop_list">
                    <Image
                      alt={`email of ${item.bioUserPicture}`}
                      src={String(item.bioUserPicture)}
                      width={0}
                      sizes="100vw"
                      className="object-cover rounded-full w-[50px] h-[50px] mr-5"
                      height={0}
                    />
                    <div className="flex-1">
                      {item.bioUserDisplayName}, @{item.bioUserUsername}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {bioUsers.length > 0 ? (
          <table>
            <thead className="bg-[var(--primary)]">
              <tr>
                <th>
                  <div className="flex items-center">
                    <div
                      onClick={toggleAllSelected}
                      className={`checkbox ${isAllChecked ? 'active' : ''}`}
                    >
                      {isAllChecked && (
                        <i className="bi bi-check text-white text-lg"></i>
                      )}
                    </div>
                    S/N
                  </div>
                </th>
                <th>Picture</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Date</th>
                <th>Country</th>
              </tr>
            </thead>
            <tbody>
              {bioUsers.map((item, index) => (
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
                    {item.bioUserPicture ? (
                      <Image
                        alt={`email of ${item.bioUserPicture}`}
                        src={String(item.bioUserPicture)}
                        width={0}
                        sizes="100vw"
                        className="object-cover rounded-full w-[50px] h-[50px]"
                        height={0}
                      />
                    ) : (
                      <span>N/A</span>
                    )}
                  </td>
                  <td>
                    <Link
                      className="card_list_item"
                      href={`/team/users/onverification/verification-details/?username=${item.bioUserUsername}/`}
                    >
                      {item.bioUserDisplayName}
                    </Link>
                  </td>
                  <td>
                    <div>{item.email}</div>
                    <div>{item.phone}</div>
                  </td>
                  <td>
                    {formatTimeTo12Hour(item.createdAt)}
                    <br />
                    {formatDateToDDMMYY(item.createdAt)}
                  </td>
                  <td>{item.signupIp}</td>
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
          <button className="flex">
            <CustomBtn label="" loading={loading} />
          </button>
        ) : (
          <div className="flex gap-5 items-center w-full">
            <i
              onClick={DeleteItems}
              className="bi bi-trash text-lg cursor-pointer text-[var(--custom)]"
            ></i>
            <i
              onClick={makeUsersStaffs}
              className="bi bi-person-vcard text-lg cursor-pointer text-[var(--custom)]"
            ></i>
            <i
              onClick={() => setShowEmailForm(true)}
              className="bi bi-envelope text-lg cursor-pointer text-[var(--custom)]"
            ></i>

            {/* <i
                onClick={startSendMassEmail}
                className="bi bi-envelope text-lg ml-auto text-[var(--custom)]"
              ></i> */}
          </div>
        )}
      </div>

      {showEmailForm && <EmailForm />}

      <div className="card_body sharp">
        <LinkedPagination
          url="/team/users/accounts"
          count={count}
          page_size={20}
        />
      </div>
    </>
  )
}

export default Persons
