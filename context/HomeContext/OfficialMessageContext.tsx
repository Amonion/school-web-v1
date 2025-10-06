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

const OfficialMessageContext = createContext<{
  socket: ReturnType<typeof useSocket> | null
}>({
  socket: null,
})

interface OfficialMessageProviderProps {
  children: ReactNode
}

interface NotificationData {
  personalNotification: UserNotification
  officialMessage: UserNotification
  count: number
  receiverCount: number
  bioUserState: BioUserState
  bioUser: BioUser
  user: User
  activeOffice: Office
  userOffices: Office[]
  bioUserSchoolInfo: BioUserSchoolInfo
}

export const OfficialMessageProvider = ({
  children,
}: OfficialMessageProviderProps) => {
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
  }, [pathname, bioUser, personalNotifications])

  useEffect(() => {
    if (!bioUser || !socket) return

    socket.on(`stats_${bioUser.bioUserUsername}`, (data: NotificationData) => {
      if (data.bioUserState) {
        AuthStore.getState().setBioUserState(data.bioUserState)
      }
    })

    return () => {
      socket?.off(`stats_${bioUser.bioUserUsername}`)
    }
  }, [socket, bioUser])

  useEffect(() => {
    if (!bioUser || !socket) return
    //////////////PERSONAL NOTIFICATION//////////////
    socket.on(
      `official_message_${bioUser.bioUserUsername}`,
      (data: NotificationData) => {
        playPopSound()
        if (data.officialMessage) {
          UserNotificationStore.setState((prev) => {
            const notes = [data.officialMessage, ...prev.officialMessages]
            return {
              officialMessages: notes,
              officialUnread: data.receiverCount,
            }
          })
        }
        if (data.bioUserState) {
          AuthStore.getState().setBioUserState(data.bioUserState)
        }
      }
    )

    socket.on(
      `update_state_${bioUser.bioUserUsername}`,
      (data: NotificationData) => {
        AuthStore.getState().setBioUserState(data.bioUserState)
      }
    )

    return () => {
      socket?.off(`official_message_${bioUser.bioUserUsername}`)
      socket?.off(`update_state_${bioUser.bioUserUsername}`)
    }
  }, [socket, bioUser])

  const value = useMemo(() => ({ socket }), [socket])

  return (
    <OfficialMessageContext.Provider value={value}>
      {children}
    </OfficialMessageContext.Provider>
  )
}

export const useOfficialMessageContext = () =>
  useContext(OfficialMessageContext)
