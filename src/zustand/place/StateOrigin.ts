import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import apiRequest from '@/lib/axios'
import { Place } from './Place'

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: State[]
  state: Place
  stateCapital: string
  stateLogo: string
}

export interface State {
  id: string
  continent: string
  country: string
  countryCode: string
  countryFlag: string | null | File
  countrySymbol: string
  currency: string
  currencySymbol: string
  state: string
  stateCapital: string
  stateLogo: string
  isChecked?: boolean
  isActive?: boolean
}
export const StateEmpty = {
  id: '',
  continent: '',
  country: '',
  countryCode: '',
  countryFlag: '',
  countrySymbol: '',
  currency: '',
  currencySymbol: '',
  state: '',
  stateCapital: '',
  stateLogo: '',
}

interface StateState {
  count: number
  page_size: number
  states: State[]
  loadingStates: boolean
  selectedStates: State[]
  searchedStates: State[]
  isAllStatesChecked: boolean
  allStates: boolean
  isStateForm: boolean
  stateForm: State
  setItemForm: (key: keyof State, value: State[keyof State]) => void
  resetForm: (form: State) => void
  showStateForm: (state: boolean) => void
  setAllStates: () => void
  getStates: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getAState: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    isNew?: boolean
  ) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  massDeleteStates: (
    url: string,
    selectedStates: State[],
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>
  updateItem: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  postItem: (
    url: string,
    data: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  toggleCheckedState: (index: number) => void
  toggleActiveState: (index: number) => void
  toggleAllSelectedState: () => void
  reshuffleStates: () => void
  searchState: (url: string) => void
}

const StateStore = create<StateState>((set) => ({
  count: 0,
  page_size: 20,
  states: [],
  loadingStates: false,
  selectedStates: [],
  searchedStates: [],
  isAllStatesChecked: false,
  allStates: false,
  isStateForm: false,
  stateForm: StateEmpty,
  setItemForm: (key, value) =>
    set((state) => ({
      stateForm: {
        ...state.stateForm,
        [key]: value,
      },
    })),
  resetForm: (form) => set({ stateForm: form }),
  showStateForm: (state) => set({ isStateForm: state }),

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: State) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        count,
        page_size,
        states: updatedResults,
      })
    }
  },

  setLoading: (loadState: boolean) => {
    set({ loadingStates: loadState })
  },

  setAllStates: () => {
    set((state) => {
      const isCurrentlyActive = state.allStates
      const updatedResults = state.states.map((tertiary) => ({
        ...tertiary,
        isChecked: isCurrentlyActive ? tertiary.isChecked : false,
      }))
      return {
        allStates: !state.allStates,
        states: updatedResults,
        selectedStates: !state.allStates ? [] : state.selectedStates,
      }
    })
  },

  getStates: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: StateStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        StateStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error, setMessage)
    }
  },

  getAState: async (url, setMessage) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: StateStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({
          stateForm: data.state,
          loadingStates: false,
        })
      }
    } catch (error: unknown) {
      console.log(error, setMessage)
    }
  },

  reshuffleStates: async () => {
    set((state) => ({
      states: state.states.map((item: State) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
      selectedStates: [],
    }))
  },

  searchState: _debounce(async (url: string) => {
    const response = await apiRequest<FetchResponse>(url, {
      setLoading: StateStore.getState().setLoading,
    })
    const results = response?.data.results
    if (results) {
      set({ searchedStates: results })
    }
  }, 1000),

  massDeleteStates: async (
    url: string,
    selectedStates: State[],
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'POST',
      setMessage,
      body: selectedStates,
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
      StateStore.getState().setProcessedResults(data)
    }
  },

  updateItem: async (url, updatedItem, setMessage, redirect) => {
    set({ loadingStates: true })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
      setLoading: StateStore.getState().setLoading,
    })
    const data = response?.data
    if (data) {
      StateStore.setState((prev) => {
        return {
          states: prev.states.map((item) =>
            item.id === data.state._id
              ? {
                  ...item,
                  state: data.state.state,
                  stateCapital: data.state.stateCapital,
                }
              : item
          ),
        }
      })
    }
    if (redirect) redirect()
  },

  postItem: async (url, updatedItem, setMessage, redirect) => {
    set({ loadingStates: true })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'POST',
      body: updatedItem,
      setMessage,
      setLoading: StateStore.getState().setLoading,
    })
    const data = response?.data
    if (data) {
      StateStore.setState((prev) => {
        return {
          states: prev.states.map((item) =>
            item.id === data.state._id
              ? {
                  ...item,
                  state: data.state.state,
                  stateCapital: data.state.stateCapital,
                }
              : item
          ),
        }
      })
    }
    if (redirect) redirect()
  },

  toggleActiveState: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.states[index]?.isActive
      const updatedResults = state.states.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        states: updatedResults,
      }
    })
  },

  toggleCheckedState: (index: number) => {
    set((state) => {
      const updatedResults = state.states.map((tertiary, idx) =>
        idx === index
          ? { ...tertiary, isChecked: !tertiary.isChecked }
          : tertiary
      )

      const isAllStatesChecked = updatedResults.every(
        (tertiary) => tertiary.isChecked
      )
      const updatedSelectedItems = updatedResults.filter(
        (tertiary) => tertiary.isChecked
      )

      return {
        states: updatedResults,
        selectedStates: updatedSelectedItems,
        isAllStatesChecked: isAllStatesChecked,
        allStates: isAllStatesChecked,
      }
    })
  },

  toggleAllSelectedState: () => {
    set((state) => {
      const isAllStatesChecked =
        state.states.length === 0 ? false : !state.isAllStatesChecked
      const updatedResults = state.states.map((place) => ({
        ...place,
        isChecked: isAllStatesChecked,
      }))

      const updatedSelectedItems = isAllStatesChecked ? updatedResults : []

      return {
        states: updatedResults,
        selectedStates: updatedSelectedItems,
        isAllStatesChecked,
      }
    })
  },
}))

export default StateStore
