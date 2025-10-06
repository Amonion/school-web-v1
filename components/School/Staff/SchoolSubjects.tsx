'use client'
import LinkedPagination from '@/components/Team/LinkedPagination'
import { MessageStore } from '@/src/zustand/notification/Message'
import CourseStore, { Subject } from '@/src/zustand/school/Courses'
import SchoolStore from '@/src/zustand/school/School'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import OfficeStore from '@/src/zustand/utility/Office'
import Image from 'next/image'
import Link from 'next/link'
import _debounce from 'lodash/debounce'
import { useParams, usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import StaffStore from '@/src/zustand/school/Staff'

export default function SchoolSubjects() {
  const { setMessage } = MessageStore()
  const { officeForm } = OfficeStore()
  const { bioUserState } = AuthStore()
  const {
    subjects,
    page_size,
    count,
    loading,
    searchedSubjects,
    selectedSubjects,
    searchSubject,
    toggleActiveSubject,
    setSubject,
    deleteSubject,
    setDisplaySubjects,
    setIsSubject,
    reshuffleSubjects,
    toggleCheckedSubject,
    getSubject,
    getSubjects,
  } = CourseStore()
  const { schoolData } = SchoolStore()
  const { currentPage, loadingOffice, selectedItems, updateStaff } =
    StaffStore()
  const [query, setQuery] = useState('')
  const [levelIndex, setLevelIndex] = useState({ index: 0, isActive: false })
  const { page } = useParams()
  const pathname = usePathname()
  const [isSubjectList, setSubjectList] = useState(false)
  const [selectedClass, setClass] = useState({ name: '', level: 0 })
  const inputRef = useRef<HTMLInputElement>(null)
  const url = '/courses/subjects'
  let subjectLevel: string | null

  useEffect(() => {
    const query = window.location.search
    subjectLevel = new URLSearchParams(query).get('level')
    const name = new URLSearchParams(query).get('levelname')
    const max = new URLSearchParams(query).get('maxlevel')

    const initialize = async () => {
      if (subjectLevel !== null) {
        fetchSubjects(1)
        setSubject('maxLevel', Number(max))
        setSubject('level', Number(subjectLevel))
        setSubject('levelName', String(name))
      } else {
        const currentPage = Number(page)
        if (isNaN(currentPage)) {
          fetchSubjects(1)
        } else {
          fetchSubjects(currentPage)
        }
      }
      setQuery(`country=${officeForm.country}`)
    }
    if (officeForm.country) {
      initialize()
    }
  }, [officeForm])

  useEffect(() => {
    if (page && Number(page) > 0 && officeForm.country) {
      fetchSubjects(Number(page))
    }
  }, [page, officeForm])

  const selectSubject = (subject: Subject) => {
    toggleCheckedSubject(subject._id)
    setSubjectList(false)
  }

  const handleSearchSubject = _debounce(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (!value) {
        setSubjectList(false)
        return
      }
      setSubjectList(true)
      searchSubject(
        `${url}/?name=${value}&country=${officeForm.country}&state[in]=all,${officeForm.state}&schoolUsername[in]=all,${officeForm.username}&page_size=${page_size}`
      )
    },
    1000
  )

  const editItem = async (id: string, index: number) => {
    getSubject(`${url}/${id}`, setMessage, () => setIsSubject(true))
    toggleActiveSubject(index)
  }

  const fetchSubjects = (page: number, level?: number, levelName?: string) => {
    if (officeForm.username === 'Minister') {
      getSubjects(
        `${url}/?country=${officeForm.country}&state=all&page_size=${page_size}&page=${page}`,
        setMessage
      )
    } else if (officeForm.username === 'Commissioner') {
      getSubjects(
        `${url}/?country=${officeForm.country}&state[in]=all,${officeForm.state}&page_size=${page_size}&page=${page}`,
        setMessage
      )
    } else {
      getSubjects(
        `${url}/?country=${officeForm.country}${
          level ? `&level=${level}&levelName=${levelName}` : ``
        }&state[in]=all,${officeForm.state}&schoolUsername[in]=all,${
          officeForm.username
        }&page_size=${page_size}&page=${page}`,
        setMessage
      )
    }
  }

  const deleteItem = async (id: string) => {
    deleteSubject(`${url}/${id}`, setMessage, () => setIsSubject(false))
  }

  const handleSubmit = () => {
    if (selectedItems.length === 0) {
      setMessage('Please select at least a staff to assign subjects to', false)
      return
    }
    if (selectedSubjects.length === 0) {
      setMessage('Please select at least a subject to assign', false)
      return
    }

    const form = {
      selectedStaffs: selectedItems,
      selectedSubjects: selectedSubjects,
    }

    updateStaff(
      `/offices/assign-subjects/?page_size=${page_size}&isUserActive=true&page=${currentPage}&username=${officeForm.username}&userType=Staff`,
      form,
      setMessage,
      () => {
        reshuffleSubjects()
        setDisplaySubjects(false)
      }
    )
  }

  return (
    <>
      <div className="flex items-center flex-wrap mb-2">
        {schoolData.levels.map((item, index) => (
          <div key={index} className={`relative mr-1`}>
            <div
              onClick={() =>
                setLevelIndex({
                  index: index,
                  isActive: !levelIndex.isActive,
                })
              }
              key={index}
              className={`${
                index === levelIndex.index
                  ? 'text-white bg-[var(--custom)]'
                  : 'bg-[var(--primary)]'
              } flex items-center px-2 py-1 cursor-pointer  mr-3`}
            >
              {item.levelName}{' '}
              {item.levelName === selectedClass.name ? selectedClass.level : ''}
              <i className="bi bi-caret-down-fill ml-3"></i>
            </div>
            {levelIndex.index === index && levelIndex.isActive && (
              <div
                className={`dropdownList ${
                  levelIndex.index === index && levelIndex.isActive
                    ? 'overflow-auto'
                    : 'overflow-hidden h-0'
                }`}
              >
                <div
                  onClick={() => {
                    setLevelIndex({
                      index: index,
                      isActive: !levelIndex.isActive,
                    })
                    setClass({ name: '', level: 0 })
                    fetchSubjects(page ? Number(page) : 1)
                  }}
                  className="border-b last:border-b-0 cursor-pointer border-b-[var(--border)] p-2"
                >
                  <div className="">Clear Level</div>
                </div>
                {Array.from({ length: item.maxLevel }, (_, int) => (
                  <div
                    onClick={() => {
                      setLevelIndex({
                        index: index,
                        isActive: !levelIndex.isActive,
                      })
                      setClass({ name: item.levelName, level: int + 1 })
                      fetchSubjects(
                        page ? Number(page) : 1,
                        int + 1,
                        item.levelName
                      )
                    }}
                    key={int}
                    className="border-b last:border-b-0 cursor-pointer border-b-[var(--border)] p-2"
                  >
                    <div className="">
                      {item.levelName} {int + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="card_body sharp">
        <div className="relative mb-2">
          <div className={`input_wrap ml-auto active `}>
            <input
              ref={inputRef}
              type="search"
              onChange={handleSearchSubject}
              className={`transparent-input flex-1 `}
              placeholder="Search subject"
            />
            {loading ? (
              <i className="bi bi-opencollective common-icon loading"></i>
            ) : (
              <i className="bi bi-search common-icon cursor-pointer"></i>
            )}
          </div>

          {searchedSubjects.length > 0 && isSubjectList && (
            <div
              className={`dropdownList ${
                isSubjectList && searchedSubjects.length > 0
                  ? 'overflow-auto'
                  : 'overflow-hidden h-0'
              }`}
            >
              {searchedSubjects.map((item, index) => (
                <div
                  onClick={() => selectSubject(item)}
                  key={index}
                  className="input_drop_list"
                >
                  {item.levelName} {item.level}: {item.name}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap mb-6">
          {selectedSubjects.map((item, index) => (
            <div
              className="bg-[var(--secondary)] relative mb-2 py-1 px-2 mr-3"
              key={index}
            >
              <div
                onClick={() => toggleCheckedSubject(item._id)}
                className="absolute w-5 h-5 rounded-full flex items-center justify-center cursor-pointer -top-1 -right-1 bg-[var(--custom)]"
              >
                <i className="bi bi-trash text-sm"></i>
              </div>
              {item.levelName} {item.level} {item.name}
            </div>
          ))}
        </div>
        <div className="overflow-auto mb-5">
          {subjects.length > 0 ? (
            <table className="">
              <thead>
                <tr>
                  <th>SN</th>
                  <th>Class</th>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Content</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((item, index) => (
                  <tr
                    onClick={() => {
                      if (pathname.includes('/school/staff')) {
                        toggleCheckedSubject(item._id)
                      }
                    }}
                    key={index}
                    className={`${
                      index % 2 === 1 ? 'bg-[var(--white-gray)]' : ''
                    } ${
                      pathname.includes('/school/staff') ? 'cursor-pointer' : ''
                    }`}
                  >
                    <td>
                      <div className="relative flex items-center">
                        {(Number(page ? page : 1) - 1) * page_size + index + 1}
                        {item.schoolUsername ===
                          bioUserState?.activeOffice.username &&
                          bioUserState.activeOffice.position === 'Owner' && (
                            <i
                              onClick={() => toggleActiveSubject(index)}
                              className="bi bi-three-dots-vertical text-lg cursor-pointer"
                            ></i>
                          )}
                        {item.isActive && (
                          <div className="card_list">
                            <span
                              onClick={() => toggleActiveSubject(index)}
                              className="more_close "
                            >
                              X
                            </span>
                            <div
                              className="card_list_item"
                              onClick={() => editItem(item._id, index)}
                            >
                              Edit Subject
                            </div>

                            <div
                              className="card_list_item"
                              onClick={() => deleteItem(item._id)}
                            >
                              Delete Subject
                            </div>
                          </div>
                        )}
                      </div>
                    </td>

                    <td>
                      {item.levelName} {item.level}
                    </td>

                    <td>
                      {pathname.includes('/curriculum') ? (
                        <Link
                          className=" text-[var(--custom)]"
                          href={`/authority/curriculum/subject/${item._id}`}
                        >
                          {item.name}
                        </Link>
                      ) : (
                        <div className=" text-[var(--custom)]">{item.name}</div>
                      )}
                    </td>
                    <td>{item.subjectCode}</td>

                    <td>
                      <div
                        className="line-clamp-3 overflow-ellipsis"
                        dangerouslySetInnerHTML={{
                          __html: item.description,
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="relative flex justify-center">
              <div className="not_found_text">No Subject Found</div>

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
        </div>

        <LinkedPagination
          url={`/authority/curriculum`}
          count={count}
          page_size={page_size}
          query={query}
        />
        {pathname.includes('/school/staff') && (
          <div className="table-action flex flex-wrap mt-5">
            {loadingOffice ? (
              <button className="custom_btn">
                <i className="bi bi-opencollective loading"></i>
                Processing...
              </button>
            ) : (
              <>
                <button
                  className="custom_btn mr-3 success"
                  onClick={() => handleSubmit()}
                >
                  Submit
                </button>

                <button
                  className="custom_btn ml-auto"
                  onClick={() => setDisplaySubjects(false)}
                >
                  Close
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}
