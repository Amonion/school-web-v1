'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useParams, usePathname } from 'next/navigation'
import React from 'react'
import { MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '../LinkedPagination'
import StateStore, { State, StateEmpty } from '@/src/zustand/place/StateOrigin'
import CreateState from './CreateState'

const StatesTable: React.FC = () => {
  const url = '/places/state'
  const {
    states,
    isAllStatesChecked,
    count,
    selectedStates,
    searchedStates,
    loadingStates,
    isStateForm,
    toggleAllSelectedState,
    // updateItem,
    searchState,
    showStateForm,
    toggleCheckedState,
    massDeleteStates,
    getStates,
    reshuffleStates,
    resetForm,
  } = StateStore()
  const { page, country } = useParams()
  const [page_size] = useState(20)
  const [sort] = useState('state')
  const { setMessage } = MessageStore()
  const pathname = usePathname()
  const inputRef = useRef<HTMLInputElement>(null)
  const params = `?country=${country}&page_size=${page_size}&page=${
    page ? page : 1
  }&sort=${sort}&field=state`

  useEffect(() => {
    reshuffleStates()
  }, [pathname])

  useEffect(() => {
    getStates(`${url}${params}`, setMessage)
  }, [page])

  const selectState = (state: State) => {
    resetForm(state)
    showStateForm(true)
  }

  const DeleteItems = async () => {
    if (selectedStates.length === 0) {
      setMessage('Please select at least one state to delete', false)
      return
    }
    await massDeleteStates(`${url}mass-delete/`, selectedStates, setMessage)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.trim().length > 0) {
      searchState(
        `${url}/search?author=${value}&content=${value}&title=${value}&subtitle=${value}&page_size=${page_size}`
      )
    } else {
      StateStore.setState({ searchedStates: [] })
    }
  }

  // const cleanPlaces = ()=>{
  //   updateItem(`/places/clean`, {}, setMessage)
  // }
  return (
    <>
      <div className="card_body sharp mb-5">
        <div className="text-lg text-[var(--text-secondary)]">
          Table of States
        </div>
        <div className="relative mb-2">
          <div className={`input_wrap ml-auto active `}>
            <input
              ref={inputRef}
              type="search"
              onChange={handleSearch}
              className={`transparent-input flex-1 `}
              placeholder="Search states"
            />
            {loadingStates ? (
              <i className="bi bi-opencollective common-icon loading"></i>
            ) : (
              <i className="bi bi-search common-icon cursor-pointer"></i>
            )}
          </div>

          {searchedStates.length > 0 && (
            <div
              className={`dropdownList ${
                searchedStates.length > 0
                  ? 'overflow-auto'
                  : 'overflow-hidden h-0'
              }`}
            >
              {searchedStates.map((item, index) => (
                <div key={index} className="input_drop_list">
                  <Link
                    href={`/school/students/student/${item.id}`}
                    className="flex-1"
                  >
                    {item.country}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {states.length > 0 ? (
        <table>
          <thead className="bg-[var(--primary)]">
            <tr>
              <th>
                <div className="flex items-center">
                  <div
                    onClick={toggleAllSelectedState}
                    className={`checkbox ${isAllStatesChecked ? 'active' : ''}`}
                  >
                    {isAllStatesChecked && (
                      <i className="bi bi-check text-white text-lg"></i>
                    )}
                  </div>
                  S/N
                </div>
              </th>
              <th>State</th>
              <th>Capital</th>
              <th>Country</th>
            </tr>
          </thead>
          <tbody>
            {states.map((item, index) => (
              <tr
                key={index}
                className={`${index % 2 === 1 ? 'bg-[var(--primary)]' : ''}`}
              >
                <td>
                  <div className="flex items-center">
                    <div
                      className={`checkbox ${item.isChecked ? 'active' : ''}`}
                      onClick={() => toggleCheckedState(index)}
                    >
                      {item.isChecked && (
                        <i className="bi bi-check text-white text-lg"></i>
                      )}
                    </div>
                    {(page ? Number(page) - 1 : 0) * page_size + index + 1}
                  </div>
                </td>
                <td>
                  <div
                    onClick={() => selectState(item)}
                    className="cursor-pointer"
                  >
                    {item.state}
                  </div>
                </td>
                <td>{item.stateCapital}</td>
                <td>{item.country}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="relative flex justify-center">
          <div className="not_found_text">No State Found</div>
          <Image
            className="max-w-[300px]"
            alt={`no record`}
            src="/images/not-found.png"
            width={0}
            sizes="100vw"
            height={0}
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
      )}

      <div className="card_body sharp my-3">
        <div className="flex flex-wrap items-center">
          <div className="flex mr-auto gap-2 items-center">
            <div onClick={toggleAllSelectedState} className="tableActions">
              <i
                className={`bi bi-check2-all ${
                  isAllStatesChecked ? 'text-[var(--custom)]' : ''
                }`}
              ></i>
            </div>

            <div onClick={DeleteItems} className="tableActions">
              <i className="bi bi-trash"></i>
            </div>

            <div
              onClick={() => selectState(StateEmpty)}
              className="tableActions"
            >
              <i className="bi bi-plus-circle"></i>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Link
              href={`/team/places/banks/${country}/1`}
              className="tableActions"
            >
              <i className="bi bi-bank"></i>
            </Link>
            <Link
              href={`/team/places/documents/${country}/1`}
              className="tableActions"
            >
              <i className="bi bi-file-earmark-text"></i>
            </Link>
            <Link
              href={`/team/places/payments/${country}/1`}
              className="tableActions"
            >
              <i className="bi bi-credit-card"></i>
            </Link>
            <Link
              href={`/team/places/ads/${country}/1`}
              className="tableActions"
            >
              <i className="bi bi-megaphone"></i>
            </Link>
            <Link
              href={`/team/places/academic-levels/${country}/1`}
              className="tableActions"
            >
              <i className="bi bi-bar-chart-line"></i>
            </Link>
          </div>
        </div>
      </div>

      {isStateForm && <CreateState />}

      <div className="card_body sharp">
        <LinkedPagination
          url={`/team/places/states/${country}`}
          count={count}
          page_size={20}
        />
      </div>
    </>
  )
}

export default StatesTable
