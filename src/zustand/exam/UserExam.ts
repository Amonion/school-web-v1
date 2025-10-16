import { create } from 'zustand'
import apiRequest from '@/lib/axios'

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: UserExam[]
}

export interface UserExam {
  _id: string
  username: string
  userId: string
  picture: string
  paperId: string
  name: string
  title: string
  type: string
  instruction: string
  questions: number
  duration: number
  rate: number
  accuracy: number
  metric: number
  started: number
  ended: number
  attempts: number
  attemptedQuestions: number
  totalAnswered: number
  totalCorrectAnswer: number
  isChecked?: boolean
  isActive?: boolean
}

export const UserExamEmpty = {
  _id: '',
  username: '',
  userId: '',
  picture: '',
  paperId: '',
  name: '',
  title: '',
  type: '',
  instruction: '',
  questions: 0,
  duration: 0,
  rate: 0,
  accuracy: 0,
  metric: 0,
  started: 0,
  ended: 0,
  attempts: 0,
  attemptedQuestions: 0,
  totalAnswered: 0,
  totalCorrectAnswer: 0,
}

interface UserExamState {
  count: number
  page_size: number
  userExamResults: UserExam[]
  loading: boolean
  isAllChecked: boolean
  userExamForm: UserExam
  setForm: (key: keyof UserExam, value: UserExam[keyof UserExam]) => void
  resetForm: () => void
  getExams: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  fetchQuestions: (url: string) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>
  updateItem: (
    url: string,
    updatedItem: FormData,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  postItem: (
    url: string,
    updatedItem: FormData,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
}

const UserExamStore = create<UserExamState>((set) => ({
  links: null,
  count: 0,
  page_size: 0,
  userExamResults: [],
  loading: false,
  isAllChecked: false,
  userExamForm: UserExamEmpty,
  setForm: (key, value) =>
    set((state) => ({
      userExamForm: {
        ...state.userExamForm,
        [key]: value,
      },
    })),
  resetForm: () =>
    set({
      userExamForm: UserExamEmpty,
    }),

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: UserExam) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        userExamResults: updatedResults,
      })
    }
  },

  getExams: async (url, setMessage) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
      })
      const data = response?.data
      if (data) {
        UserExamStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.error('Failed to fetch staff:', error)
      setMessage('An unexpected error occurred.', false)
    }
  },

  fetchQuestions: async (url) => {
    const response = await apiRequest<FetchResponse>(url)
    const data = response?.data
    if (data) {
      UserExamStore.getState().setProcessedResults(data)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      userExamResults: state.userExamResults.map((item: UserExam) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  deleteItem: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    setLoading?: (loading: boolean) => void
  ) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'DELETE',
      setMessage,
      setLoading,
    })
    const data = response?.data
    if (data) {
      UserExamStore.getState().setProcessedResults(data)
    }
  },

  updateItem: async (url, updatedItem, setMessage) => {
    set({ loading: true })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
    })
    if (response?.status !== 404 && response?.data) {
      set({ loading: false })
      UserExamStore.getState().setProcessedResults(response.data)
    } else {
      set({ loading: false })
    }
  },

  postItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loading: true })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'POST',
      body: updatedItem,
      setMessage,
    })

    const data = response?.data
    if (data) {
      UserExamStore.getState().setProcessedResults(data)
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.userExamResults[index]?.isActive
      const updatedResults = state.userExamResults.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        userExamResults: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.userExamResults.map((tertiary, idx) =>
        idx === index
          ? { ...tertiary, isChecked: !tertiary.isChecked }
          : tertiary
      )

      const isAllChecked = updatedResults.every(
        (tertiary) => tertiary.isChecked
      )
      const updatedSelectedItems = updatedResults.filter(
        (tertiary) => tertiary.isChecked
      )

      return {
        userExamResults: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.userExamResults.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.userExamResults.map((place) => ({
        ...place,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        userExamResults: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default UserExamStore
