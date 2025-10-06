'use client'
import { NavStore } from '@/src/zustand/msgStore'
import { useEffect, useState } from 'react'
import CountryStore from '@/src/zustand/team/Country'
import StateStore from '@/src/zustand/team/State'
import { motion } from 'framer-motion'
import { addQuery } from '@/lib/helpers'

export default function CountryTab() {
  const {
    countries,
    getCountries,
    toggleCheckedCountry,
    selectedCountries,
    allCountries,
    setAllCountries,
    reshuffleResults,
  } = CountryStore()

  const {
    states,
    getStates,
    toggleCheckedState,
    selectedStates,
    reshuffleStates,
    allStates,
    setAllStates,
  } = StateStore()

  const { tab, query, setQuery } = NavStore()
  const [isActive, setPlace] = useState(false)
  const [url, setUrl] = useState('')
  const [stateUrl, setStateUrl] = useState('')
  const field = 'examCountries'
  const slideResidence = () => {
    setPlace((e) => !e)
  }

  useEffect(() => {
    reshuffleResults()
  }, [tab])

  useEffect(() => {
    if (isActive && countries.length === 0) {
      reshuffleResults()
      getCountries('/places/countries/?page_size=300&field=country')
    }
  }, [isActive])

  useEffect(() => {
    if (selectedCountries.length === 1) {
      reshuffleStates()
      getStates(
        `/places/state/?country=${selectedCountries[0].country}&page_size=300&field=state`
      )
    }
  }, [selectedCountries])

  useEffect(() => {
    const uniqueLevels = new Set()
    selectedCountries.forEach((el) => uniqueLevels.add(el.country))
    const newUrl = Array.from(uniqueLevels).join(',')

    setUrl(`${field}=${newUrl}&`)
    if (selectedCountries.length === 0) {
      setUrl('')
    }
  }, [selectedCountries])

  useEffect(() => {
    const uniqueLevels = new Set()
    selectedStates.forEach((el) => uniqueLevels.add(el.state))
    const newUrl = Array.from(uniqueLevels).join(',')

    setStateUrl(`examStates=${newUrl}&`)
    if (
      selectedStates.length === 0 ||
      selectedStates.length === states.length
    ) {
      setStateUrl('')
    }
  }, [selectedStates])

  useEffect(() => {
    const newCountryUrl = addQuery(query, field, url)
    setQuery(newCountryUrl)
  }, [url])

  useEffect(() => {
    const newStateUrl = addQuery(query, 'examStates', stateUrl)
    setQuery(newStateUrl)
  }, [stateUrl])

  return (
    <div className="search_set">
      <div className="search_set_title" onClick={slideResidence}>
        Place {tab === 'people' ? 'of Residence' : ''}{' '}
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
          <div className="search_set_subtitle">Countries</div>
          {countries.length === 0 ? (
            <div className="flex items-center h-10 justify-center flex-wrap w-full">
              <i
                className={`bi  bi-opencollective loading  text-md text-[var(--custom-color)]`}
              ></i>
            </div>
          ) : (
            <div className="flex items-center overflow-auto pb-2 custom-scrollbar">
              <div
                onClick={() => setAllCountries()}
                className="checkbox_container text-nowrap"
              >
                <div
                  className={`check_box mr-2 ${allCountries ? 'active' : ''}`}
                >
                  {allCountries && <i className="bi bi-check"></i>}
                </div>
                All
              </div>
              {countries.map((item, index) => (
                <div
                  onClick={() => toggleCheckedCountry(index)}
                  key={index}
                  className="checkbox_container text-nowrap"
                >
                  <div
                    className={`check_box mr-2 ${
                      item.isChecked ? 'active' : ''
                    }`}
                  >
                    {item.isChecked && <i className="bi bi-check"></i>}
                  </div>
                  {item.country}
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedCountries.length === 1 && (
          <div className="search_section">
            <div className="search_set_subtitle">States</div>
            {states.length === 0 ? (
              <div className="flex items-center h-10 justify-center flex-wrap w-full">
                <i
                  className={`bi  bi-opencollective loading  text-md text-[var(--custom-color)]`}
                ></i>
              </div>
            ) : (
              <div className="flex items-center overflow-auto pb-2 custom-scrollbar">
                <div
                  onClick={() => setAllStates()}
                  className="checkbox_container text-nowrap"
                >
                  <div
                    className={`check_box mr-2 ${allStates ? 'active' : ''}`}
                  >
                    {allStates && <i className="bi bi-check"></i>}
                  </div>
                  All
                </div>
                {states.map((item, index) => (
                  <div
                    onClick={() => toggleCheckedState(index)}
                    key={index}
                    className="checkbox_container text-nowrap"
                  >
                    <div
                      className={`check_box mr-2 ${
                        item.isChecked ? 'active' : ''
                      }`}
                    >
                      {item.isChecked && <i className="bi bi-check"></i>}
                    </div>
                    {item.state}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
