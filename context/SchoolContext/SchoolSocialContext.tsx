'use client'
import { playPopSound } from '@/lib/sound'
import { UserNotification } from '@/src/zustand/notification/UserNotification'
import { User } from '@/src/zustand/user/User'
import { createContext, useEffect, ReactNode } from 'react'
import { MessageStore } from '@/src/zustand/notification/Message'
import { usePathname } from 'next/navigation'
import { OfficeNotificationStore } from '@/src/zustand/notification/OfficeNotification'
import OfficeStore, { Office } from '@/src/zustand/utility/Office'
import { useGeneralContext } from '../GeneralContext'
import SchoolStore from '@/src/zustand/school/School'
import StudentStore from '@/src/zustand/school/Student'

const SchoolSocialContext = createContext(undefined)

interface SchoolSocialProviderProps {
  children: ReactNode
}

interface NotificationData {
  socialNotification: UserNotification
  officeSocialNotification: UserNotification
  staff: Office
  count: number
  unreadNotifications: number
  unreadStudents: number
  user: User
}

export const SchoolSocialProvider = ({
  children,
}: SchoolSocialProviderProps) => {
  const { socket } = useGeneralContext()
  const { officeForm } = OfficeStore()
  const { officeSocialNotifications, readOfficialSocialNotifications } =
    OfficeNotificationStore()
  const { setMessage } = MessageStore()
  const pathname = usePathname()

  ///////////////// READ OFFICIAL SOCIAL NOTIFICATIONS ////////////////
  useEffect(() => {
    if (
      pathname === '/school/messages/social' &&
      officeSocialNotifications &&
      officeForm.username
    ) {
      const notes = officeSocialNotifications.filter(
        (e) => e.unread === true && e.receiverUsername === officeForm.username
      )
      if (notes.length > 0) {
        const noteIds = notes.map((note) => note._id)
        const form = new FormData()
        form.append('ids', JSON.stringify(noteIds))
        readOfficialSocialNotifications(
          `/notifications/social/read?username=${officeForm?.username}`,
          form,
          setMessage
        )
      }
    }
  }, [pathname, officeForm, officeSocialNotifications])

  ///////////////// LISTEN OFFICIAL SOCIAL NOTIFICATIONS ////////////////
  useEffect(() => {
    if (!officeForm || !socket) return

    socket.on(
      `school_social_notification_${officeForm.username}`,
      (data: NotificationData) => {
        playPopSound()
        if (data.socialNotification) {
          OfficeNotificationStore.setState((prev) => {
            const notes = [
              data.socialNotification,
              ...prev.officeSocialNotifications,
            ]
            return {
              officeSocialNotifications: notes,
              unreadSocials: data.unreadNotifications,
            }
          })
        }

        if (data.unreadStudents) {
          SchoolStore.setState({
            unreadStudents: data.unreadStudents,
            unreadNotifications: data.unreadNotifications,
          })

          StudentStore.setState((prev) => {
            const applicants = [data.staff, ...prev.applicants]
            return {
              applicants: applicants,
            }
          })
        }
      }
    )

    return () => {
      socket?.off(`school_social_notification_${officeForm.username}`)
    }
  }, [socket, officeForm])

  return (
    <SchoolSocialContext.Provider value={undefined}>
      {children}
    </SchoolSocialContext.Provider>
  )
}
