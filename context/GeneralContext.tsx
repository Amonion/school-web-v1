'use client'
import { initializeSound } from '@/lib/sound'
import useSocket from '@/src/useSocket'
import { MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { User } from '@/src/zustand/user/User'
import axios from 'axios'
import { usePathname } from 'next/navigation'
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
  const { setIp, setBaseUrl, baseURL } = MessageStore()
  const { user } = AuthStore()
  const pathname = usePathname()

  const fetchIp = async () => {
    try {
      const response = await axios.get(`${baseURL}user-ip`)
      const { ip } = response.data
      setIp(ip)
      localStorage.setItem('ip', ip)
    } catch (error) {
      console.error('Error fetching user location:', error)
    }
  }

  useEffect(() => {
    const savedIP = localStorage.getItem('ip')
    if (savedIP) {
      setIp(savedIP)
    } else {
      fetchIp()
    }

    initializeSound()
    const url =
      process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_PROD_API_URL
        : process.env.NEXT_PUBLIC_DEV_API_URL
    setBaseUrl(String(url))
  }, [])

  useEffect(() => {
    const handleEnter = () => {
      if (baseURL) {
        const retrievedIp = localStorage.getItem('ip')
        if (
          retrievedIp !== null &&
          retrievedIp !== undefined &&
          retrievedIp !== 'undefined' &&
          user
        ) {
          updateUserPresence(retrievedIp, user, true)
        } else {
          fetchIp()
        }
      }
    }

    const handleExit = () => {
      const retrievedIp = localStorage.getItem('ip')
      if (
        retrievedIp !== null &&
        retrievedIp !== undefined &&
        retrievedIp !== 'undefined' &&
        user
      ) {
        updateUserPresence(retrievedIp, user, false)
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
  }, [baseURL, user?._id, socket])

  const updateUserPresence = async (ip: string, u: User, online: boolean) => {
    try {
      const data = {
        ip,
        username: u.username,
        status: u.status,
        bioUserId: u.bioUserId,
        online,
        pathname,
        visitedAt: online ? new Date() : null,
        leftAt: !online ? new Date() : null,
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
