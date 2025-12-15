import { create } from 'zustand'
import apiRequest from '@/lib/axios'
import { User } from '../user/User'
import { initDB } from '@/lib/indexDB'

export const getPostsFromDB = async (
  limit: number,
  page: number
): Promise<Post[]> => {
  const db = await initDB()
  const allPosts = await db.getAll('posts')
  const start = (page - 1) * limit
  const end = start + limit
  return allPosts.slice(start, end)
}

interface FetchPostResponse {
  count: number
  message: string
  page_size: number
  results: Post[]
}

interface PostResponse {
  message: string
  data: Post
}

export interface Media {
  source: string
  type: string
  preview: string
}

export interface Poll {
  picture: string
  text: string
  userId: string
  index: number
  percent: number
}

export interface IMedia {
  type: string
  src: string
  postId: string
  replies: number
  preview: string
  content: string
  backgroundColor: string
}

export interface Post {
  _id: string
  username: string
  userId: string
  postId: string
  backgroundColor: string
  displayName: string
  content: string
  media: Media[]
  polls: Poll[]
  users: string[]
  picture: string
  country: string
  isSelected: boolean
  isVerified: boolean
  hated: boolean
  totalVotes: number
  hates: number
  shares: number
  bookmarks: number
  replies: number
  views: number
  likes: number
  reposts: number
  createdAt: Date | null | string
  message: string
  followed: boolean
  muted: boolean
  liked: boolean
  bookmarked: boolean
  shared: boolean
  viewed: boolean
  isChecked?: boolean
  isActive?: boolean
}

export const PostEmpty = {
  _id: '',
  username: '',
  userId: '',
  postId: '',
  backgroundColor: '',
  displayName: '',
  content: '',
  media: [],
  polls: [],
  users: [],
  picture: '',
  country: '',
  isSelected: false,
  isVerified: false,
  hated: false,
  totalVotes: 0,
  hates: 0,
  shares: 0,
  bookmarks: 0,
  replies: 0,
  views: 0,
  likes: 0,
  reposts: 0,
  createdAt: '',
  message: '',
  followed: false,
  muted: false,
  liked: false,
  bookmarked: false,
  shared: false,
  viewed: false,
}

