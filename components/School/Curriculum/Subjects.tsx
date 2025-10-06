'use client'
import CreateSubject from '@/components/Authority/Curriculum/CreateSubject'
import PageTitle from '@/components/PageTitle'
import { MessageStore } from '@/src/zustand/notification/Message'
import CourseStore from '@/src/zustand/school/Courses'
import OfficeStore from '@/src/zustand/utility/Office'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import SchoolSubjects from '../Staff/SchoolSubjects'

export default function Subjects() {
  const { setMessage } = MessageStore()
  const { officeForm } = OfficeStore()
  const {
    subject,
    page_size,
    loading,
    isSubject,
    toggleActiveSubject,
    setSubject,
    setIsSubject,
    reshuffleSubjects,
    getSubjects,
  } = CourseStore()
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
        `${url}/?country=${officeForm.country}&state[in]=all,${officeForm.state}&schoolUsername[in]=all,${officeForm.username}&page_size=${page_size}&page=${page}`,
        setMessage
      )
    }
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

      <SchoolSubjects />

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
