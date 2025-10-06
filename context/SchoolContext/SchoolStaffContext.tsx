'use client'
import { playPopSound } from '@/lib/sound'
import {
  OfficeNotification,
  OfficeNotificationStore,
} from '@/src/zustand/notification/OfficeNotification'
import OfficeStore, { Office } from '@/src/zustand/utility/Office'
import { useEffect, ReactNode, createContext } from 'react'
import { useGeneralContext } from '../GeneralContext'
import StaffStore from '@/src/zustand/school/Staff'
import SchoolStore from '@/src/zustand/school/School'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { BioUserState } from '@/src/zustand/user/BioUserState'

const SchoolStaffContext = createContext(undefined)

interface SchoolStaffProviderProps {
  children: ReactNode
}

interface NotificationData {
  staff: Office
  student: Office
  socialNotification: OfficeNotification
  officialMessage: OfficeNotification
  counts: number
  senderCount: number
  unreadStaffs: number
  unreadNotifications: number
  removeId: string
  bioUserState: BioUserState
  office: Office
  bioUserId: string
  action: string
  accepted: boolean
}

export const SchoolStaffProvider = ({ children }: SchoolStaffProviderProps) => {
  const { socket } = useGeneralContext()
  const { officeForm } = OfficeStore()
  const { bioUser } = AuthStore()

  ///////////////LISTEN TO STAFF NOTIFICATIONS///////////////
  useEffect(() => {
    if (!officeForm || !socket) return

    socket.on(
      `school_staff_${officeForm.username}`,
      (data: NotificationData) => {
        playPopSound()
        if (data.action === 'cancel_application') {
          StaffStore.setState((prev) => {
            const newApplicants = prev.applicants.filter(
              (item) => item.bioUserId !== data.bioUserId
            )
            return {
              applicants: newApplicants,
            }
          })

          OfficeNotificationStore.setState((prev) => {
            const notes = [
              data.socialNotification,
              ...prev.officeSocialNotifications,
            ]
            const newMessaes = prev.officialMessages.filter(
              (item) => item._id !== data.removeId
            )
            return {
              officialMessages: newMessaes,
              officeSocialNotifications: notes,
            }
          })

          SchoolStore.setState({
            unreadNotifications: data.unreadNotifications,
            unreadStaffs: data.unreadStaffs,
          })
        } else if (data.action === 'role_assignment') {
          console.log(data)
          AuthStore.getState().setBioUserState(data.bioUserState)
          OfficeStore.setState({ officeForm: data.office })
        } else if (data.accepted) {
          OfficeNotificationStore.setState((prev) => {
            const notes = [data.officialMessage, ...prev.officialMessages]
            return {
              officialMessages: notes,
            }
          })

          SchoolStore.setState({ unreadMessages: data.senderCount })
          StaffStore.setState((prev) => {
            const applicants = prev.applicants.filter(
              (item) => item.bioUserId !== data.removeId
            )
            console.log(applicants)
            return {
              applicants,
            }
          })
        }
      }
    )

    socket.on(
      `school_staff_${bioUser?.bioUserUsername}`,
      (data: NotificationData) => {
        playPopSound()
        if (data.action === 'role_assignment') {
          AuthStore.getState().setBioUserState(data.bioUserState)
          OfficeStore.setState({ officeForm: data.office })
        }
      }
    )
    socket.on(
      `school_student_${bioUser?.bioUserUsername}`,
      (data: NotificationData) => {
        playPopSound()
        if (data.action === 'role_assignment') {
          AuthStore.getState().setBioUserState(data.bioUserState)
          OfficeStore.setState({ officeForm: data.student })
        }
      }
    )

    return () => {
      socket?.off(`school_staff_${officeForm.username}`)
      socket?.off(`school_staff_${bioUser?.bioUserUsername}`)
      socket?.off(`school_student_${bioUser?.bioUserUsername}`)
    }
  }, [socket, officeForm])

  return (
    <SchoolStaffContext.Provider value={undefined}>
      {children}
    </SchoolStaffContext.Provider>
  )
}
