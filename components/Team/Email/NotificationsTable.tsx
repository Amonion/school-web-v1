'use client'
import Link from 'next/link'
import Image from 'next/image'
import _debounce from 'lodash/debounce'
import { useState, useEffect, useRef } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { MessageStore } from '@/src/zustand/notification/Message'
import NotificationStore, {
  NotificationTemplate,
} from '@/src/zustand/notification/NotificationTemplate'
import LinkedPagination from '../LinkedPagination'
import CreateNotificationTemplate from './CreateNotification'
import NotificationTemplateStore from '@/src/zustand/notification/NotificationTemplate'

const NotificationsTable: React.FC = () => {
  const url = '/notifications/templates/'
  const {
    notificationTemplates,
    selectedItems,
    loading,
    searchedNotificationTemplates,
    isAllChecked,
    showForm,
    count,
    setShowForm,
    resetForm,
    toggleAllSelected,
    getItems,
    searchNotifications,
    massDelete,
    toggleChecked,
    reshuffleResults,
  } = NotificationStore()
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { setMessage } = MessageStore()
  const pathname = usePathname()
  const inputRef = useRef<HTMLInputElement>(null)
  const { page } = useParams()

  useEffect(() => {
    reshuffleResults()
  }, [pathname])

  useEffect(() => {
    reshuffleResults()
    if (notificationTemplates.length === 0) {
      const params = `?page_size=${page_size}&page=${
        page ? page : 1
      }&ordering=${sort}&officeUsername=Schooling`
      getItems(`${url}${params}`, setMessage)
    }
  }, [page])

  const DeleteItems = async () => {
    if (selectedItems.length === 0) {
      setMessage('Please select at least one email to delete', false)
      return
    }
    await massDelete(`${url}mass-delete/`, selectedItems, setMessage)
  }

  const getItem = async (email: NotificationTemplate) => {
    setShowForm(true)
    NotificationTemplateStore.setState({ notificationTemplateForm: email })
  }

  const toggleForm = async () => {
    resetForm()
    setShowForm(true)
  }

  const handleSearchNotifications = _debounce(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (value.trim().length > 0) {
        searchNotifications(
          `${url}search?name=${value}&title=${value}&page_size=${page_size}`
        )
      } else {
        NotificationStore.setState({ searchedNotificationTemplates: [] })
      }
    },
    1000
  )
  return (
    <>
      <div className="overflow-auto mb-5">
        <div className="card_body sharp mb-5">
          <div className="text-lg text-[var(--text-secondary)]">
            Table of Notifications
          </div>
          <div className="relative mb-2">
            <div className={`input_wrap ml-auto active `}>
              <input
                ref={inputRef}
                type="search"
                onChange={handleSearchNotifications}
                className={`transparent-input flex-1 `}
                placeholder="Search notifications"
              />
              {loading ? (
                <i className="bi bi-opencollective common-icon loading"></i>
              ) : (
                <i className="bi bi-search common-icon cursor-pointer"></i>
              )}
            </div>

            {searchedNotificationTemplates.length > 0 && (
              <div
                className={`dropdownList ${
                  searchedNotificationTemplates.length > 0
                    ? 'overflow-auto'
                    : 'overflow-hidden h-0'
                }`}
              >
                {searchedNotificationTemplates.map((item, index) => (
                  <div key={index} className="input_drop_list">
                    <Link
                      href={`/school/students/student/${item._id}`}
                      className="flex-1"
                    >
                      {item.title}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {notificationTemplates.length > 0 ? (
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
                <th>Name</th>
                <th>Title</th>
                <th>Greetings</th>
              </tr>
            </thead>
            <tbody>
              {notificationTemplates.map((item, index) => (
                <tr
                  key={index}
                  className={`${index % 2 === 1 ? 'bg-[var(--primary)]' : ''} `}
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
                    <div
                      onClick={() => getItem(item)}
                      className="card_list_item"
                    >
                      {item.name}
                    </div>
                  </td>
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

      <div className=" card_body sharp mb-5">
        {loading ? (
          <button className="custom_btn ">
            <i className="bi bi-opencollective loading"></i>

            <div>Processing...</div>
          </button>
        ) : (
          <div className="flex items-center gap-5 w-full">
            <i
              onClick={DeleteItems}
              className="bi bi-trash text-lg cursor-pointer text-[var(--custom)]"
            ></i>
            <div onClick={toggleForm} className="custom_btn ml-auto">
              Create Notification
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
          url="/team/messages/notifications"
          count={count}
          page_size={20}
        />
      </div>

      {showForm && <CreateNotificationTemplate />}
    </>
  )
}

export default NotificationsTable
