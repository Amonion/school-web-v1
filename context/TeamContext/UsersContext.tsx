'use client'
import useSocket from '@/src/useSocket'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { BioUserStateStore } from '@/src/zustand/user/BioUserState'
import { createContext, useEffect, useContext, ReactNode, useMemo } from 'react'

const UsersContext = createContext<{
  socket: ReturnType<typeof useSocket> | null
}>({
  socket: null,
})

interface UsersData {
  verifyingUsers: number
}

interface UsersProviderProps {
  children: ReactNode
}

export const UsersProvider = ({ children }: UsersProviderProps) => {
  const socket = useSocket()
  const { user } = AuthStore()

  useEffect(() => {
    const handleEnter = () => {
      if (user) {
        updateUserPresence()
      }
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        handleEnter()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [user?._id])

  useEffect(() => {
    if (socket && user) {
      socket.on(`verifying_users${user.username}`, (data: UsersData) => {
        BioUserStateStore.setState({ verifyingUsers: data.verifyingUsers })
      })
    }
  }, [user?._id, socket])

  const updateUserPresence = async () => {
    try {
      const formData = {
        user: user,
        to: 'verifying_users',
        action: 'verifying_users',
      }

      socket?.emit('message', formData)
    } catch (error) {
      console.error('Error fetching user location:', error)
    }
  }

  const value = useMemo(() => ({ socket }), [socket])

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
}

export const useUsersContext = () => useContext(UsersContext)