interface PostState {
  count: number
  page_size: number
  currentPage: number
  currentIndex: number
  postResults: Post[]
  mediaResults: IMedia[]
  selectedMedia: IMedia | null
  followingPostResults: Post[]
  bookmarkedPostResults: Post[]
  loading: boolean
  selectedPosts: Post[]
  hasMore: boolean
  isPlaying: boolean
  isMobile: boolean
  fitMode: boolean
  hasMoreBookmarks: boolean
  hasMoreFollowing: boolean
  postForm: Post
  setForm: (key: keyof Post, value: Post[keyof Post]) => void
  resetForm: () => void
  getPosts: (url: string) => Promise<void>
  getSavedPosts: (user: User) => Promise<void>
  addMorePosts: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getFollowingPosts: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getBookmarkedPosts: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getAPost: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setProcessedResults: (posts: Post[]) => void
  processMoreResults: (data: FetchPostResponse) => void
  setFollowingResults: (data: FetchPostResponse) => void
  setBookmarkedResults: (data: FetchPostResponse) => void
  removePosts: (id: string) => void
  setCurrentPage: (page: number) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    refreshUrl: string,
    selectedPosts: Post[],
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    id: string,
    setMessage: (message: string, isError: boolean) => void,
    refreshUrl?: string
  ) => Promise<void>
  selectPoll: (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => Promise<void>
  repostItem: (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => Promise<void>
  updatePinPost: (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => Promise<void>
  updatePost: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  postItem: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    setProgress?: (int: number) => void
  ) => Promise<void>
  togglePost: (index: number) => void
  toggleActive: (id: string) => void
  reshuffleResults: () => void
  setIsMobile: (mobile: boolean) => void
  setSelectedMedia: (media: IMedia | null) => void
  setFitMode: (mode: boolean) => void
  setCurrentIndex: (index: number) => void
}

export const PostStore = create<PostState>((set) => ({
  count: 0,
  page_size: 20,
  currentPage: 1,
  currentIndex: 0,
  postResults: [],
  mediaResults: [],
  followingPostResults: [],
  bookmarkedPostResults: [],
  selectedMedia: null,
  loading: false,
  selectedPosts: [],
  hasMore: false,
  isPlaying: true,
  isMobile: false,
  fitMode: false,
  hasMoreBookmarks: false,
  hasMoreFollowing: false,
  postForm: PostEmpty,
  setForm: (key, value) =>
    set((state) => ({
      postForm: {
        ...state.postForm,
        [key]: value,
      },
    })),
  resetForm: () =>
    set({
      postForm: PostEmpty,
    }),
  setIsMobile: (mobile: boolean) =>
    set({
      isMobile: mobile,
    }),
  setSelectedMedia: (media) =>
    set({
      selectedMedia: media,
    }),
  setFitMode: (mode: boolean) =>
    set({
      fitMode: mode,
    }),
  setCurrentIndex: (index: number) =>
    set({
      currentIndex: index,
    }),

  processMoreResults: ({ count, results }: FetchPostResponse) => {
    set((state) => {
      const updatedResults = results.map((item: Post) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      const existingIds = new Set(state.postResults.map((post) => post._id))
      const uniqueResults = updatedResults.filter(
        (post) => !existingIds.has(post._id)
      )

      const mediaResults: IMedia[] = []
      updatedResults.forEach((post) => {
        if (
          (Array.isArray(post.media) && post.media.length > 0) ||
          post.backgroundColor
        ) {
          if (post.backgroundColor) {
            mediaResults.push({
              postId: post._id,
              src: '',
              preview: '',
              type: 'poster',
              content: post.content,
              replies: post.replies,
              backgroundColor: post.backgroundColor,
            })
          } else {
            post.media.forEach((mediaItem) => {
              mediaResults.push({
                postId: post._id,
                src: mediaItem.source,
                preview: mediaItem.preview,
                type: post.backgroundColor ? 'poster' : mediaItem.type,
                content: post.content,
                replies: post.replies,
                backgroundColor: post.backgroundColor,
              })
            })
          }
        }
      })
      return {
        hasMore: state.page_size === results.length,
        loading: false,
        count,
        postResults: [...state.postResults, ...uniqueResults],
        mediaResults: [...state.mediaResults, ...mediaResults],
      }
    })
  },

  setProcessedResults: (results) => {
    set((state) => {
      const updatedResults = results.map((item: Post) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      const mediaResults: IMedia[] = []
      updatedResults.forEach((post) => {
        if (
          (Array.isArray(post.media) && post.media.length > 0) ||
          post.backgroundColor
        ) {
          if (post.backgroundColor) {
            mediaResults.push({
              postId: post._id,
              src: '',
              preview: '',
              type: 'poster',
              content: post.content,
              replies: post.replies,
              backgroundColor: post.backgroundColor,
            })
          } else {
            post.media.forEach((mediaItem) => {
              mediaResults.push({
                postId: post._id,
                src: mediaItem.source,
                preview: mediaItem.preview,
                type: post.backgroundColor ? 'poster' : mediaItem.type,
                content: post.content,
                replies: post.replies,
                backgroundColor: post.backgroundColor,
              })
            })
          }
        }
      })

      return {
        hasMore: state.page_size === results.length,
        loading: false,
        postResults: updatedResults,
        mediaResults: mediaResults,
      }
    })
  },

  setFollowingResults: ({ count, results }: FetchPostResponse) => {
    set((state) => {
      const updatedResults = results.map((item: Post) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      const existingIds = new Set(
        state.followingPostResults.map((post) => post._id)
      )
      const uniqueResults = updatedResults.filter(
        (post) => !existingIds.has(post._id)
      )

      return {
        loading: false,
        hasMoreFollowing: state.page_size === results.length,
        count,
        followingPostResults: [...state.followingPostResults, ...uniqueResults],
      }
    })
  },

  setBookmarkedResults: ({ count, page_size, results }: FetchPostResponse) => {
    set((state) => {
      const updatedResults = results.map((item: Post) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      const existingIds = new Set(
        state.bookmarkedPostResults.map((post) => post._id)
      )
      const uniqueResults = updatedResults.filter(
        (post) => !existingIds.has(post._id)
      )

      return {
        loading: false,
        hasMoreBookmarks: state.page_size === results.length,
        count,
        page_size,
        bookmarkedPostResults: [
          ...state.bookmarkedPostResults,
          ...uniqueResults,
        ],
      }
    })
  },

  removePosts: (id: string) => {
    set((state) => ({
      postResults: state.postResults.filter((post) => post.postId !== id),
    }))
  },

  setCurrentPage: (page: number) => {
    set({ currentPage: page })
  },

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  getAPost: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<PostResponse>(url, {
        setMessage,
        setLoading: PostStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({
          postForm: data.data,
          loading: false,
        })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getSavedPosts: async (user) => {
    try {
      const posts = await getPostsFromDB(20, 1)
      if (posts.length > 0) {
        PostStore.getState().setProcessedResults(posts)
      }
      PostStore.getState().getPosts(
        `/posts/?myId=${user?._id}&page_size=40&page=1`
      )
    } catch (error: unknown) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  getPosts: async (url: string) => {
    try {
      const response = await apiRequest<FetchPostResponse>(url, {
        setLoading: PostStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        PostStore.getState().setProcessedResults(data.results)
      }
    } catch (error: unknown) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  addMorePosts: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchPostResponse>(url, {
        setMessage,
        setLoading: PostStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        PostStore.getState().processMoreResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  getFollowingPosts: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchPostResponse>(url, {
        setMessage,
        setLoading: PostStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        PostStore.getState().setFollowingResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  getBookmarkedPosts: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchPostResponse>(url, {
        setMessage,
        setLoading: PostStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        PostStore.getState().setBookmarkedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      postResults: state.postResults.map((item: Post) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  massDelete: async (
    url: string,
    refreshUrl: string,
    selectedPosts: Post[],
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({
      loading: true,
    })
    const response = await apiRequest<Post>(url, {
      method: 'POST',
      body: selectedPosts,
      setMessage,
    })
    if (response) {
      console.log(response.data)
    }
  },

  deleteItem: async (
    url: string,
    id: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({
      loading: true,
    })
    const response = await apiRequest<Post>(url, {
      method: 'DELETE',
      setMessage,
    })
    if (response) {
      set((state) => {
        const updatedResults = state.postResults.filter(
          (post) => post._id !== id
        )
        return {
          postResults: updatedResults,
          loading: false,
        }
      })
    }
  },

  postItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    setProgress?: (int: number) => void
  ) => {
    set({ loading: true })
    const response = await apiRequest<Post>(url, {
      method: 'POST',
      body: updatedItem,
      setMessage,
      setProgress,
      setLoading: PostStore.getState().setLoading,
    })
    const data = response?.data
    if (data) {
      PostStore.getState().postResults.push(data)
    }
  },

  repostItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => {
    try {
      set({ loading: true })
      await apiRequest<PostResponse>(url, {
        method: 'POST',
        body: updatedItem,
      })
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  updatePinPost: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => {
    try {
      await apiRequest<PostResponse>(url, {
        method: 'POST',
        body: updatedItem,
      })
    } catch (error) {
      console.log(error)
    } finally {
    }
  },

  updatePost: async (url, updatedItem, setMessage) => {
    try {
      const response = await apiRequest<PostResponse>(url, {
        method: 'PATCH',
        body: updatedItem,
        setMessage,
      })
      const data = response?.data?.data
      if (data) {
        PostStore.setState((state) => ({
          postResults: state.postResults.map((post) =>
            post.userId === data.userId
              ? { ...post, followed: data.followed, isActive: false }
              : post
          ),
        }))
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  selectPoll: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => {
    set({ loading: true })
    await apiRequest<PostResponse>(url, {
      method: 'POST',
      body: updatedItem,
    })
  },

  toggleActive: (id: string) => {
    set((state) => {
      const updatedResults = state.postResults.map((tertiary) => ({
        ...tertiary,
        isActive: tertiary._id === id ? !tertiary.isActive : false,
      }))
      return {
        postResults: updatedResults,
      }
    })
  },

  togglePost: (index: number) => {
    set((state) => {
      const updatedResults = state.postResults.map((tertiary, idx) =>
        idx === index
          ? { ...tertiary, isChecked: !tertiary.isChecked }
          : tertiary
      )

      const updatedSelectedPosts = updatedResults.filter(
        (tertiary) => tertiary.isChecked
      )

      return {
        postResults: updatedResults,
        selectedPosts: updatedSelectedPosts,
      }
    })
  },
}))
