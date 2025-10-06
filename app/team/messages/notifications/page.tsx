'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Pagination from '@/components/Team/Pagination'
import { MessageStore } from '@/src/zustand/notification/Message'
import NotificationStore from '@/src/zustand/notification/NotificationTemplate'

const Emails: React.FC = () => {
  const url = '/notifications/templates/'
  const {
    getItems,
    massDelete,
    deleteItem,
    results,
    toggleAllSelected,
    toggleChecked,
    selectedItems,
    loading,
    count,
    toggleActive,
    reshuffleResults,
  } = NotificationStore()
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
      const params = `?page_size=${page_size}&page=${currentPage}&ordering=${sort}&officeUsername=Schooling`
      getItems(`${url}${params}`, setMessage)
    }
    prevPage.current = currentPage
  }, [currentPage])

  const deleteEmail = async (id: string) => {
    await deleteItem(`${url}${id}/`, setMessage)
  }

  const DeleteItems = async () => {
    if (selectedItems.length === 0) {
      setMessage('Please select at least one email to delete', false)
      return
    }
    await massDelete(`${url}mass-delete/`, selectedItems, setMessage)
  }
  return (
    <>
      <div className="card_body">
        <div className="custom_sm_title">Table of Notifications</div>
        <div className="overflow-auto mb-5">
          {results.length > 0 ? (
            <table className="">
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Name</th>
                  <th>Title</th>
                  <th>Greetings</th>
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
                            href={`/team/messages/notifications/create-notification?id=${item._id}&name=${item.name}`}
                          >
                            Edit Notification
                          </Link>
                          <div
                            className="card_list_item"
                            onClick={() => deleteEmail(item._id)}
                          >
                            Delete Notification
                          </div>
                        </div>
                      )}
                    </td>

                    <td>{item.name}</td>
                    <td>{item.title}</td>
                    <td>{item.greetings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="relative flex justify-center">
              <div className="not_found_text">No Notification Found</div>
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
        <div className="table-action flex-wrap flex mb-4">
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
                href="/team/messages/notifications/create-notification"
                className="custom_btn ml-auto"
              >
                Create Notification
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

export default Emails
