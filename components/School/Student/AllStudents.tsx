'use client'
import PageTitle from '@/components/PageTitle'
import { MessageStore } from '@/src/zustand/notification/Message'
import OfficeStore, { Office } from '@/src/zustand/utility/Office'
import { useParams, usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import StudentStore from '@/src/zustand/school/Student'
import SchoolStore from '@/src/zustand/school/School'
import _debounce from 'lodash/debounce'
import Image from 'next/image'
import LinkedPagination from '@/components/Team/LinkedPagination'
import Link from 'next/link'
import { Send, Trash2, UserPlus, UserPlus2 } from 'lucide-react'
import SendMessage from '../SendMessageBox'
import NotificationTemplateStore from '@/src/zustand/notification/NotificationTemplate'
import SchoolPositions from '../Staff/SchoolPositions'

export default function AllStudents() {
  const {
    students,
    searchedStudents,
    selectedStudents,
    loadingOffice,
    currentPage,
    count,
    page_size,
    setDisplayedDivision,
    reshuffleStudents,
    searchStudent,
    toggleChecked,
    getStudents,
    updateStudent,
  } = StudentStore()
  const { setMessage } = MessageStore()
  const { officeForm } = OfficeStore()
  const { schoolData, staffPositions } = SchoolStore()
  const { formData } = NotificationTemplateStore()
  const [levelIndex, setLevelIndex] = useState({ index: 0, isActive: false })
  const [selectedClass, setClass] = useState({ name: '', level: 0 })
  const [isStudentList, setStudentList] = useState(false)
  const [displayBox, setDisplayBox] = useState(false)
  const [displayPositions, setDisplayPositions] = useState(false)
  const [query, setQuery] = useState('')
  const pathname = usePathname()
  const inputRef = useRef<HTMLInputElement>(null)
  const { page } = useParams()
  const url = '/offices'

  useEffect(() => {
    if (!officeForm.username) return
    if (students.length === 0) {
      fetchStudents(1)
    }
    setQuery(`country=${officeForm.country}`)
  }, [officeForm])

  useEffect(() => {
    if (page && Number(page) > 0 && officeForm.country) {
      fetchStudents(Number(page))
    }
  }, [page, officeForm])

  const selectStudent = (student: Office) => {
    toggleChecked(student._id)
    setStudentList(false)
  }

  const fetchStudents = (page: number, level?: number, levelName?: string) => {
    getStudents(
      `${url}/?username=${officeForm.username}${
        level ? `&schoolLevel=${level}&schoolLevelName=${levelName}` : ''
      }&page_size=${page_size}&page=${page}&userType=Student`,
      setMessage
    )
  }

  const handleSearchStudent = _debounce(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (!value) {
        setStudentList(false)
        return
      }
      setStudentList(true)
      searchStudent(
        `${url}/search?usename=${officeForm.username}&bioUserUsername=${value}&bioUserDisplayName=${value}&page_size=${page_size}&userType=Student`
      )
    },
    1000
  )

  const handleSubmit = () => {
    const form = {}
    updateStudent(
      `/offices/assign-subjects/?page_size=${page_size}&isUserActive=true&page=${currentPage}&username=${officeForm.username}&userType=Student`,
      form,
      setMessage,
      () => {
        reshuffleStudents()
        setDisplayedDivision(false)
      }
    )
  }

  const handleSendMessage = () => {
    if (selectedStudents.length === 0) {
      setMessage('Please select at least one staff to send message', false)
      setDisplayBox(false)
      return
    }
    const form = {
      selectedStudents: selectedStudents,
      message: formData,
      officeUsername: officeForm.username,
    }
    updateStudent(`/messages/send`, form, setMessage, () =>
      setDisplayBox(false)
    )
  }

  const handleSetPositions = () => {
    if (selectedStudents.length === 0) {
      setMessage('Please select at least one staff to assign role to', false)
      setDisplayPositions(false)
      return
    }

    if (staffPositions.length === 0) {
      setMessage('Please select at least one role to assign', false)
      setDisplayPositions(false)
      return
    }

    const form = {
      selectedStudents: selectedStudents,
      selectedClass: staffPositions[0],
    }

    updateStudent(
      `/offices/assign-class/?page_size=${page_size}&page=${currentPage}&isUserActive=true&page=${currentPage}&username=${officeForm.username}&userType=Student`,
      form,
      setMessage,
      () => {
        reshuffleStudents()
        setDisplayPositions(false)
      }
    )
  }

  return (
    <>
      <PageTitle page="Students:" title={officeForm.name} />

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
                    fetchStudents(page ? Number(page) : 1)
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
                      fetchStudents(
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
              onChange={handleSearchStudent}
              className={`transparent-input flex-1 `}
              placeholder="Search student"
            />
            {loadingOffice ? (
              <i className="bi bi-opencollective common-icon loading"></i>
            ) : (
              <i className="bi bi-search common-icon cursor-pointer"></i>
            )}
          </div>

          {searchedStudents.length > 0 && isStudentList && (
            <div
              className={`dropdownList ${
                isStudentList && searchedStudents.length > 0
                  ? 'overflow-auto'
                  : 'overflow-hidden h-0'
              }`}
            >
              {searchedStudents.map((item, index) => (
                <div key={index} className="input_drop_list">
                  <Link
                    href={`/school/students/student/${item.bioUserUsername}`}
                    className="flex-1"
                  >
                    {item.bioUserDisplayName}: {item.schoolLevelName}{' '}
                    {item.schoolLevel}
                  </Link>
                  <UserPlus2
                    onClick={() => selectStudent(item)}
                    className="text-[var(--custom)]"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap mb-6">
          {selectedStudents.map((item, index) => (
            <div
              className="bg-[var(--secondary)] relative mb-2 py-1 px-2 mr-3"
              key={index}
            >
              <div
                onClick={() => toggleChecked(item._id)}
                className="absolute w-5 h-5 rounded-full flex items-center justify-center cursor-pointer -top-1 -right-1 bg-[var(--custom)]"
              >
                <i className="bi bi-trash text-white text-sm"></i>
              </div>
              {item.bioUserDisplayName}
            </div>
          ))}
        </div>
        <div className="overflow-auto mb-5">
          {students.length > 0 ? (
            <table className="">
              <thead>
                <tr>
                  <th>SN</th>
                  <th>Picture</th>
                  <th>Name</th>
                  <th>Level</th>
                  <th>Arm</th>
                </tr>
              </thead>
              <tbody>
                {students.map((item, index) => (
                  <tr
                    onClick={() => {
                      if (pathname.includes('/school/staff')) {
                        toggleChecked(item._id)
                      }
                    }}
                    key={index}
                    className={`${
                      index % 2 === 1 ? 'bg-[var(--white-gray)]' : ''
                    }`}
                  >
                    <td>
                      <div className="relative flex items-center">
                        <div
                          className={`checkbox ${
                            item.isChecked ? 'active' : ''
                          }`}
                          onClick={() => toggleChecked(item._id)}
                        >
                          {item.isChecked && (
                            <i className="bi bi-check text-white text-lg"></i>
                          )}
                        </div>
                        {(Number(page ? page : 1) - 1) * page_size + index + 1}
                      </div>
                    </td>
                    <td className="py-2">
                      <div className="w-12 relative h-12 rounded-full overflow-hidden">
                        <Image
                          src={item.bioUserPicture}
                          alt="Profile Background"
                          fill
                          className="object-cover"
                          priority
                        />
                      </div>
                    </td>
                    <td>
                      <Link
                        className=" text-[var(--custom)]"
                        href={`/school/students/student/${item.bioUserUsername}`}
                      >
                        {item.bioUserDisplayName}
                      </Link>
                    </td>

                    <td>
                      {item.schoolLevelName} {item.schoolLevel}{' '}
                    </td>
                    <td>{item.arm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="relative flex justify-center">
              <div className="not_found_text">No Student Found</div>

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
          url={`/school/students`}
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
                  onClick={() => setDisplayedDivision(false)}
                >
                  Close
                </button>
              </>
            )}
          </div>
        )}

        {displayBox && (
          <SendMessage
            setDisplayBox={setDisplayBox}
            handleSubmit={handleSendMessage}
            action="Send Message"
          />
        )}
      </div>

      <div className="table-action bg-[var(--primary)] mt-4 p-3 flex flex-wrap">
        {loadingOffice ? (
          <button className="custom_btn">
            <i className="bi bi-opencollective loading"></i>
            Processing...
          </button>
        ) : (
          <>
            <button
              onClick={() => setDisplayBox(true)}
              className="flex items-center mr-5"
            >
              <Send className="h-5 w-5 text-[var(--custom)] mr-1" /> Send
              Message
            </button>
            <button
              onClick={() => setDisplayPositions(true)}
              className="flex items-center mr-5"
            >
              <UserPlus className="h-5 w-5 text-[var(--custom)] mr-1" />
              Assign Role
            </button>

            <button className="flex items-center mr-5">
              <Trash2 className="h-5 w-5 text-[var(--custom)] mr-1" />
              Delete
            </button>
          </>
        )}
      </div>
      {displayPositions && (
        <SchoolPositions
          setDisplayBox={setDisplayPositions}
          handleSubmit={handleSetPositions}
        />
      )}
    </>
  )
}
