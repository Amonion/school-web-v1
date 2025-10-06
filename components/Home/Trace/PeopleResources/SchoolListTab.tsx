'use client'
import { MessageStore, NavStore } from '@/src/zustand/msgStore'
import { useEffect, useState } from 'react'
import CountryStore from '@/src/zustand/team/Country'

import { motion } from 'framer-motion'
import { addQuery } from '@/lib/helpers'
import SchoolStore from '@/src/zustand/team/School'
import StateStore from '@/src/zustand/team/State'
import AcademicStore from '@/src/zustand/team/Academic'

export default function SchoolListTab() {
  const { countries, getCountries, selectedCountries, reshuffleResults } =
    CountryStore()
  const { selectedStates, reshuffleStates } = StateStore()
  const { selectedItems } = AcademicStore()
  const {
    schoolResults,
    getSchools,
    toggleChecked,
    setAllSchools,
    allSchools,
    selectedSchools,
    reshuffleSchools,
  } = SchoolStore()

  const { query, setQuery } = NavStore()
  const { setMessage } = MessageStore()
  const [isActive, setPlace] = useState(false)
  const [url, setUrl] = useState('')
  const field = 'currentSchoolName'
  const slideResidence = () => {
    setPlace((e) => !e)
  }

  useEffect(() => {
    if (isActive && countries.length === 0) {
      reshuffleResults()
      getCountries('/places/countries/?page_size=300&field=country')
    }
  }, [isActive])

  useEffect(() => {
    reshuffleStates()
    reshuffleSchools()
  }, [selectedCountries])

  useEffect(() => {
    const countryNames = selectedCountries.map((country) => country.country)
    const levels = selectedItems.map((item) => item.levelName)
    const levelNamesQuery =
      levels.length > 0
        ? `&levelName=${encodeURIComponent(levels.join(','))}`
        : ''

    const stateNames =
      selectedCountries.length > 1
        ? []
        : selectedStates.map((state) => state.state)

    const url =
      stateNames.length > 0
        ? `/schools/?page_size=200&country[in]=${encodeURIComponent(
            countryNames.join(',')
          )}&state[in]=${encodeURIComponent(
            stateNames.join(',')
          )}${levelNamesQuery}`
        : countryNames.length > 0
        ? `/schools/?page_size=200&country[in]=${encodeURIComponent(
            countryNames.join(',')
          )}${levelNamesQuery}`
        : `/schools/?page_size=200${levelNamesQuery}`

    if (countryNames.length > 0) {
      getSchools(url, setMessage)
    }
  }, [selectedCountries, selectedStates, selectedItems])

  useEffect(() => {
    const uniqueSchools = new Set()
    selectedSchools.forEach((el) => uniqueSchools.add(el.name))
    const newUrl = Array.from(uniqueSchools).join(',')

    setUrl(`${field}=${newUrl}&`)
    if (selectedSchools.length === 0) {
      setUrl('')
    }
  }, [selectedSchools])

  useEffect(() => {
    const newSchoolUrl = addQuery(query, field, url)
    setQuery(newSchoolUrl)
  }, [url])

  return (
    <div className="search_set">
      <div className="search_set_title" onClick={slideResidence}>
        School of Study
        <i
          className={`bi bi-caret-down-fill ml-auto ${
            isActive ? 'active' : ''
          }`}
        ></i>
      </div>

      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: isActive ? 'auto' : 0, opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className="search_section">
          <div className="search_set_subtitle">Schools</div>
          {countries.length === 0 ? (
            <div className="flex items-center h-10 justify-center flex-wrap w-full">
              <i
                className={`bi  bi-opencollective loading  text-md text-[var(--custom-color)]`}
              ></i>
            </div>
          ) : (
            <div className="flex flex-col overflow-auto max-h-[200px]">
              <div
                onClick={() => setAllSchools()}
                className="checkbox_container text-nowrap"
              >
                <div className={`check_box mr-2 ${allSchools ? 'active' : ''}`}>
                  {allSchools && <i className="bi bi-check"></i>}
                </div>
                All
              </div>
              {schoolResults.map((item, index) => (
                <div
                  onClick={() => toggleChecked(index)}
                  key={index}
                  className="checkbox_container text-nowrap py-2"
                >
                  <div
                    className={`check_box mr-2 ${
                      item.isChecked ? 'active' : ''
                    }`}
                  >
                    {item.isChecked && <i className="bi bi-check"></i>}
                  </div>
                  {item.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
