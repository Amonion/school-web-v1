import { create } from 'zustand'
import apiRequest from '@/lib/axios'
import _debounce from 'lodash/debounce'
import { AxiosError } from 'axios'

interface FetchStaffsResponse {
  message: string
  count: number
  page_size: number
  results: Staff[]
}

export interface Staff {
  _id: string
  bioUserId: string
  level: number
  email: string
  picture: string
  phone: string
  bioUserUsername: string
  firstName: string
  middleName: string
  lastName: string
  duties: string
  country: string
  countryFlag: string
  continent: string
  state: string
  area: string
  stateId: number
  salary: number
  position: string
  role: string
  isChecked?: boolean
  isActive?: boolean
}

export const StaffEmpty = {
  _id: '',
  bioUserId: '',
  level: 0,
  email: '',
  picture: '',
  phone: '',
  bioUserUsername: '',
  firstName: '',
  middleName: '',
  lastName: '',
  duties: '',
  country: '',
  countryFlag: '',
  continent: '',
  state: '',
  area: '',
  stateId: 0,
  salary: 0,
  position: '',
  role: '',
}

interface StaffsState {
  count: number
  page_size: number
  results: Staff[]
  loading: boolean
  selectedItems: Staff[]
  searchedStaffs: Staff[]
  isAllChecked: boolean
  isForm: boolean
  staffForm: Staff
  myStaffForm: Staff
  setForm: (key: keyof Staff, value: Staff[keyof Staff]) => void
  resetForm: () => void
  fillForm: (f: Staff) => void
  showForm: (s: boolean) => void
  getItems: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setProcessedResults: (data: FetchStaffsResponse) => void
  massDelete: (
    url: string,
    selectedItems: Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  updateStaff: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    refreshUrl?: () => void
  ) => Promise<void>
  postItem: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
  searchStaff: (url: string) => void
}

const StaffStore = create<StaffsState>((set) => ({
  count: 0,
  page_size: 0,
  results: [],
  loading: false,
  selectedItems: [],
  searchedStaffs: [],
  isAllChecked: false,
  isForm: false,
  staffForm: StaffEmpty,
  myStaffForm: StaffEmpty,
  setForm: (key, value) =>
    set((state) => ({
      staffForm: {
        ...state.staffForm,
        [key]: value,
      },
    })),
  resetForm: () =>
    set({
      staffForm: StaffEmpty,
    }),
  fillForm: (form) =>
    set({
      staffForm: form,
    }),

  setProcessedResults: ({ count, page_size, results }: FetchStaffsResponse) => {
    if (results) {
      const updatedResults = results.map((item: Staff) => ({
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

  showForm: (loadState: boolean) => {
    set({ isForm: loadState })
  },
  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  getItems: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchStaffsResponse>(url, {
        setMessage,
      })
      const data = response?.data
      if (data) {
        StaffStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      results: state.results.map((item: Staff) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchStaff: _debounce(async (url: string) => {
    try {
      const response = await apiRequest<FetchStaffsResponse>(url)
      if (response) {
        const { results } = response?.data
        const updatedResults = results.map((item: Staff) => ({
          ...item,
          isChecked: false,
          isActive: false,
        }))
        set({ searchedStaffs: updatedResults })
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        set({
          loading: false,
        })
      } else {
        set({
          loading: false,
        })
      }
    }
  }, 1000),

  massDelete: async (url, selectedItems, setMessage) => {
    set({
      loading: true,
    })
    try {
      const response = await apiRequest<FetchStaffsResponse>(url, {
        method: 'PATCH',
        body: selectedItems,
        setMessage,
      })
      const data = response.data
      if (data) {
        StaffStore.getState().setProcessedResults(data)
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  deleteItem: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      set({ loading: true })
      const response = await apiRequest<FetchStaffsResponse>(url, {
        method: 'DELETE',
        setMessage,
      })
      if (response) {
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  updateStaff: async (url, updatedItem, setMessage, redirect) => {
    try {
      const response = await apiRequest<FetchStaffsResponse>(url, {
        method: 'PATCH',
        body: updatedItem,
        setMessage,
      })
      if (response?.data) {
        StaffStore.getState().setProcessedResults(response.data)
      }
      if (redirect) redirect()
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  postItem: async (url, updatedItem, setMessage) => {
    try {
      const response = await apiRequest<FetchStaffsResponse>(url, {
        method: 'POST',
        body: updatedItem,
        setMessage,
      })
      if (response?.data) {
        StaffStore.getState().setProcessedResults(response.data)
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
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
      const updatedSelectedItems = updatedResults.filter(
        (tertiary) => tertiary.isChecked
      )

      return {
        results: updatedResults,
        selectedItems: updatedSelectedItems,
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

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        results: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default StaffStore
