import { create } from 'zustand'
import apiRequest from '@/lib/axios'
import _debounce from 'lodash/debounce'
import { AxiosError } from 'axios'
import { addRecordsToDB, clearTable, initDB } from '@/lib/indexDB'

export const getQuestionsFromDB = async <T>(
  table: string,
  limit: number,
  page: number
): Promise<T[]> => {
  const db = await initDB()

  const allItems = await db.getAll(table)

  const sorted = allItems.sort(
    (a: Objective, b: Objective) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const start = (page - 1) * limit
  const end = start + limit

  return sorted.slice(start, end) as T[]
}
export const getAllQuestionsFromDB = async <T>(): Promise<T[]> => {
  const db = await initDB()
  const allItems = await db.getAll('questions')
  return allItems as T[]
}

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Objective[]
}

export interface IOption {
  index: number
  value: string
  isSelected: boolean
  isClicked: boolean
}

export interface Objective {
  _id: string
  index: number
  isClicked: boolean
  isSelected: boolean
  paperId: string
  question: string
  createdAt: string
  options: IOption[]
  isChecked?: boolean
  isActive?: boolean
}
export const ObjectiveEmpty = {
  _id: '',
  index: 0,
  isClicked: false,
  isSelected: false,
  paperId: '',
  question: '',
  createdAt: '',
  options: [],
}

interface ObjectiveState {
  links: { next: string | null; previous: string | null } | null
  count: number
  page_size: number
  answeredQuestions: number
  currentPage: number
  objectiveResults: Objective[]
  loading: boolean
  selectedItems: Objective[]
  questions: Objective[]
  lastQuestions: Objective[]
  searchResult: Objective[]
  searchedResults: Objective[]
  isAllChecked: boolean
  objectiveForm: Objective
  setForm: (key: keyof Objective, value: Objective[keyof Objective]) => void
  resetForm: () => void
  getObjectives: (url: string) => Promise<void>
  getQuestions: (page_size: number, limit: number) => Promise<void>
  getLastQuestions: (page_size: number, limit: number) => Promise<void>
  fetchQuestions: (url: string) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  setCurrentPage?: (page: number) => void
  massDelete: (
    url: string,
    refreshUrl: string,
    selectedItems: Objective[],
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
  searchItem: (url: string) => void
  selectAnswer: (item: IOption, id: string) => Promise<void>
}

const ObjectiveStore = create<ObjectiveState>((set) => ({
  links: null,
  count: 0,
  answeredQuestions: 0,
  page_size: 10,
  currentPage: 1,
  objectiveResults: [],
  questions: [],
  lastQuestions: [],
  loading: false,
  selectedItems: [],
  searchResult: [],
  searchedResults: [],
  isAllChecked: false,
  objectiveForm: ObjectiveEmpty,
  setForm: (key, value) =>
    set((state) => ({
      objectiveForm: {
        ...state.objectiveForm,
        [key]: value,
      },
    })),
  resetForm: () =>
    set({
      objectiveForm: ObjectiveEmpty,
    }),

  setCurrentPage: (page: number) => {
    set({ currentPage: page })
  },

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  selectAnswer: async (item, id) => {
    set((prev) => {
      const updatedQuestions = prev.questions.map((question) =>
        question._id === id
          ? {
              ...question,
              isClicked: true,
              options: question.options.map((option) => ({
                ...option,
                isClicked: option.index === item.index,
              })),
            }
          : question
      )
      addRecordsToDB('questions', updatedQuestions)
      return {
        questions: updatedQuestions,
      }
    })

    const totalQuestions = await getAllQuestionsFromDB<Objective>()
    const answeredQuestions = totalQuestions.filter((item) => item.isClicked)
    set({ answeredQuestions: answeredQuestions.length })
  },

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Objective) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        objectiveResults: updatedResults,
      })
    }
  },

  getObjectives: async (url) => {
    try {
      const response = await apiRequest<FetchResponse>(url)
      const data = response?.data
      if (data) {
        clearTable('questions')
        addRecordsToDB('questions', data.results)
      }
    } catch (error: unknown) {
      console.error('Failed to fetch staff:', error)
    }
  },

  getQuestions: async (page_size, limit) => {
    try {
      const response = await getQuestionsFromDB<Objective>(
        'questions',
        page_size,
        limit
      )
      if (response) {
        ObjectiveStore.setState({ questions: response })
      }
    } catch (error: unknown) {
      console.error('Failed to fetch staff:', error)
    }
  },

  getLastQuestions: async (page_size, limit) => {
    try {
      const response = await getQuestionsFromDB<Objective>(
        'last_questions',
        page_size,
        limit
      )
      if (response) {
        ObjectiveStore.setState({ lastQuestions: response })
      }
    } catch (error: unknown) {
      console.error('Failed to fetch staff:', error)
    }
  },

  fetchQuestions: async (url: string) => {
    const response = await apiRequest<FetchResponse>(url, {
      setLoading: ObjectiveStore.getState().setLoading,
    })
    const data = response?.data
    if (data) {
      ObjectiveStore.getState().setProcessedResults(data)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      objectiveResults: state.objectiveResults.map((item: Objective) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchItem: _debounce(async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url)
      if (response) {
        const { results } = response?.data
        const updatedResults = results.map((item: Objective) => ({
          ...item,
          isChecked: false,
          isActive: false,
        }))
        set({ searchedResults: updatedResults })
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
    url: string,
    refreshUrl: string,
    updatedItem: Objective[],
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({
      loading: true,
    })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
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
      ObjectiveStore.getState().setProcessedResults(data)
    }
  },

  updateItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loading: true })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
      setLoading: ObjectiveStore.getState().setLoading,
    })
    if (response?.status !== 404 && response?.data) {
      set({ loading: false })
      ObjectiveStore.getState().setProcessedResults(response.data)
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
      setLoading: ObjectiveStore.getState().setLoading,
    })

    const data = response?.data
    if (data) {
      ObjectiveStore.getState().setProcessedResults(data)
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.objectiveResults[index]?.isActive
      const updatedResults = state.objectiveResults.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        objectiveResults: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.objectiveResults.map((tertiary, idx) =>
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
        objectiveResults: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.objectiveResults.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.objectiveResults.map((place) => ({
        ...place,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        objectiveResults: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default ObjectiveStore
