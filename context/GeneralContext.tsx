'use client'
import { initializeSound } from '@/lib/sound'
import useSocket from '@/src/useSocket'
import { MessageStore } from '@/src/zustand/notification/Message'
import SchoolStore from '@/src/zustand/school/School'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import OfficeStore from '@/src/zustand/utility/Office'
import axios from 'axios'
import { createContext, useEffect, useContext, ReactNode, useMemo } from 'react'

const GeneralContext = createContext<{
  socket: ReturnType<typeof useSocket> | null
}>({
  socket: null,
})

interface GeneralProviderProps {
  children: ReactNode
}

export const GeneralProvider = ({ children }: GeneralProviderProps) => {
  const socket = useSocket()
  const { setIp, setBaseUrl, setMessage, baseURL } = MessageStore()
  const { user } = AuthStore()
  const { getSchoolNotifications } = SchoolStore()
  const { officeForm } = OfficeStore()

  useEffect(() => {
    initializeSound()

    const url =
      process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_PROD_API_URL
        : process.env.NEXT_PUBLIC_DEV_API_URL
    setBaseUrl(String(url))
  }, [])

  useEffect(() => {
    //***********GET AND STORE IP ***********//
    const getIp = async () => {
      try {
        const response = await axios.get(`${baseURL}user-ip`)
        const { ip } = response.data
        setIp(ip)
        localStorage.setItem('ip', ip)
        updateUserPresence(ip, true)
      } catch (error) {
        console.error('Error fetching user location:', error)
      }
    }

    //***********GET AND STORE IP ***********//
    const handleEnter = () => {
      if (baseURL) {
        const retrievedIp = localStorage.getItem('ip')
        if (
          retrievedIp !== null &&
          retrievedIp !== undefined &&
          retrievedIp !== 'undefined'
        ) {
          updateUserPresence(retrievedIp, true)
        } else {
          getIp()
        }
      }
    }

    const handleExit = () => {
      const retrievedIp = localStorage.getItem('ip')
      if (
        retrievedIp !== null &&
        retrievedIp !== undefined &&
        retrievedIp !== 'undefined'
      ) {
        updateUserPresence(retrievedIp, false)
      }
    }

    window.addEventListener('beforeunload', handleExit)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') handleEnter()
    })

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') handleExit()
    })

    return () => {
      window.removeEventListener('beforeunload', handleExit)
      document.removeEventListener('visibilitychange', handleExit)
    }
  }, [baseURL, socket])

  ///////////////GET SCHOOL NOTIFICATIONS///////////////
  useEffect(() => {
    if (!officeForm) return
    if (!officeForm.username) return
    getSchoolNotifications(
      `/schools/notifications/?username=${officeForm.username}`,
      setMessage
    )
  }, [officeForm])

  const updateUserPresence = async (ip: string, online: boolean) => {
    try {
      const data = {
        ip: ip,
        username: user?.username,
        userId: user?._id,
        bioUserId: user?.bioUserId,
        online: online,
        visitedAt: new Date(),
      }

      const formData = {
        data: data,
        to: 'users',
        action: 'visit',
      }

      socket?.emit('message', formData)
    } catch (error) {
      console.error('Error fetching user location:', error)
    }
  }

  const value = useMemo(() => ({ socket }), [socket])

  return (
    <GeneralContext.Provider value={value}>{children}</GeneralContext.Provider>
  )
}

export const useGeneralContext = () => useContext(GeneralContext)
