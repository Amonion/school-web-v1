'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import StaffStore from '@/src/zustand/app/Staff'
import { MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '../LinkedPagination'
import CustomBtn from '../../CustomBtn'

const ComponentStaffs: React.FC = () => {
  const url = '/staffs/'
  const {
    count,
    results,
    selectedItems,
    loading,
    isAllChecked,
    searchedStaffs,
    searchStaff,
    getItems,
    toggleAllSelected,
    toggleChecked,
    massDelete,
  } = StaffStore()
  const { page } = useParams()
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { setMessage } = MessageStore()
  const inputRef = useRef<HTMLInputElement>(null)

  // useEffect(() => {
  //   reshuffleResults()
  // }, [pathname])

  useEffect(() => {
    const params = `?page_size=${page_size}&page=${
      page ? page : 1
    }&ordering=${sort}&isActive=true`
    getItems(`${url}${params}`, setMessage)
  }, [page])

  const makeUsersStaffs = async () => {
    if (selectedItems.length === 0) {
      setMessage('Please select at least one user to delete', false)
      return
    }
    const usersIds = selectedItems.map((user) => user.bioUserId)

    await massDelete(
      `${url}?page_size=${page_size}&page=${
        page ? page : 1
      }&ordering=${sort}&isActive=true`,
      { usersIds },
      setMessage
    )
  }

  const handleSearchStaffs = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.trim().length > 0) {
      searchStaff(
        `${url}search?username=${value}&displayName=${value}&page_size=${page_size}`
      )
    } else {
      StaffStore.setState({ searchedStaffs: [] })
    }
  }

  return (
    <>
      <div className="overflow-auto mb-5">
        <div className="card_body sharp mb-5">
          <div className="text-lg text-[var(--text-secondary)]">
            Table of Staffs
          </div>
          <div className="relative mb-2">
            <div className={`input_wrap ml-auto active `}>
              <input
                ref={inputRef}
                type="search"
                onChange={handleSearchStaffs}
                className={`transparent-input flex-1 `}
                placeholder="Search staffs"
              />
              {loading ? (
                <i className="bi bi-opencollective common-icon loading"></i>
              ) : (
                <i className="bi bi-search common-icon cursor-pointer"></i>
              )}
            </div>

            {searchedStaffs.length > 0 && (
              <div
                className={`dropdownList ${
                  searchedStaffs.length > 0
                    ? 'overflow-auto'
                    : 'overflow-hidden h-0'
                }`}
              >
                {searchedStaffs.map((item, index) => (
                  <div key={index} className="input_drop_list">
                    <Image
                      alt={`email of ${item.picture}`}
                      src={String(item.picture)}
                      width={0}
                      sizes="100vw"
                      className="object-cover rounded-full w-[50px] h-[50px] mr-5"
                      height={0}
                    />
                    <div className="flex-1">
                      {item.firstName}, {item.lastName}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {results.length > 0 ? (
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
                <th>Position</th>
                <th>Salary</th>
                <th>Place</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item, index) => (
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
                    {item.picture ? (
                      <Image
                        alt={`email of ${item.picture}`}
                        src={String(item.picture)}
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
                      {item.firstName} {item.lastName}
                    </Link>
                  </td>
                  <td>
                    <div>{item.position}</div>
                  </td>
                  <td>
                    <div>{item.salary}</div>
                  </td>
                  <td>
                    {item.area} {item.state} state, {item.country}
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
          <button className="flex">
            <CustomBtn label="" loading={loading} />
          </button>
        ) : (
          <div className="flex gap-5 items-center w-full">
            <i
              onClick={makeUsersStaffs}
              className="bi bi-trash text-lg cursor-pointer text-[var(--custom)]"
            ></i>
            <i
              // onClick={() => setShowEmailForm(true)}
              className="bi bi-envelope text-lg mr-auto cursor-pointer text-[var(--custom)]"
            ></i>

            {/* <i
                onClick={startSendMassEmail}
                className="bi bi-envelope text-lg ml-auto text-[var(--custom)]"
              ></i> */}
            <Link href={`/team/company/staffs/positions`}>
              <CustomBtn label="Positions" loading={false} />
            </Link>
          </div>
        )}
      </div>

      <div className="card_body sharp">
        <LinkedPagination
          url="/team/company/staffs"
          count={count}
          page_size={20}
        />
      </div>
    </>
  )
}

export default ComponentStaffs
