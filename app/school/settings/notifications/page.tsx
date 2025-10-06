'use client'
import { appendForm } from '@/lib/helpers'
import { useState, useEffect } from 'react'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import NotificationStore, {
  NotificationTemplateEmpty,
} from '@/src/zustand/notification/NotificationTemplate'
import { validateInputs } from '@/lib/validation'
import { Pen, Trash2 } from 'lucide-react'
import NotFound from '@/components/NotFound'
import NotificationTemplateStore from '@/src/zustand/notification/NotificationTemplate'
import OfficeStore from '@/src/zustand/utility/Office'
import MessageForm from '@/components/School/MessageForm'
import SchoolStore from '@/src/zustand/school/School'

const SchoolNotifications: React.FC = () => {
  const { bioUserState, bioUser } = AuthStore()
  const {
    currentPage,
    page_size,
    results,
    formData,
    loading,
    selectedItems,
    isAllChecked,
    setForm,
    toggleChecked,
    getItem,
    updateItem,
    postItem,
    massDelete,
    deleteItem,
    toggleAllSelected,
    getItems,
  } = NotificationTemplateStore()
  const url = '/offices/notification-templates'
  const { officeForm } = OfficeStore()
  const params = `?officeUsername=${bioUserState?.activeOffice.username}&page_size=${page_size}&page=${currentPage}`
  const [isEditing, setIsEditing] = useState(false)
  const {
    setMessage,
    setMessageGreeting,
    setMessageContent,
    setMessageTitle,
    messageContent,
    messageTitle,
    messageGreetings,
  } = MessageStore()
  const { setAlert } = AlartStore()
  const { showApplicationForm, setApplicationForm } = SchoolStore()

  useEffect(() => {
    setForm('content', messageContent)
    setForm('title', messageTitle)
    setForm('greetings', messageGreetings)
  }, [messageContent, messageTitle, messageGreetings])

  useEffect(() => {
    if (isEditing && formData._id) {
      setMessageGreeting(formData.greetings)
      setMessageContent(formData.content)
      setMessageTitle(formData.title)
    }
  }, [isEditing, formData._id])

  useEffect(() => {
    setMessageGreeting('Dear [Receiver]')
  }, [])

  useEffect(() => {
    if (bioUserState && bioUserState.activeOffice) {
      getItems(`${url}/${params}`, setMessage)
    }
  }, [bioUser])

  const deleteEmail = async (id: string) => {
    setAlert(
      'Warning',
      'Are you sure you want to delete this notification?',
      true,
      () => deleteItem(`${url}/${id}${params}`, setMessage)
    )
  }

  const DeleteItems = async () => {
    if (selectedItems.length === 0) {
      setMessage('Please select at least one email to delete', false)
      return
    }
    setAlert(
      'Warning',
      'Are you sure you want to delete the selected notifications?',
      true,
      () =>
        massDelete(`${url}/mass-delete/${params}`, selectedItems, setMessage)
    )
  }

  const clear = () => {
    setIsEditing(false)
    setApplicationForm(false)
    NotificationStore.setState({ formData: NotificationTemplateEmpty })
  }

  const editItem = (id: string) => {
    getItem(`${url}/${id}`, setMessage)
    setIsEditing(true)
    setApplicationForm(true)
  }

  const handleSubmit = async () => {
    const inputsToValidate = [
      {
        name: 'greetings',
        value: formData.greetings,
        rules: { blank: true },
        field: 'Greetings field',
      },
      {
        name: 'content',
        value: formData.content,
        rules: { blank: true, minLength: 10 },
        field: 'Content field',
      },

      {
        name: 'title',
        value: formData.title,
        rules: { blank: true, minLength: 10 },
        field: 'Title field',
      },
      {
        name: 'officeUsername',
        value: String(officeForm.username),
        rules: { blank: true },
        field: 'Notification name field',
      },
    ]
    const { messages } = validateInputs(inputsToValidate)
    const getFirstNonEmptyMessage = (
      messages: Record<string, string>
    ): string | null => {
      for (const key in messages) {
        if (messages[key].trim() !== '') {
          return messages[key]
        }
      }
      return null
    }

    const firstNonEmptyMessage = getFirstNonEmptyMessage(messages)
    if (firstNonEmptyMessage) {
      setMessage(firstNonEmptyMessage, false)
      return
    }

    const data = appendForm(inputsToValidate)
    if (isEditing) {
      updateItem(`${url}/${formData._id}/${params}`, data, setMessage, () =>
        clear()
      )
    } else {
      await postItem(`${url}/${params}`, data, setMessage, () => clear())
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-start lg:items-center justify-between mb-3">
        <div className="pageTitle mb-1 sm:mb-0">
          <span className="text-[var(--custom)] text-base mr-2 uppercase">
            Notifications:
          </span>
          {bioUserState?.activeOffice?.name}
        </div>
      </div>
      <div className="card_body sharp mb-2">
        <div className="overflow-auto mb-5">
          {results.length > 0 ? (
            <table className="">
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Title</th>
                  <th>Content</th>
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
                        <div className="ml-2">
                          <Pen
                            onClick={() => editItem(item._id)}
                            size={14}
                            className="text-green-500 mb-2 cursor-pointer"
                          />
                          <Trash2
                            onClick={() => deleteEmail(item._id)}
                            size={14}
                            className="text-[var(--custom)] cursor-pointer"
                          />
                        </div>
                      </div>
                    </td>

                    <td>{item.title}</td>
                    <td>
                      <div
                        className="line-clamp-2 overflow-ellipsis"
                        dangerouslySetInnerHTML={{
                          __html: item.content,
                        }}
                      />
                    </td>
                    <td>{item.greetings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <NotFound message="There is no notification" />
          )}
        </div>
      </div>
      <div className="table-action card_body sharp flex flex-wrap">
        {loading ? (
          <button className="custom_btn">
            <i className="bi bi-opencollective loading"></i>
            Processing...
          </button>
        ) : (
          <>
            <div className="flex items-center">
              <div
                className={`checkbox ${isAllChecked ? 'active' : ''}`}
                onClick={() => toggleAllSelected()}
              >
                {isAllChecked && (
                  <i className="bi bi-check text-white text-lg"></i>
                )}
              </div>
              {selectedItems.length > 0 && (
                <div
                  onClick={DeleteItems}
                  className="flex items-center text-[var(--custom)] cursor-pointer ml-5"
                >
                  <Trash2 size={16} className=" mr-2" /> Delete Items
                </div>
              )}
            </div>
            <button
              onClick={() => setApplicationForm(true)}
              className="custom_btn ml-auto "
            >
              Create
            </button>
          </>
        )}
      </div>
      {showApplicationForm && (
        <MessageForm
          sender={{
            address: officeForm.address,
            area: officeForm.area,
            state: officeForm.state,
            country: officeForm.country,
            name: officeForm.name,
          }}
          receiver={{
            address: 'Receiver Addrss',
            area: 'Receiver Area',
            state: 'Receiver State',
            country: 'Receiver Country',
            name: 'Receiver Name',
          }}
          referrence="The Applicant"
          buttonName="Save Message"
          handleSubmit={handleSubmit}
        />
      )}
    </>
  )
}

export default SchoolNotifications
