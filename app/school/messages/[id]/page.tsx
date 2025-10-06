'use client'
import { formatDate } from '@/lib/helpers'
import { OfficeNotificationStore } from '@/src/zustand/notification/OfficeNotification'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import { MessageStore } from '@/src/zustand/notification/Message'

export default function UtilsDashboard() {
  const { setMessage } = MessageStore()
  const { officialMessage, getOfficialMessage } = OfficeNotificationStore()
  const { id } = useParams()

  useEffect(() => {
    if (id) {
      getOfficialMessage(`/messages/official/${id}`, setMessage)
    }
  }, [id])

  return (
    <div className="flex-1 flex flex-col text-[var(--text-primary)] w-full">
      <div className="card_body flex-col flex flex-1 sharp">
        <div className="text-start sm:text-lg ml-auto mb-5">
          <div className="mb-1">{officialMessage?.senderAddress}</div>
          <div className="mb-1">
            {officialMessage?.senderArea}, {officialMessage?.senderState}
          </div>
          <div className="mb-1">
            {formatDate(String(officialMessage.createdAt))}
          </div>
        </div>
        <div className="text-start mr-auto mb-5 sm:text-lg">
          <div className="mb-1">The Management</div>
          <div className="mb-1">{officialMessage?.receiverName}</div>
          <div className="mb-1">
            {officialMessage?.receiverArea}, {officialMessage?.receiverState}
          </div>
        </div>
        <div className="text-center text-lg mb-3 uppercase text-[var(--text-secondary)]">
          {officialMessage.title}
        </div>
        <div
          className="p-1 sm:p-3 bg-[var(--secondary)]"
          dangerouslySetInnerHTML={{ __html: officialMessage.content }}
        ></div>
      </div>
    </div>
  )
}
