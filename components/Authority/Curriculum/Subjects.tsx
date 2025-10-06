'use client'
import PageTitle from '@/components/PageTitle'
import LinkedPagination from '@/components/Team/LinkedPagination'
import { MessageStore } from '@/src/zustand/notification/Message'
import CourseStore from '@/src/zustand/school/Courses'
import OfficeStore from '@/src/zustand/utility/Office'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import CreateSubject from './CreateSubject'

export default function Subjects() {
  const { setMessage } = MessageStore()
  const { officeForm } = OfficeStore()
  const {
    subjects,
    subject,
    page_size,
    loading,
    isSubject,
    count,
    toggleActiveSubject,
    setSubject,
    deleteSubject,
    setIsSubject,
    reshuffleSubjects,
    getSubject,
    getSubjects,
  } = CourseStore()
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState<null | number>(null)
  const [levelName, setLevelName] = useState('')
  const [maxLevel, setMaxLevel] = useState<null | number>(null)
  const { page } = useParams()
  const url = '/courses/subjects'
  let subjectLevel: string | null

  useEffect(() => {
    if (subject._id) {
      reshuffleSubjects()
    }
  }, [subject])

  useEffect(() => {
    const query = window.location.search
    subjectLevel = new URLSearchParams(query).get('level')
    const name = new URLSearchParams(query).get('levelname')
    const max = new URLSearchParams(query).get('maxlevel')

    const initialize = async () => {
      if (subjectLevel !== null) {
        setLevel(Number(subjectLevel))
        setMaxLevel(Number(max))
        setLevelName(String(name))
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
      getSubjects(
        `${url}/?country=${officeForm.country}&page_size=${page_size}&page=${page}`,
        setMessage
      )
    }
  }, [page, officeForm])

  const editItem = async (id: string, index: number) => {
    getSubject(`${url}/${id}`, setMessage, () => setIsSubject(true))
    toggleActiveSubject(index)
  }

  const fetchSubjects = (page: number) => {
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
        `${url}/?country=${officeForm.country}&state[in]=all,${officeForm.state}&page_size=${page_size}&page=${page}`,
        setMessage
      )
    }
  }

  const deleteItem = async (id: string) => {
    deleteSubject(`${url}/${id}`, setMessage, () => setIsSubject(false))
  }

  const createSubject = async (index?: number) => {
    setSubject('country', officeForm.country)
    setSubject('levelName', levelName)
    setSubject('schoolUsername', officeForm.username)
    setIsSubject(true)
    if (index) {
      toggleActiveSubject(index)
      setSubject('maxLevel', Number(maxLevel))
    } else {
      setSubject('maxLevel', 0)
    }
  }

  return (
    <>
      <PageTitle page="Subjects:" title={officeForm.name} />

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
                  <th>Content</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((item, index) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 1 ? 'bg-[var(--white-gray)]' : ''
                    }`}
                  >
                    <td>
                      <div className="relative flex items-center">
                        {(Number(page ? page : 1) - 1) * page_size + index + 1}
                        {officeForm.username === 'Minister' &&
                        item.state === 'all' ? (
                          <i
                            onClick={() => toggleActiveSubject(index)}
                            className="bi bi-three-dots-vertical text-lg cursor-pointer"
                          ></i>
                        ) : (
                          officeForm.username === 'Commissioner' &&
                          item.state === officeForm.state && (
                            <i
                              onClick={() => toggleActiveSubject(index)}
                              className="bi bi-three-dots-vertical text-lg cursor-pointer"
                            ></i>
                          )
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

                    <td className=" text-[var(--custom)]">
                      {item.levelName} {item.level}
                    </td>

                    <td>
                      <Link href={`/authority/curriculum/subject/${item._id}`}>
                        {item.name}
                      </Link>
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
              <div className="not_found_text">No Curriculum Found</div>

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
      </div>

      {level && maxLevel && (
        <div className="card_body sharp mt-auto flex justify-end">
          {loading ? (
            <div className={`custom_btn neutral disabled`}>Processing</div>
          ) : (
            <div
              onClick={() => createSubject()}
              className={`custom_btn neutral`}
            >
              Create Subject
            </div>
          )}
        </div>
      )}

      {isSubject && <CreateSubject />}
    </>
  )
}
