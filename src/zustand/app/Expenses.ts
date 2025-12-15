import { create } from 'zustand'
import apiRequest from '@/lib/axios'
import _debounce from 'lodash/debounce'

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Expenses[]
}

export interface Expenses {
  _id: string
  name: string
  amount: number
  receipt: File | string
  description: string
  createdAt: Date | null
  isChecked?: boolean
  isActive?: boolean
}
export const ExpensesForm = {
  _id: '',
  name: '',
  amount: 0,
  receipt: '',
  description: '',
  createdAt: null,
}

interface ExpensesState {
  count: number
  page_size: number
  results: Expenses[]
  uploads: Expenses[]
  loading: boolean
  selectedExpenses: Expenses[]
  searchedExpenses: Expenses[]
  isAllChecked: boolean
  isExpenseForm: boolean
  expensesForm: Expenses
  setForm: (key: keyof Expenses, value: Expenses[keyof Expenses]) => void
  resetForm: (form: Expenses) => void
  getExpenses: (url: string) => Promise<void>
  getUploads: (url: string) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setProcessedUploads: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedExpenses: Expenses[],
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
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
  searchExpenses: (url: string) => void
  showForm: (state: boolean) => void
}

const ExpensesStore = create<ExpensesState>((set) => ({
  count: 0,
  page_size: 0,
  results: [],
  uploads: [],
  loading: false,
  selectedExpenses: [],
  searchedExpenses: [],
  isAllChecked: false,
  isExpenseForm: false,
  expensesForm: ExpensesForm,
  setForm: (key, value) =>
    set((state) => ({
      expensesForm: {
        ...state.expensesForm,
        [key]: value,
      },
    })),
  resetForm: (form) =>
    set({
      expensesForm: form,
    }),

  setLoading: (loadState) => {
    set({ loading: loadState })
  },

  showForm: (loadState) => {
    set({ isExpenseForm: loadState })
  },

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Expenses) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        results: updatedResults,
      })
    }
  },

  setProcessedUploads: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Expenses) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        uploads: updatedResults,
      })
    }
  },

  getExpenses: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: ExpensesStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        ExpensesStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getUploads: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: ExpensesStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        ExpensesStore.getState().setProcessedUploads(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      results: state.results.map((item: Expenses) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchExpenses: _debounce(async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url)
      if (response) {
        const { results } = response?.data
        const updatedResults = results.map((item: Expenses) => ({
          ...item,
          isChecked: false,
          isActive: false,
        }))
        set({ searchedExpenses: updatedResults })
      }
    } catch (error: unknown) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  }, 1000),

  massDelete: async (url, selectedExpenses, setMessage) => {
    set({
      loading: true,
    })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: selectedExpenses,
      setMessage,
      setLoading: ExpensesStore.getState().setLoading,
    })
    const data = response.data
    if (data) {
    }
  },

  deleteItem: async (url, setMessage) => {
    set({
      loading: true,
    })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'DELETE',
      setMessage,
      setLoading: ExpensesStore.getState().setLoading,
    })
    if (response) {
      console.log(response)
    }
  },

  updateItem: async (url, updatedItem, setMessage, redirect) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        method: 'PATCH',
        body: updatedItem,
        setMessage,
        setLoading: ExpensesStore.getState().setLoading,
      })
      if (response?.data) {
        ExpensesStore.getState().setProcessedResults(response.data)
      }
      if (redirect) redirect()
    } catch (error) {
      console.log(error)
    }
  },

  postItem: async (url, updatedItem, setMessage, redirect) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        method: 'POST',
        body: updatedItem,
        setMessage,
        setLoading: ExpensesStore.getState().setLoading,
      })
      if (response?.data) {
        ExpensesStore.getState().setProcessedResults(response.data)
      }
      if (redirect) redirect()
    } catch (error) {
      console.log(error)
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.results[index]?.isActive
      const updatedResults = state.results.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        results: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.results.map((tertiary, idx) =>
        idx === index
          ? { ...tertiary, isChecked: !tertiary.isChecked }
          : tertiary
      )

      const isAllChecked = updatedResults.every(
        (tertiary) => tertiary.isChecked
      )
      const updatedSelectedExpenses = updatedResults.filter(
        (tertiary) => tertiary.isChecked
      )

      return {
        results: updatedResults,
        selectedExpenses: updatedSelectedExpenses,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.results.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.results.map((place) => ({
        ...place,
        isChecked: isAllChecked,
      }))

      const updatedSelectedExpenses = isAllChecked ? updatedResults : []

      return {
        results: updatedResults,
        selectedExpenses: updatedSelectedExpenses,
        isAllChecked,
      }
    })
  },
}))

export default ExpensesStore
