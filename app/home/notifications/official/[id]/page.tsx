'use client'
import { formatDate } from '@/lib/helpers'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import { MessageStore } from '@/src/zustand/notification/Message'
import { UserNotificationStore } from '@/src/zustand/notification/UserNotification'

export default function UtilsDashboard() {
  const { setMessage } = MessageStore()
  const { personalMessage, getPersonalMessage } = UserNotificationStore()
  const { id } = useParams()

  useEffect(() => {
    if (id) {
      getPersonalMessage(`/messages/official/${id}`, setMessage)
    }
  }, [id])

  return (
    <div className="flex-1 flex flex-col text-[var(--text-primary)] w-full">
      <div className="card_body flex-col flex flex-1 sharp">
        <div className="text-start text-[var(--text-secondary)] sm:text-lg ml-auto mb-5">
          <div className="">{personalMessage?.senderName}</div>
          <div className="">{personalMessage?.senderAddress}</div>
          <div className="">
            {personalMessage?.senderArea}, {personalMessage?.senderState}
          </div>
          <div className="">
            {formatDate(String(personalMessage?.createdAt))}
          </div>
        </div>
        <div className="text-start text-[var(--text-secondary)] mr-auto sm:text-lg">
          <div className="">{personalMessage?.receiverName}</div>
          <div className="">{personalMessage?.receiverAddress}</div>
          <div className="">
            {personalMessage?.receiverArea}, {personalMessage?.receiverState}
          </div>
        </div>
        {personalMessage.greetings && (
          <div className="flex">{personalMessage.greetings}</div>
        )}
        <div className="text-center text-lg my-3 uppercase text-[var(--text-secondary)]">
          {personalMessage?.title}
        </div>
        <div
          className=""
          dangerouslySetInnerHTML={{ __html: personalMessage?.content }}
        ></div>
      </div>
    </div>
  )
}
