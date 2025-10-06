'use client'
import QuillEditor from '@/components/Team/Editor/QuillEditor'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { MessageStore } from '@/src/zustand/notification/Message'
import CourseStore from '@/src/zustand/school/Courses'
import OfficeStore from '@/src/zustand/utility/Office'
import { useParams } from 'next/navigation'
import { useState } from 'react'

export default function Scheme() {
  const { setMessage } = MessageStore()
  const { officeForm } = OfficeStore()
  const { page } = useParams()
  const [isClass, setClass] = useState(false)
  const {
    subject,
    page_size,
    loading,
    setIsScheme,
    updateSubject,
    setSubject,
  } = CourseStore()
  const url = '/courses/staff-subjects/'

  const handleSubmit = () => {
    const inputsToValidate = [
      {
        name: 'schemeOfWork',
        value: subject.schemeOfWork,
        rules: { blank: true },
        field: 'Scheme of Work field',
      },
    ]

    const { messages } = validateInputs(inputsToValidate)
    const getFirstNonEmptyMessage = (
      messages: Record<string, string>
    ): string | null => {
      for (const key in messages) {
        if (messages[key].trim() !== '') {
          return messages[key]
        }
      }
      return null
    }

    const firstNonEmptyMessage = getFirstNonEmptyMessage(messages)
    if (firstNonEmptyMessage) {
      setMessage(firstNonEmptyMessage, false)
      return
    }

    const data = appendForm(inputsToValidate)
    const currentPage = page ? Number(page) : 1
    updateSubject(
      `${url}${subject._id}?officeUsername=${officeForm.username}&bioUserUsername=${officeForm.bioUserUsername}&page_size=${page_size}&page=${currentPage}`,
      data,
      setMessage,
      () => setIsScheme(false)
    )
  }
  return (
    <>
      <div
        onClick={() => setIsScheme(false)}
        className="fixed bg-black/50  w-full h-full flex items-center justify-center z-40 top-0 left-0"
      >
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          className="flex w-full max-w-[1200px]"
        >
          <div className="w-0 md:w-[290px]"></div>
          <div className="card_body w-full overflow-auto min-h-[300px] max-h-[100vh] sharp flex-1 border border-[var(--border)]">
            <div className="grid-2 grid-lay">
              <div className="relative">
                <label className="label flex items-center w-full" htmlFor="">
                  Subject Class
                </label>

                <div
                  onClick={() => {
                    setClass(!isClass)
                  }}
                  className="form-input cursor-pointer"
                >
                  {subject.levelName} {subject.level}
                </div>
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Subject
                </label>
                <div className="form-input">{subject.name}</div>
              </div>

              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Subject Code
                </label>
                <div className="form-input">{subject.subjectCode}</div>
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Curriculum
                </label>
                <div className="form-input">{subject.curriculumTitle}</div>
              </div>
            </div>

            <QuillEditor
              contentValue={subject.schemeOfWork}
              placeHolder="Write Scheme of Work"
              onChange={(e) => {
                setSubject('schemeOfWork', e)
              }}
            />
            {loading ? (
              <button className="custom_btn ">
                <i className="bi bi-opencollective loading"></i>

                <div>Processing...</div>
              </button>
            ) : (
              <div className="table-action flex flex-wrap">
                <button
                  className="custom_btn mr-3 success"
                  onClick={() => handleSubmit()}
                >
                  Submit
                </button>

                <button
                  className="custom_btn ml-auto"
                  onClick={() => setIsScheme(false)}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
