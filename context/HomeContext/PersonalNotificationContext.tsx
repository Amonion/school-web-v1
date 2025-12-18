'use client'
import { playPopSound } from '@/lib/sound'
import useSocket from '@/src/useSocket'
import { MessageStore } from '@/src/zustand/notification/Message'
import {
  UserNotification,
  UserNotificationStore,
} from '@/src/zustand/notification/UserNotification'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { BioUser } from '@/src/zustand/user/BioUser'
import { BioUserSchoolInfo } from '@/src/zustand/user/BioUserSchoolInfo'
import { BioUserState } from '@/src/zustand/user/BioUserState'
import { User } from '@/src/zustand/user/User'
import { Office } from '@/src/zustand/utility/Office'
import { usePathname } from 'next/navigation'
import { createContext, useEffect, useContext, ReactNode, useMemo } from 'react'

const PersonalNotificationContext = createContext<{
  socket: ReturnType<typeof useSocket> | null
}>({
  socket: null,
})

interface PersonalNotificationProviderProps {
  children: ReactNode
}

interface NotificationData {
  personalNotification: UserNotification
  officialNotification: UserNotification
  count: number
  bioUserState: BioUserState
  bioUser: BioUser
  user: User
  activeOffice: Office
  userOffices: Office[]
  bioUserSchoolInfo: BioUserSchoolInfo
}

export const PersonalNotificationProvider = ({
  children,
}: PersonalNotificationProviderProps) => {
  const socket = useSocket()
  const { personalNotifications, readPersonalNotifications } =
    UserNotificationStore()
  const { setMessage } = MessageStore()
  const pathname = usePathname()
  const { bioUser } = AuthStore()

  useEffect(() => {
    if (
      pathname === '/home/notifications/personal' &&
      bioUser &&
      personalNotifications
    ) {
      const notes = personalNotifications.filter((e) => e.unread === true)
      if (notes.length > 0) {
        const noteIds = notes.map((note) => note._id)
        const form = new FormData()
        form.append('ids', JSON.stringify(noteIds))
        readPersonalNotifications(
          `/notifications/personal/read/?username=${bioUser?.bioUserUsername}`,
          form,
          setMessage
        )
      }
    }
  }, [pathname, bioUser?._id, personalNotifications])

  useEffect(() => {
    if (!bioUser || !socket) return
    //////////////PERSONAL NOTIFICATION//////////////

    socket.on(
      `personal_notification_${bioUser._id}`,
      (data: NotificationData) => {
        playPopSound()

        if (data.personalNotification) {
          UserNotificationStore.setState((prev) => {
            const notes = [
              data.personalNotification,
              ...prev.personalNotifications,
            ]
            return {
              personalNotifications: notes,
              personalUnread: data.count,
            }
          })
        }
        if (data.bioUserState) {
          AuthStore.getState().setAllUser(data.bioUserState, data.bioUser)
        }
        if (data.user) {
          AuthStore.getState().setUser(data.user)
        }
      }
    )

    //////////////STATE UPDATE//////////////
    return () => {
      socket?.off(`personal_notification_${bioUser._id}`)
    }
  }, [socket, bioUser?._id])

  const value = useMemo(() => ({ socket }), [socket])

  return (
    <PersonalNotificationContext.Provider value={value}>
      {children}
    </PersonalNotificationContext.Provider>
  )
}

export const usePersonalNotificationContext = () =>
  useContext(PersonalNotificationContext)
