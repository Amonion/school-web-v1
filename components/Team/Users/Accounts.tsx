'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { formatDateToDDMMYY, formatTimeTo12Hour } from '@/lib/helpers'
import { UserStore } from '@/src/zustand/user/User'
import EmailStore from '@/src/zustand/notification/Email'
import { MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import LinkedPagination from '@/components/Team/LinkedPagination'
import _debounce from 'lodash/debounce'
import EmailForm from '@/components/Team/Email/EmailForm'
const Accounts: React.FC = () => {
  const url = 'users/'
  const {
    selectedUsers,
    isAllChecked,
    loading,
    searchedUsers,
    count,
    users,
    getUsers,
    massDeleteUsers,
    updateUsers,
    toggleAllSelected,
    toggleChecked,
    searchUser,
    reshuffleResults,
  } = UserStore()
  const { setShowEmailForm, showEmailForm } = EmailStore()
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { page } = useParams()
  const { setMessage } = MessageStore()
  const pathname = usePathname()
  const { user } = AuthStore()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    reshuffleResults()
  }, [pathname])

  useEffect(() => {
    reshuffleResults()
    const params = `?page_size=${page_size}&page=${
      page ? page : 1
    }&ordering=${sort}&status=User`
    getUsers(`${url}${params}`, setMessage)
  }, [page])

  const suspendUsers = () => {
    if (selectedUsers.length === 0) {
      setMessage('Please select at least one account to suspend.', false)
      return
    }
    const usersIds = selectedUsers.map((user) => user._id)

    const params = `?page_size=${page_size}&page=${
      page ? page : 1
    }&ordering=${sort}&status=User`
    updateUsers(`${url}suspend/${params}`, { usersIds: usersIds }, setMessage)
  }

  const unSuspendUsers = () => {
    if (selectedUsers.length === 0) {
      setMessage('Please select at least one account to unsuspend.', false)
      return
    }
    const usersIds = selectedUsers.map((user) => user._id)

    const params = `?page_size=${page_size}&page=${
      page ? page : 1
    }&ordering=${sort}&status=User`
    updateUsers(`${url}unsuspend/${params}`, { usersIds: usersIds }, setMessage)
  }

  const handleSearchUsers = _debounce(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (value.trim().length > 0) {
        searchUser(
          `${url}search?username=${value}&displayName=${value}&page_size=${page_size}`
        )
      } else {
        UserStore.setState({ searchedUsers: [] })
      }
    },
    1000
  )

  const DeleteItems = async () => {
    if (selectedUsers.length === 0) {
      setMessage('Please select at least one user to delete', false)
      return
    }
    await massDeleteUsers(`${url}mass-delete/`, selectedUsers, setMessage)
  }

  return (
    <>
      <div className="overflow-auto mb-5">
        <div className="card_body sharp mb-5">
          <div className="text-lg text-[var(--text-secondary)]">
            Table of Users
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

            {searchedUsers.length > 0 && (
              <div
                className={`dropdownList ${
                  searchedUsers.length > 0
                    ? 'overflow-auto'
                    : 'overflow-hidden h-0'
                }`}
              >
                {searchedUsers.map((item, index) => (
                  <div key={index} className="input_drop_list">
                    <Link
                      href={`/school/students/student/${item._id}`}
                      className="flex-1"
                    >
                      {item.displayName}, @{item.username}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {users.length > 0 ? (
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
                <th>Username</th>
                <th>Contact</th>
                <th>Date</th>
                <th>Country</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item, index) => (
                <tr
                  key={index}
                  className={`${index % 2 === 1 ? 'bg-[var(--primary)]' : ''} ${
                    item.isSuspended ? 'text-[var(--custom)]' : ''
                  } `}
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
                    {item.picture ? (
                      <Image
                        alt={`email of ${item.picture}`}
                        src={String(item.picture)}
                        width={0}
                        sizes="100vw"
                        className="object-cover rounded-full"
                        height={0}
                        style={{
                          minWidth: '50px',
                          width: '50px',
                          height: '50px',
                        }}
                      />
                    ) : (
                      <span>N/A</span>
                    )}
                  </td>
                  <td>
                    {' '}
                    <Link
                      className="card_list_item"
                      href={`/team/users/onverification/verification-details/${item.username}`}
                    >
                      {item.username}{' '}
                      {item.isVerified && (
                        <i className="bi bi-shield-check text-[var(--custom)] ml-1"></i>
                      )}
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
          <button className="custom_btn ">
            <i className="bi bi-opencollective loading"></i>

            <div>Processing...</div>
          </button>
        ) : (
          <div className="flex items-center gap-5 w-full">
            {user?.status === 'Staff' && (
              <i
                onClick={DeleteItems}
                className="bi bi-trash text-lg cursor-pointer text-[var(--custom)]"
              ></i>
            )}
            <i
              onClick={suspendUsers}
              className="bi bi-person-check text-xl cursor-pointer text-[var(--custom)]"
            ></i>
            <i
              onClick={unSuspendUsers}
              className="bi bi-person-dash text-xl cursor-pointer text-[var(--custom)]"
            ></i>
            <i
              onClick={() => setShowEmailForm(true)}
              className="bi bi-envelope text-lg cursor-pointer mr-3 text-[var(--custom)]"
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

export default Accounts
