import { create } from 'zustand'
import apiRequest from '@/lib/axios'
import _debounce from 'lodash/debounce'
import axios, { AxiosError } from 'axios'

export interface Exam {
  _id: string
  title: string
  instruction: string
  continents: string[]
  countries: string[]
  states: string[]
  academicLevels: string[]
  subtitle: string
  type: string
  name: string
  picture: string
  logo: string
  participants: number
  subjects: string
  randomize: boolean
  simultaneous: boolean
  showResult: boolean
  isEditable?: boolean
  eligibility: boolean
  publishedAt: Date | null | number
  createdAt: Date | null | number
  duration: number
  questions: number
  questionsPerPage: number
  optionsPerQuestion: number
  status: string
  isChecked?: boolean
  isActive?: boolean
}

export const ExamEmpty = {
  _id: '',
  title: '',
  instruction: '',
  continents: [],
  countries: [],
  states: [],
  academicLevels: [],
  subtitle: '',
  type: '',
  name: '',
  picture: '',
  logo: '',
  participants: 0,
  subjects: '',
  randomize: false,
  simultaneous: false,
  showResult: false,
  eligibility: false,
  publishedAt: null,
  createdAt: null,
  duration: 0,
  questions: 0,
  questionsPerPage: 0,
  optionsPerQuestion: 0,
  status: '',
}

interface FetchResponse {
  message: string
  count: number
  attempt: number
  page_size: number
  results: Exam[]
  data: Exam
  exam: Exam
}

interface ExamState {
  links: { next: string | null; previous: string | null } | null
  count: number
  attempt: number
  page_size: number
  exams: Exam[]
  searchedExams: Exam[]
  loading: boolean
  error: string | null
  successs?: string | null
  selectedItems: Exam[]
  searchResult: Exam[]
  searchedExamResults: Exam[]
  hasMoreSearch: boolean
  isAllChecked: boolean
  formData: Exam
  setForm: (key: keyof Exam, value: Exam[keyof Exam]) => void
  resetForm: () => void
  getItems: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedItems: Exam[],
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
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
  clearSearchedExams: () => void
  searchExams: (url: string) => void
  addMoreSearchItems: (url: string) => void
  getQueryExams: (url: string) => void
}

const ExamStore = create<ExamState>((set) => ({
  links: null,
  count: 0,
  attempt: 0,
  page_size: 20,
  exams: [],
  searchedExams: [],
  loading: false,
  hasMoreSearch: true,
  error: null,
  selectedItems: [],
  searchResult: [],
  searchedExamResults: [],
  isAllChecked: false,
  formData: ExamEmpty,
  setForm: (key, value) =>
    set((state) => ({
      formData: {
        ...state.formData,
        [key]: value,
      },
    })),
  resetForm: () =>
    set({
      formData: ExamEmpty,
    }),

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  clearSearchedExams: () => {
    set({
      searchedExamResults: [],
    })
  },

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Exam) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        exams: updatedResults,
      })
    }
  },

  getItems: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: ExamStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        ExamStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        setMessage(error.response.data.message, false)
      } else {
        console.error('Failed to fetch staff:', error)
        setMessage('An unexpected error occurred.', false)
      }
    }
  },

  getItem: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: ExamStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({
          formData: { ...ExamStore.getState().formData, ...data.exam },
          loading: false,
          attempt: data.attempt ? data.attempt : 0,
        })
      }
    } catch (error: unknown) {
      console.error(error)
      setMessage('Failed to fetch exam:', false)
    }
  },

  addMoreSearchItems: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: ExamStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set((prev) => {
          return {
            searchedExams: [...prev.searchedExams, ...data.results],
            loading: false,
            hasMoreSearch: data.results.length === prev.page_size,
          }
        })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getQueryExams: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: ExamStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set((prev) => {
          return {
            searchedExams: data.results,
            loading: false,
            hasMoreSearch: data.results.length === prev.page_size,
          }
        })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      exams: state.exams.map((item: Exam) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchExams: _debounce(async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url)
      if (response) {
        const { results } = response?.data
        const updatedResults = results.map((item: Exam) => ({
          ...item,
          isChecked: false,
          isActive: false,
        }))
        set({ searchedExamResults: updatedResults })
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        set({
          error: error.message || 'Failed to search items',
          loading: false,
        })
      } else {
        set({
          error: 'Failed to search items',
          loading: false,
        })
      }
    }
  }, 1000),

  massDelete: async (
    url: string,
    selectedItems: Exam[],
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({
      loading: true,
    })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: selectedItems,
      setMessage,
      setLoading: ExamStore.getState().setLoading,
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
      ExamStore.getState().setProcessedResults(data)
    }
  },

  updateItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loading: true, error: null })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
      setLoading: ExamStore.getState().setLoading,
    })
    if (response?.status !== 404 && response?.data) {
      set({ loading: false, error: null })
      ExamStore.getState().setProcessedResults(response.data)
    } else {
      set({ loading: false, error: null })
    }
  },

  postItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loading: true, error: null })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'POST',
      body: updatedItem,
      setMessage,
      setLoading: ExamStore.getState().setLoading,
    })
    if (response?.status !== 404 && response?.data) {
      set({ loading: false, error: null })
      ExamStore.getState().setProcessedResults(response.data)
    } else {
      set({ loading: false, error: null })
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.exams[index]?.isActive
      const updatedResults = state.exams.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        exams: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.exams.map((tertiary, idx) =>
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
        exams: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.exams.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.exams.map((place) => ({
        ...place,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        exams: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default ExamStore
