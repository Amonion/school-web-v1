import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import apiRequest from '@/lib/axios'

export interface Office {
  _id: string
  address: string
  officeId: string
  userType: string
  arm: string
  country: string
  bioUserId: string
  schoolLevel: number
  level: number
  schoolLevelName: string
  bioUserPicture: string
  state: string
  area: string
  name: string
  username: string
  bioUserDisplayName: string
  bioUserIntro: string
  bioUserUsername: string
  type: string
  logo: string
  media: string
  continent: string
  createdLocation: object
  isUserActive: boolean
  isApproved: boolean
  createdAt: Date
  isChecked?: boolean
  isActive?: boolean
}

export const OfficeEmpty = {
  _id: '',
  country: '',
  bioUserId: '',
  officeId: '',
  userType: '',
  arm: '',
  schoolLevel: 0,
  level: 0,
  schoolLevelName: '',
  bioUserPicture: '',
  state: '',
  area: '',
  name: '',
  address: '',
  username: '',
  bioUserDisplayName: '',
  bioUserIntro: '',
  bioUserUsername: '',
  type: '',
  logo: '',
  media: '',
  continent: '',
  createdLocation: { lat: 0, lng: 0 },
  isUserActive: false,
  isApproved: false,
  createdAt: new Date(),
}

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Office[]
  data: Office
}

interface OfficeState {
  links: { next: string | null; previous: string | null } | null
  count: number
  page_size: number
  currentPage: number
  unreadStaffs: number
  staffs: Office[]
  offices: Office[]
  loadingOffice: boolean
  error: string | null
  successs?: string | null
  selectedItems: Office[]
  searchedItems: Office[]
  isAllChecked: boolean
  officeForm: Office
  setOfficeForm: (key: keyof Office, value: Office[keyof Office]) => void
  resetOfficeForm: () => void
  getOffices: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getOfficeStaffs: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setOffice: (item: Office) => Promise<void>
  getOffice: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setStaffResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedItems: Office[],
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>
  updateStaff: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  postItem: (
    url: string,
    data: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
  searchItem: (url: string) => void
}

const OfficeStore = create<OfficeState>((set) => ({
  links: null,
  count: 0,
  currentPage: 1,
  page_size: 20,
  unreadStaffs: 0,
  staffs: [],
  offices: [],
  loadingOffice: false,
  error: null,
  selectedItems: [],
  searchedItems: [],
  isAllChecked: false,
  officeForm: OfficeEmpty,
  setOfficeForm: (key, value) =>
    set((state) => ({
      officeForm: {
        ...state.officeForm,
        [key]: value,
      },
    })),
  resetOfficeForm: () =>
    set({
      officeForm: OfficeEmpty,
    }),

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Office) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        count,
        page_size,
        offices: updatedResults,
      })
    }
  },

  setStaffResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Office) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        count,
        page_size,
        staffs: updatedResults,
      })
    }
  },

  setLoading: (loadState: boolean) => {
    set({ loadingOffice: loadState })
  },

  getOffices: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: OfficeStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        OfficeStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error, setMessage)
    }
  },

  getOfficeStaffs: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: OfficeStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        OfficeStore.getState().setStaffResults(data)
      }
    } catch (error: unknown) {
      console.log(error, setMessage)
    }
  },

  setOffice: async (item: Office) => {
    set({
      officeForm: { ...OfficeStore.getState().officeForm, ...item },
    })
  },

  getOffice: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: OfficeStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({
          officeForm: data.data,
          loadingOffice: false,
        })
      }
    } catch (error: unknown) {
      console.log(error, setMessage)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      offices: state.offices.map((item: Office) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchItem: _debounce(async (url: string) => {
    const response = await apiRequest<FetchResponse>(url, {
      setLoading: OfficeStore.getState().setLoading,
    })
    const results = response?.data.results
    if (results) {
      set({ searchedItems: results })
    }
  }, 1000),

  massDelete: async (
    url: string,
    selectedItems: Office[],
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'DELETE',
      body: selectedItems,
      setMessage,
    })
    if (response) {
    }
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
      OfficeStore.getState().setProcessedResults(data)
    }
  },

  updateStaff: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => {
    try {
      set({ loadingOffice: true, error: null })
      const response = await apiRequest<FetchResponse>(url, {
        method: 'PATCH',
        body: updatedItem,
        setMessage,
        setLoading: OfficeStore.getState().setLoading,
      })
      const data = response.data
      if (data) {
        console.log(data)
      }
      if (redirect) redirect()
    } catch (error) {
      console.log(error)
    }
  },

  postItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loadingOffice: true, error: null })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'POST',
      body: updatedItem,
      setMessage,
      setLoading: OfficeStore.getState().setLoading,
    })
    const result = response?.data
    if (result) {
      OfficeStore.getState().setProcessedResults(response?.data)
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.offices[index]?.isActive
      const updatedResults = state.offices.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        offices: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.offices.map((tertiary, idx) =>
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
        offices: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.offices.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.offices.map((office) => ({
        ...office,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        offices: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default OfficeStore
