'use client'
import { formatDate } from '@/lib/helpers'
import SchoolStore from '@/src/zustand/school/School'
import { MessageStore } from '@/src/zustand/notification/Message'
import QuillEditor from '@/components/Team/Editor/QuillEditor'

interface Messagenger {
  address: string
  area: string
  state: string
  country: string
  name: string
}

interface MessageFormProps {
  sender: Messagenger
  receiver: Messagenger
  referrence: string
  buttonName: string
  handleSubmit: () => void
}

const MessageForm: React.FC<MessageFormProps> = ({
  sender,
  receiver,
  referrence,
  buttonName,
  handleSubmit,
}) => {
  const { setApplicationForm } = SchoolStore()
  const {
    messageContent,
    messageGreetings,
    messageTitle,
    setMessageTitle,
    setMessageGreeting,
    setMessageContent,
  } = MessageStore()

  return (
    <div className="fixed bg-black/50  w-full h-full flex items-end justify-center z-40 top-0 left-0">
      <div className="flex max-w-[1300px]">
        <div className="card_body sharp overflow-auto max-h-[100vh] flex-1 flex flex-col border border-[var(--border)]">
          <div className="text-start ml-auto mb-2">
            <div className="mb-1">{sender?.name}</div>
            <div className="mb-1">{sender?.address}</div>
            <div className="mb-1">
              {sender?.area}, {sender?.state}, {sender?.country}
            </div>
            <div className="mb-1">{formatDate(new Date())}</div>
          </div>

          <div className="text-start mr-auto">
            <div className="mb-1">{referrence}</div>
            <div className="mb-1">{receiver?.name}</div>
            <div className="mb-1">
              {receiver?.area}, {receiver?.state}
            </div>
            <div className="mb-1">{receiver?.country},</div>
          </div>
          <div className="flex justify-start mb-3">
            <input
              className="bg-[var(--secondary)] p-2 outline-none border-none"
              value={messageGreetings}
              onChange={(e) => setMessageGreeting(e.target.value)}
              type="text"
              placeholder={`Dear [Receiver]`}
            />
          </div>
          {/* <div className="text-center text-lg mb-3 uppercase text-[var(--text-secondary)]">
            {messageTitle}
          </div> */}
          <div className="flex justify-center mb-3">
            <input
              className="bg-[var(--secondary)] w-full max-w-[500px] p-2 outline-none border-none"
              value={messageTitle}
              onChange={(e) => setMessageTitle(e.target.value)}
              type="text"
              placeholder="Write your message title"
            />
          </div>
          <QuillEditor
            contentValue={messageContent}
            placeHolder="Write your letter here"
            onChange={(content) => setMessageContent(content)}
          />
          <div className="flex items-center">
            <button
              className="custom_btn success mr-auto"
              onClick={() => handleSubmit()}
            >
              {buttonName}
            </button>

            <button
              className="custom_btn"
              onClick={() => setApplicationForm(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessageForm
