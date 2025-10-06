'use client'
import { playPopSound } from '@/lib/sound'
import {
  OfficeNotification,
  OfficeNotificationStore,
} from '@/src/zustand/notification/OfficeNotification'
import { BioUser } from '@/src/zustand/user/BioUser'
import { BioUserSchoolInfo } from '@/src/zustand/user/BioUserSchoolInfo'
import { BioUserState } from '@/src/zustand/user/BioUserState'
import { User } from '@/src/zustand/user/User'
import OfficeStore, { Office } from '@/src/zustand/utility/Office'
import { useEffect, ReactNode, createContext } from 'react'
import { useGeneralContext } from '../GeneralContext'
import SchoolStore from '@/src/zustand/school/School'

const SchoolMessageContext = createContext(undefined)

interface SchoolMessageProviderProps {
  children: ReactNode
}

interface NotificationData {
  officialMessage: OfficeNotification
  personalMessage: OfficeNotification

  socialNotification: OfficeNotification
  counts: number
  unreadStaffs: number
  senderCounts: number
  receiverCount: number
  bioUserState: BioUserState
  bioUser: BioUser
  user: User
  activeOffice: Office
  userOffices: Office[]
  bioUserSchoolInfo: BioUserSchoolInfo
}

export const SchoolMessageProvider = ({
  children,
}: SchoolMessageProviderProps) => {
  const { socket } = useGeneralContext()
  const { officeForm } = OfficeStore()

  useEffect(() => {
    if (!officeForm || !socket) return
    ///////////////LISTEN TO OFFICIAL MESSAGES///////////////
    socket.on(
      `official_message_${officeForm.username}`,
      (data: NotificationData) => {
        playPopSound()
        if (data.officialMessage) {
          OfficeNotificationStore.setState((prev) => {
            const notes = [data.officialMessage, ...prev.officialMessages]
            return {
              officialMessages: notes,
            }
          })
          if (data.unreadStaffs) {
            SchoolStore.setState({
              unreadStaffs: data.unreadStaffs,
            })
          }
          if (data.receiverCount) {
            SchoolStore.setState({
              unreadMessages: data.receiverCount,
            })
          }
        }
      }
    )

    ///////////////LISTEN TO OFFICIAL PERSONAL MESSAGES///////////////
    socket.on(
      `official_message_${officeForm.bioUserUsername}`,
      (data: NotificationData) => {
        playPopSound()
        if (data.officialMessage) {
          OfficeNotificationStore.setState((prev) => {
            const notes = [data.officialMessage, ...prev.officialMessages]
            return {
              officialMessages: notes,
            }
          })
          if (data.unreadStaffs) {
            SchoolStore.setState({
              unreadStaffs: data.unreadStaffs,
            })
          }
          if (data.receiverCount) {
            SchoolStore.setState({
              unreadMessages: data.receiverCount,
            })
          }
        }
      }
    )

    return () => {
      socket?.off(`official_message_${officeForm.bioUserUsername}`)
      socket?.off(`official_message_${officeForm.username}`)
    }
  }, [socket, officeForm])

  return (
    <SchoolMessageContext.Provider value={undefined}>
      {children}
    </SchoolMessageContext.Provider>
  )
}
