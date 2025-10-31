'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { formatDateToDDMMYY, formatTimeTo12Hour } from '@/lib/helpers'
import { User, UserStore } from '@/src/zustand/user/User'
import EmailStore, { Email } from '@/src/zustand/notification/Email'
import { MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import LinkedPagination from '@/components/Team/LinkedPagination'
const Users: React.FC = () => {
  const url = 'users/'
  const {
    getUsers,
    massDeleteUsers,
    count,
    updateUser,
    sendUsersEmail,
    users,
    toggleAllSelected,
    toggleChecked,
    selectedUsers,
    isAllChecked,
    loading,
    toggleActive,
    reshuffleResults,
  } = UserStore()
  const { getItems, results } = EmailStore()
  const [emailCurrentPage] = useState(1)
  // const [emailCurrentPage, setEmailPage] = useState(1);
  const [isEmail, setIsEmail] = useState(false)
  const [email, setEmail] = useState('Select Email')
  const [emailId, setEmailId] = useState('')
  const [page_size] = useState(20)
  const [emailPageSize] = useState(20)
  const [sort] = useState('-createdAt')
  const { page } = useParams()
  const { setMessage } = MessageStore()
  const pathname = usePathname()
  const { user } = AuthStore()

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

  useEffect(() => {
    getItems(
      `/emails/?page_size=${emailPageSize}&page=${emailCurrentPage}&ordering=title`,
      setMessage
    )
  }, [results.length, emailCurrentPage])

  const makeStaff = async (user: User) => {
    const data = {
      userId: user._id,
      userStatus: 'Staff',
      isStaff: true,
      username: user.username,
      picture: user.picture,
      email: user.email,
      phone: user.phone,
    }
    const params = `?page_size=${page_size}&page=${
      page ? page : 1
    }&ordering=${sort}&userStatus=User`
    await updateUser(`${url}${user._id}${params}`, data, setMessage)
  }

  const suspendUser = async (user: User) => {
    const data = {
      userId: user._id,
      isSuspended: !user.isSuspended,
    }
    const params = `?page_size=${page_size}&page=${
      page ? page : 1
    }&ordering=${sort}`
    await updateUser(`${url}${user._id}${params}`, data, setMessage)
  }

  const DeleteItems = async () => {
    if (selectedUsers.length === 0) {
      setMessage('Please select at least one user to delete', false)
      return
    }
    await massDeleteUsers(`${url}mass-delete/`, selectedUsers, setMessage)
  }

  const selectEmail = async (email: Email) => {
    setEmailId(email._id)
    setIsEmail(false)
    setEmail(email.title)
  }

  const sendEmail = async () => {
    const usersIds = selectedUsers.map((user) => user._id)

    const form = new FormData()
    form.append('usersIds', JSON.stringify(usersIds))
    sendUsersEmail(`/messages/send/${emailId}`, form, setMessage)
  }

  return (
    <>
      <div className="overflow-auto mb-5">
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
                      {(page ? Number(page) : 1 - 1) * page_size + index + 1}
                      <i
                        onClick={() => toggleActive(index)}
                        className="bi bi-three-dots-vertical text-lg cursor-pointer"
                      ></i>
                    </div>
                    {item.isActive &&
                      user?.staffRanking &&
                      user?.staffRanking > 19 && (
                        <div className="card_list">
                          <span
                            onClick={() => toggleActive(index)}
                            className="more_close "
                          >
                            X
                          </span>
                          <Link
                            className="card_list_item"
                            href={`/team/messages/emails/create-email?id=${item._id}&name=${item.username}`}
                          >
                            View Profile
                          </Link>
                          <div
                            onClick={() => makeStaff(item)}
                            className="card_list_item"
                          >
                            Make Staff
                          </div>
                          <div
                            onClick={() => suspendUser(item)}
                            className="card_list_item"
                          >
                            {`${
                              item.isSuspended ? 'Permit User' : 'Suspend User'
                            }`}
                          </div>
                        </div>
                      )}
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
                      href={`/team/users/onverification/verification-details/?username=${item.username}/`}
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
          <div className="flex items-center w-full">
            <i
              onClick={DeleteItems}
              className="bi bi-trash text-lg mr-3 text-[var(--custom)]"
            ></i>
            <i
              onClick={DeleteItems}
              className="bi bi-ban text-lg mr-3 text-[var(--custom)]"
            ></i>
            {selectedUsers.length > 0 && email !== 'Select Email' && (
              <i
                onClick={sendEmail}
                className="bi bi-envelope text-lg mr-3 text-[var(--custom)]"
              ></i>
            )}
            <div className="flex flex-col relative ml-auto">
              <div
                onClick={() => setIsEmail((e) => !e)}
                className="form-input cursor-pointer"
              >
                <div className="line-clamp-1 overflow-ellipsis"> {email}</div>
                <i
                  className={`bi bi-caret-down-fill ml-[2px] ${
                    isEmail ? 'active' : ''
                  } `}
                ></i>
              </div>
              {isEmail && (
                <div className="absolute right-0 top-[45px] border border-[var(--border)] bg-[var(--primary)] rounded-[5px]">
                  {EmailStore.getState().results.map((item, index) => (
                    <div
                      onClick={() => selectEmail(item)}
                      key={index}
                      className="input_drop_list line-clamp-1 overflow-ellipsis"
                    >
                      {item.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* <i
                onClick={startSendMassEmail}
                className="bi bi-envelope text-lg ml-auto text-[var(--custom)]"
              ></i> */}
          </div>
        )}
      </div>

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

export default Users
