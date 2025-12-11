import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import apiRequest from '@/lib/axios'
import {
  BioUserSchoolInfo,
  BioUserSchoolInfoEmpty,
} from '../user/BioUserSchoolInfo'
import { addRecordsToDB, getRecordsFromDB } from '@/lib/indexDB'
import { isEqual } from 'lodash'

interface FetchResponse {
  count: number
  message: string
  page_size: number
  results: BioUserSchoolInfo[]
  bioUserSchoolInfo: BioUserSchoolInfo
}

interface PeopleState {
  count: number
  page_size: number
  searchPageSize: number
  currentPage: number
  people: BioUserSchoolInfo[]
  loading: boolean
  hasMoreSearch: boolean
  searchedPeople: BioUserSchoolInfo[]
  peopleForm: BioUserSchoolInfo
  clearSearchedItem: () => void
  setSearchedPeople: () => void
  getSavedPeople: () => Promise<void>
  getPeople: (url: string) => Promise<void>
  setCurrentPage: (index: number) => void
  searchPerson: (url: string) => void
}

export const PeopleStore = create<PeopleState>((set, get) => ({
  count: 0,
  page_size: 20,
  searchPageSize: 20,
  currentPage: 1,
  people: [],
  loading: false,
  hasMoreSearch: true,
  selectedBioUsers: [],
  searchedPeople: [],
  searchedBioUserResult: [],
  isAllChecked: false,
  peopleForm: BioUserSchoolInfoEmpty,

  setCurrentPage: (page: number) => {
    set({ currentPage: page })
  },

  setSearchedPeople: () => {
    set((prev) => {
      return {
        searchedPeople: prev.searchedPeople,
        searchedBioUserResult: [],
      }
    })
  },

  clearSearchedItem: () => {
    set({ searchedPeople: [] })
  },

  getSavedPeople: async () => {
    try {
      const people = await getRecordsFromDB<BioUserSchoolInfo>('people', 20, 1)
      if (people.length > 0) {
        set({ people })
      }
      get().getPeople(`/biousers-school/?page_size=40&page=1&isVerified=true`)
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getPeople: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url)
      const data = response?.data
      if (data) {
        const fetchedPeople = data.results
        const savedPeople = PeopleStore.getState().people
        const first20Fetched = fetchedPeople.slice(0, 20)
        const missingPeople = first20Fetched.filter(
          (apiUser: BioUserSchoolInfo) =>
            !savedPeople.some((local) => local._id === apiUser._id)
        )

        let updatedSavedPeople = savedPeople

        if (missingPeople.length > 0) {
          updatedSavedPeople = [...savedPeople, ...missingPeople]
          set({ people: updatedSavedPeople })
        }

        if (savedPeople.length > 0) {
          const toUpsert = fetchedPeople.filter(
            (apiItem: BioUserSchoolInfo) => {
              const existing = savedPeople.find(
                (localItem) => localItem._id === apiItem._id
              )
              return !existing || !isEqual(existing, apiItem)
            }
          )

          if (toUpsert.length > 0) {
            await addRecordsToDB<BioUserSchoolInfo>('people', toUpsert)
          } else {
            console.log('No new people to upsert.')
          }
        } else {
          await addRecordsToDB<BioUserSchoolInfo>('people', fetchedPeople)
          set({ people: fetchedPeople })
        }
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  searchPerson: _debounce(async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url)
      const { results } = response?.data
      if (results) {
        set({ searchedPeople: results })
      }
    } catch (error: unknown) {
      console.log(error)
    } finally {
      set({
        loading: false,
      })
    }
  }, 1000),
}))
