'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Pagination from '@/components/Team/Pagination'
import StaffStore, { Staff } from '@/src/zustand/app/Staff'
import { MessageStore } from '@/src/zustand/notification/Message'

const ComponentStaffs: React.FC = () => {
  const url = '/users/staffs/'
  const {
    count,
    getItems,
    massDelete,
    updateItem,
    results,
    toggleAllSelected,
    toggleChecked,
    selectedItems,
    loading,
    toggleActive,
    reshuffleResults,
  } = StaffStore()
  const [currentPage, setCurrentPage] = useState(1)
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const prevPage = useRef(currentPage)
  const { setMessage } = MessageStore()
  const pathname = usePathname()

  useEffect(() => {
    reshuffleResults()
  }, [pathname])

  useEffect(() => {
    reshuffleResults()
    if (results.length === 0 || currentPage !== prevPage.current) {
      const params = `?page_size=${page_size}&page=${currentPage}&ordering=${sort}`
      getItems(`${url}${params}`, setMessage)
    }
    prevPage.current = currentPage
  }, [getItems, results.length, currentPage])

  const makeUser = async (staff: Staff) => {
    const data = {
      userStatus: 'User',
      isUser: true,
      isActive: false,
    }
    const params = `?page_size=${page_size}&page=${currentPage}&ordering=${sort}`
    await updateItem(
      `${url}${staff._id}/${params}&return=many`,
      data,
      setMessage
    )
  }

  const DeleteItems = async () => {
    if (selectedItems.length === 0) {
      setMessage('Please select at least one user to delete', false)
      return
    }
    await massDelete(`${url}mass-delete/`, selectedItems, setMessage)
  }
  return (
    <>
      <div className="card_body">
        <div className="custom_sm_title">Table of Staffs</div>
        <div className="overflow-auto mb-5">
          {results.length > 0 ? (
            <table className="">
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Picture</th>
                  <th>Username</th>
                  <th>Contact</th>
                  <th>Position</th>
                  <th>Level</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item, index) => (
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
                      {item.isActive && (
                        <div className="card_list">
                          <span
                            onClick={() => toggleActive(index)}
                            className="more_close "
                          >
                            X
                          </span>
                          <Link
                            className="card_list_item"
                            href={`/team/company/staffs/edit-staff/?id=${item._id}&name=${item.username}`}
                          >
                            Edit Staff
                          </Link>
                          <div
                            onClick={() => makeUser(item)}
                            className="card_list_item"
                          >
                            Make User
                          </div>
                        </div>
                      )}
                    </td>
                    <td>
                      {item.picture ? (
                        <Image
                          alt={`email of ${item.picture}`}
                          src={item.picture}
                          width={0}
                          sizes="100vw"
                          height={0}
                          style={{ width: '50px', height: 'auto' }}
                        />
                      ) : (
                        <span>N/A</span>
                      )}
                    </td>
                    <td>{item.username}</td>
                    <td>
                      <div>{item.email}</div>
                      <div>{item.phone}</div>
                    </td>
                    <td>
                      <div>{item.position}</div>
                      <div>{item.salary}</div>
                    </td>
                    <td>
                      <div>{item.level}</div>
                      <div>{item.role}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="relative flex justify-center">
              <div className="not_found_text">No Staff Found</div>
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
        <div className="table_nav ">
          {loading ? (
            <button className="custom_btn ">
              <i className="bi bi-opencollective loading"></i>

              <div>Processing...</div>
            </button>
          ) : (
            <>
              <button className="custom_btn line" onClick={toggleAllSelected}>
                <div
                  className={`checkbox ${
                    selectedItems.length > 0 ? 'active' : ''
                  }`}
                >
                  {selectedItems.length > 0 && (
                    <i className="bi bi-check text-white text-lg"></i>
                  )}
                </div>
                Select All
              </button>
              <button className="custom_btn line" onClick={DeleteItems}>
                <i className="bi bi-trash text-lg mr-2"></i>
                Delete
              </button>
              <Link
                href="/team/company/staffs/create-position"
                className="custom_btn "
              >
                Create Position
              </Link>
              <Link
                href="/team/company/staffs/positions"
                className="custom_btn ml-auto"
              >
                Positons
              </Link>
            </>
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

export default ComponentStaffs
