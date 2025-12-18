'use client'
import { createContext, useEffect, useContext, ReactNode } from 'react'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { PostStore } from '@/src/zustand/post/Post'

const PostContext = createContext<null>(null)

interface PostProviderProps {
  children: ReactNode
}

export const PostProvider = ({ children }: PostProviderProps) => {
  const { postResults, getSavedPosts } = PostStore()
  const { user } = AuthStore()

  useEffect(() => {
    if (user && postResults.length === 0) {
      getSavedPosts(user)
    }
  }, [user?._id])

  return <PostContext.Provider value={null}>{children}</PostContext.Provider>
}

export const usePostContext = () => useContext(PostContext)
