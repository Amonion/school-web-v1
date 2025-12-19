'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useParams, usePathname } from 'next/navigation'
import React from 'react'
import { MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '../LinkedPagination'
import CreateCountry from './CreateCountry'
import AcademicStore, {
  AcademicLevel,
  AcademicLevelEmpty,
} from '@/src/zustand/school/Academic'

const AcademicLevelsTables: React.FC = () => {
  const url = '/academic-levels'
  const {
    isAllChecked,
    selectedItems,
    searchedLevels,
    loading,
    count,
    academicResults,
    isForm,
    searchLevel,
    getAcademics,
    toggleAllSelected,
    toggleChecked,
    resetForm,
    showForm,
    reshuffleResults,
  } = AcademicStore()
  const { page } = useParams()
  const [page_size] = useState(20)
  const [sort] = useState('level')
  const { setMessage } = MessageStore()
  const pathname = usePathname()
  const inputRef = useRef<HTMLInputElement>(null)
  const params = `?country=&page_size=${
    page_size ? page_size : 1
  }&page=${page}&ordering=${sort}`

  useEffect(() => {
    reshuffleResults()
  }, [pathname])

  useEffect(() => {
    getAcademics(`${url}${params}`, setMessage)
  }, [page])

  const selectLevel = (a: AcademicLevel) => {
    resetForm(a)
    showForm(true)
  }

  const DeleteItems = async () => {
    if (selectedItems.length === 0) {
      setMessage('Please select at least one country to delete', false)
      return
    }
    // await massDeleteCountries(
    //   `${url}mass-delete/`,
    //   selectedCountries,
    //   setMessage
    // )
  }

  const handleSearchCountry = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.trim().length > 0) {
      searchLevel(
        `${url}/search?author=${value}&content=${value}&title=${value}&subtitle=${value}&page_size=${page_size}`
      )
    } else {
      AcademicStore.setState({ searchedLevels: [] })
    }
  }

  return (
    <>
      <div className="card_body sharp mb-5">
        <div className="text-lg text-[var(--text-secondary)]">
          Table of Levels
        </div>
        <div className="relative mb-2">
          <div className={`input_wrap ml-auto active `}>
            <input
              ref={inputRef}
              type="search"
              onChange={handleSearchCountry}
              className={`transparent-input flex-1 `}
              placeholder="Search levels"
            />
            {loading ? (
              <i className="bi bi-opencollective common-icon loading"></i>
            ) : (
              <i className="bi bi-search common-icon cursor-pointer"></i>
            )}
          </div>

          {searchedLevels.length > 0 && (
            <div
              className={`dropdownList ${
                searchedLevels.length > 0
                  ? 'overflow-auto'
                  : 'overflow-hidden h-0'
              }`}
            >
              {searchedLevels.map((item, index) => (
                <div key={index} className="input_drop_list">
                  <Link
                    href={`/school/students/student/${item._id}`}
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

      {academicResults.length > 0 ? (
        <table>
          <thead className="bg-[var(--primary)]">
            <tr>
              <th>
                <div className="flex items-center">
                  <div
                    onClick={toggleAllSelected}
                    className={`checkbox ${isAllChecked ? 'active' : ''}`}
                  >
                    {isAllChecked && (
                      <i className="bi bi-check text-white text-lg"></i>
                    )}
                  </div>
                  S/N
                </div>
              </th>
              <th>Name</th>
              <th>Certificate</th>
              <th>Max Level</th>
              <th>Level</th>
            </tr>
          </thead>
          <tbody>
            {academicResults.map((item, index) => (
              <tr
                key={index}
                className={`${index % 2 === 1 ? 'bg-[var(--primary)]' : ''}`}
              >
                <td>
                  <div className="flex items-center">
                    <div
                      className={`checkbox ${item.isChecked ? 'active' : ''}`}
                      onClick={() => toggleChecked(index)}
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
                    onClick={() => selectLevel(item)}
                    className="cursor-pointer"
                  >
                    {item.levelName}
                  </div>
                </td>
                <td>{item.certificateName}</td>
                <td>{item.maxLevelName}</td>
                <td>{item.level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="relative flex justify-center">
          <div className="not_found_text">No Academic Level Found</div>
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
          <div className="grid mr-auto grid-cols-4 gap-2 w-[160px]">
            <div onClick={toggleAllSelected} className="tableActions">
              <i
                className={`bi bi-check2-all ${
                  isAllChecked ? 'text-[var(--custom)]' : ''
                }`}
              ></i>
            </div>

            <div onClick={DeleteItems} className="tableActions">
              <i className="bi bi-trash"></i>
            </div>

            <div
              onClick={() => selectLevel(AcademicLevelEmpty)}
              className="tableActions"
            >
              <i className="bi bi-plus-circle"></i>
            </div>
            {/* <div onClick={updateExam} className="tableActions">
              <i className="bi bi-table"></i>
            </div> */}
          </div>
        </div>
      </div>

      {isForm && <CreateCountry />}

      <div className="card_body sharp">
        <LinkedPagination url="/team/places" count={count} page_size={20} />
      </div>
    </>
  )
}

export default AcademicLevelsTables
