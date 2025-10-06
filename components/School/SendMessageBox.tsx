'use client'
import { formatDate } from '@/lib/helpers'
import { MessageStore } from '@/src/zustand/notification/Message'
import { useEffect, useState } from 'react'
import NotificationTemplateStore, {
  NotificationTemplate,
} from '@/src/zustand/notification/NotificationTemplate'
import OfficeStore from '@/src/zustand/utility/Office'

interface SendMessageProps {
  handleSubmit: () => void
  setDisplayBox: (state: boolean) => void
  action: string
}

const SendMessage: React.FC<SendMessageProps> = ({
  handleSubmit,
  setDisplayBox,
  action,
}) => {
  const { formData, results, page_size, currentPage, getItems } =
    NotificationTemplateStore()
  const [isNotification, setIsNotification] = useState(false)
  const { officeForm } = OfficeStore()
  const { setMessage } = MessageStore()

  useEffect(() => {
    if (!officeForm.username) return
    getItems(
      `/offices/notification-templates/?officeUsername=${officeForm?.username}&page_size=${page_size}&page=${currentPage}`,
      setMessage
    )
  }, [officeForm])

  const selectNotification = (item: NotificationTemplate) => {
    NotificationTemplateStore.setState({ formData: item })
    setIsNotification(false)
  }
  return (
    <div
      onClick={() => setDisplayBox(false)}
      className="fixed bg-black/50  w-full h-full flex items-center justify-center z-40 top-0 left-0"
    >
      <div
        onClick={(e) => {
          e.stopPropagation()
        }}
        className="flex w-full max-w-[1200px]"
      >
        <div className="w-0 md:w-[290px]"></div>
        <div className="card_body w-full overflow-auto min-h-[300px] max-h-[100vh] sharp flex-1 border border-[var(--border)]">
          <div className="flex flex-col relative mb-4">
            <div
              onClick={() => {
                setIsNotification(!isNotification)
              }}
              className="form-input cursor-pointer min-w-[250px]"
            >
              {formData?.title ? formData?.title : 'Select Message to Send'}
              <i className="ml-auto bi bi-caret-down-fill"></i>
            </div>

            {isNotification && results.length > 0 && (
              <div className="dropdownList top-[50px]">
                {results.map((item, index) => (
                  <div
                    onClick={() => selectNotification(item)}
                    key={index}
                    className="input_drop_list"
                  >
                    {item.title}
                  </div>
                ))}
              </div>
            )}
          </div>

          {formData.title && (
            <div className="flex flex-col">
              <div className="text-start ml-auto mb-5 sm:text-lg">
                <div className="mb-1">The Management</div>
                <div className="mb-1">{officeForm?.name}</div>
                <div className="mb-1">
                  {officeForm?.area}, {officeForm?.state}
                </div>
                <div className="mb-1">{formatDate(new Date())}</div>
              </div>
              <div className="text-start sm:text-lg mr-auto mb-5">
                <div className="mb-1">The Receiver Name</div>
                <div className="mb-1">
                  The Receiver Address, The Receiver Area
                </div>
                <div className="mb-1">
                  The Receiver State, The Receiver Country.
                </div>
                <div className="mb-1">Dear Receiver,</div>
              </div>
            </div>
          )}

          {formData.title && (
            <div className="text-center text-lg mb-3 uppercase text-[var(--text-secondary)]">
              {formData.title}
            </div>
          )}
          {formData.content && (
            <div
              className="mb-5"
              dangerouslySetInnerHTML={{ __html: formData.content }}
            ></div>
          )}
          {formData.title && (
            <div className="table-action flex flex-wrap">
              <button
                className="custom_btn mr-3 success"
                onClick={() => handleSubmit()}
              >
                {action}
              </button>

              <button
                className="custom_btn ml-auto"
                onClick={() => setDisplayBox(false)}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SendMessage
