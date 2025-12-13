import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import { AxiosError } from 'axios'
import apiRequest from '@/lib/axios'

interface FetchPositionResponse {
  message: string
  count: number
  page_size: number
  results: Position[]
}

export interface Position {
  _id: string
  level: number
  position: string
  duties: string
  region: string
  salary: number
  role: string
  isChecked?: boolean
  isActive?: boolean
}
export const PositionEmpty = {
  _id: '',
  level: 0,
  position: '',
  duties: '',
  region: '',
  salary: 0,
  role: '',
}

interface PositionsState {
  count: number
  page_size: number
  positionResults: Position[]
  loading: boolean
  selectedItems: Position[]
  searchedPositions: Position[]
  isAllChecked: boolean
  isPositionForm: boolean
  positionFormData: Position
  setPositionForm: (
    key: keyof Position,
    value: Position[keyof Position]
  ) => void
  showPositionForm: (state: boolean) => void
  resetForm: () => void
  getPositions: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setProcessedResults: (data: FetchPositionResponse) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedItems: Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    setAction: (isLoading: boolean, isSuccess: boolean) => void
  ) => Promise<void>
  updatePosition: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  createPosition: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
  searchPosition: (url: string) => void
}

const PositionStore = create<PositionsState>((set) => ({
  count: 0,
  page_size: 0,
  positionResults: [],
  loading: false,
  error: null,
  selectedItems: [],
  searchedPositions: [],
  isPositionForm: false,
  isAllChecked: false,
  positionFormData: PositionEmpty,
  setPositionForm: (key, value) =>
    set((state) => ({
      positionFormData: {
        ...state.positionFormData,
        [key]: value,
      },
    })),
  resetForm: () =>
    set({
      positionFormData: PositionEmpty,
    }),

  showPositionForm: (loadState: boolean) => {
    set({ isPositionForm: loadState })
  },
  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  setProcessedResults: ({
    count,
    page_size,
    results,
  }: FetchPositionResponse) => {
    if (results) {
      const updatedResults = results.map((item: Position) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        positionResults: updatedResults,
      })
    }
  },

  getPositions: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchPositionResponse>(url, {
        setMessage,
        setLoading: PositionStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        PositionStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      positionResults: state.positionResults.map((item: Position) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchPosition: _debounce(async (url: string) => {
    try {
      const response = await apiRequest<FetchPositionResponse>(url)
      if (response) {
        const { results } = response?.data
        const updatedResults = results.map((item: Position) => ({
          ...item,
          isChecked: false,
          isActive: false,
        }))
        set({ searchedPositions: updatedResults })
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

  massDelete: async (
    url,
    selectedItems,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const response = await apiRequest<FetchPositionResponse>(url, {
      method: 'PATCH',
      body: selectedItems,
      setMessage,
      setLoading: PositionStore.getState().setLoading,
    })
    const data = response.data
    if (data) {
      PositionStore.getState().setProcessedResults(data)
    }
  },

  deleteItem: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const response = await apiRequest<FetchPositionResponse>(url, {
      method: 'DELETE',
      setMessage,
      setLoading: PositionStore.getState().setLoading,
    })
    if (response) {
    }
  },

  updatePosition: async (url, updatedItem, setMessage, redirect) => {
    try {
      const response = await apiRequest<FetchPositionResponse>(url, {
        method: 'PATCH',
        body: updatedItem,
        setMessage,
        setLoading: PositionStore.getState().setLoading,
      })
      if (response?.data) {
        PositionStore.getState().setProcessedResults(response.data)
      }
      if (redirect) redirect()
    } catch (error) {
      console.log(error)
    }
  },

  createPosition: async (url, updatedItem, setMessage, redirect) => {
    try {
      const response = await apiRequest<FetchPositionResponse>(url, {
        method: 'POST',
        body: updatedItem,
        setMessage,
        setLoading: PositionStore.getState().setLoading,
      })
      if (response?.data) {
        PositionStore.getState().setProcessedResults(response.data)
      }
      if (redirect) redirect()
    } catch (error) {
      console.log(error)
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.positionResults[index]?.isActive
      const updatedResults = state.positionResults.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        positionResults: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.positionResults.map((tertiary, idx) =>
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
        positionResults: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked: isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.positionResults.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.positionResults.map((place) => ({
        ...place,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        positionResults: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default PositionStore
