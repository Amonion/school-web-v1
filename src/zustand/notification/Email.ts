import { create } from 'zustand'
import apiRequest from '@/lib/axios'
import _debounce from 'lodash/debounce'

export interface Email {
  _id: string
  picture: string | File | null
  title: string
  name: string
  content: string
  note: string
  greetings: string
  isChecked?: boolean
  isActive?: boolean
}

export const EmailEmpty = {
  _id: '',
  picture: '',
  title: '',
  name: '',
  content: '',
  note: '',
  greetings: '',
}

interface FetchEmailResponse {
  message: string
  count: number
  page_size: number
  results: Email[]
  data: Email
}

interface EmailsState {
  count: number
  page_size: number
  emails: Email[]
  loading: boolean
  selectedItems: Email[]
  searchedEmails: Email[]
  isAllChecked: boolean
  showEmailForm: boolean
  emailForm: Email
  setForm: (key: keyof Email, value: Email[keyof Email]) => void
  resetForm: () => void
  setShowEmailForm: (state: boolean) => void
  getEmails: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getEmail: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setProcessedResults: (data: FetchEmailResponse) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedItems: Email[],
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    refreshUrl: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  updateItem: (
    url: string,
    updatedItem: FormData,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  postItem: (
    url: string,
    updatedItem: FormData,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
  searchEmail: (url: string) => void
}

const EmailStore = create<EmailsState>((set) => ({
  count: 0,
  page_size: 0,
  emails: [],
  loading: false,
  showEmailForm: false,
  selectedItems: [],
  searchedEmails: [],
  isAllChecked: false,
  emailForm: EmailEmpty,
  setForm: (key, value) =>
    set((state) => ({
      emailForm: {
        ...state.emailForm,
        [key]: value,
      },
    })),

  resetForm: () =>
    set({
      emailForm: EmailEmpty,
    }),

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  setShowEmailForm: (loadState: boolean) => {
    set({ showEmailForm: loadState })
  },

  setProcessedResults: ({ count, page_size, results }: FetchEmailResponse) => {
    if (results) {
      const updatedResults = results.map((item: Email) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        emails: updatedResults,
      })
    }
  },

  getEmail: async (url: string) => {
    try {
      const response = await apiRequest<FetchEmailResponse>(url, {
        setLoading: EmailStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({ emailForm: data.data })
      }
    } catch (error: unknown) {
      console.error('Failed to fetch staff:', error)
    }
  },
  getEmails: async (url: string) => {
    try {
      const response = await apiRequest<FetchEmailResponse>(url, {
        setLoading: EmailStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        EmailStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.error('Failed to fetch staff:', error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      emails: state.emails.map((item: Email) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchEmail: _debounce(async (url: string) => {
    try {
      set({
        loading: true,
      })
      const response = await apiRequest<FetchEmailResponse>(url)
      if (response) {
        const { results } = response?.data
        const updatedResults = results.map((item: Email) => ({
          ...item,
          isChecked: false,
          isActive: false,
        }))
        set({ searchedEmails: updatedResults })
      }
    } catch (error: unknown) {
      console.log(error)
    } finally {
      set({
        loading: false,
      })
    }
  }, 1000),

  massDelete: async (
    url: string,
    selectedItems: Email[],
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({
      loading: true,
    })
    await apiRequest<FetchEmailResponse>(url, {
      method: 'PATCH',
      body: selectedItems,
      setMessage,
    })
  },

  deleteItem: async (
    url: string,
    refreshUrl: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({
      loading: true,
    })
    await apiRequest<FetchEmailResponse>(url, {
      method: 'DELETE',
      setMessage,
      setLoading: EmailStore.getState().setLoading,
    })
  },

  updateItem: async (url, updatedItem, setMessage, redirect) => {
    set({ loading: true })
    const response = await apiRequest<FetchEmailResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
      setLoading: EmailStore.getState().setLoading,
    })
    if (response?.data) {
      set({ loading: false })
      EmailStore.getState().setProcessedResults(response.data)
      if (redirect) redirect()
    } else {
      set({ loading: false })
    }
  },

  postItem: async (url, updatedItem, setMessage, redirect) => {
    set({ loading: true })
    const response = await apiRequest<FetchEmailResponse>(url, {
      method: 'POST',
      body: updatedItem,
      setMessage,
      setLoading: EmailStore.getState().setLoading,
    })
    if (response?.data) {
      set({ loading: false })
      EmailStore.getState().setProcessedResults(response.data)
      if (redirect) redirect()
    } else {
      set({ loading: false })
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.emails[index]?.isActive
      const updatedResults = state.emails.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        emails: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.emails.map((tertiary, idx) =>
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
        emails: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.emails.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.emails.map((place) => ({
        ...place,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        emails: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default EmailStore
