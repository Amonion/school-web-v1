'use client'
import LinkedPagination from '@/components/Team/LinkedPagination'
import { MessageStore } from '@/src/zustand/notification/Message'
import CourseStore from '@/src/zustand/school/Courses'
import OfficeStore from '@/src/zustand/utility/Office'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import StaffStore from '@/src/zustand/school/Staff'
import Scheme from './Scheme'

export default function StaffSubjects() {
  const { setMessage } = MessageStore()
  const { officeForm } = OfficeStore()
  const {
    subjects,
    page_size,
    count,
    loading,
    isScheme,
    selectedSubjects,
    setSubject,
    setDisplaySubjects,
    setIsScheme,
    reshuffleSubjects,
    toggleCheckedSubject,
    getSubject,
    getSubjects,
  } = CourseStore()
  const { currentPage, loadingOffice, selectedItems, updateStaff } =
    StaffStore()
  const [query, setQuery] = useState('')
  const { page } = useParams()
  const pathname = usePathname()
  const url = '/courses/staff-subjects'
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

  const editItem = async (id: string) => {
    getSubject(`${url}/${id}`, setMessage, () => setIsScheme(true))
    setIsScheme(true)
  }

  const fetchSubjects = (page: number) => {
    getSubjects(
      `${url}/?officeUsername=${officeForm.username}&bioUserUsername=${officeForm.bioUserUsername}&page_size=${page_size}&page=${page}`,
      setMessage
    )
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
      <div className="card_body sharp">
        <div className="overflow-auto mb-5">
          {subjects.length > 0 ? (
            <table className="">
              <thead>
                <tr>
                  <th>SN</th>
                  <th>Class</th>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Scheme</th>
                  <th>Curriculum</th>
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
                        <i
                          onClick={() => editItem(item._id)}
                          className="bi bi-pen text-[14px] ml-2 cursor-pointer"
                        ></i>
                      </div>
                    </td>

                    <td>
                      {item.levelName} {item.level}
                    </td>

                    <td>
                      <Link
                        className=" text-[var(--custom)]"
                        href={`/school/curriculum/subject/${item._id}`}
                      >
                        {item.name}
                      </Link>
                    </td>
                    <td>{item.subjectCode}</td>

                    <td>
                      <div
                        className="line-clamp-3 overflow-ellipsis"
                        dangerouslySetInnerHTML={{
                          __html: item.schemeOfWork,
                        }}
                      />
                    </td>
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
            {loadingOffice || loading ? (
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
      {isScheme && <Scheme />}
    </>
  )
}
